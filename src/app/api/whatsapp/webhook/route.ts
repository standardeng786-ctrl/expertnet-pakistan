import { NextRequest, NextResponse } from "next/server";
import { createServiceRoleSupabase } from "@/lib/supabase/server";

// GET — Meta's webhook verification handshake.
// Configure this exact URL + WHATSAPP_WEBHOOK_VERIFY_TOKEN in the Meta App dashboard.
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const mode = searchParams.get("hub.mode");
  const token = searchParams.get("hub.verify_token");
  const challenge = searchParams.get("hub.challenge");

  if (mode === "subscribe" && token === process.env.WHATSAPP_WEBHOOK_VERIFY_TOKEN) {
    return new NextResponse(challenge ?? "", { status: 200 });
  }
  return new NextResponse("Forbidden", { status: 403 });
}

// POST — incoming messages and message-status updates from Meta.
// Uses the service-role client because this runs with no end-user session,
// but only ever touches the whatsapp_* tables.
export async function POST(request: NextRequest) {
  const supabase = createServiceRoleSupabase();
  const payload = await request.json();

  try {
    const entries = payload.entry ?? [];
    for (const entry of entries) {
      for (const change of entry.changes ?? []) {
        const value = change.value;

        // Incoming user messages
        for (const message of value.messages ?? []) {
          const phone = `+${message.from}`;
          const contact = await upsertContact(supabase, phone, value.contacts?.[0]?.profile?.name);
          const conversation = await ensureConversation(supabase, contact.id);

          // Consent: an inbound "STOP"/"UNSUBSCRIBE" reply opts the contact out immediately.
          const text = message.text?.body?.trim().toLowerCase();
          if (text === "stop" || text === "unsubscribe") {
            await supabase
              .from("whatsapp_contacts")
              .update({ consent_status: "opted_out", opted_out_at: new Date().toISOString() })
              .eq("id", contact.id);
          } else if (contact.consent_status === "unknown") {
            // A user-initiated inbound message is treated as implicit opt-in for two-way conversation
            // (not for marketing broadcast — campaigns still require explicit opted_in status set by policy).
          }

          await supabase.from("whatsapp_messages").insert({
            conversation_id: conversation.id,
            direction: "inbound",
            wa_message_id: message.id,
            body: message.text?.body ?? null,
            media_url: message.image?.id ?? message.document?.id ?? null,
            status: "received",
          });
        }

        // Delivery/read/failed status updates for messages we sent
        for (const status of value.statuses ?? []) {
          await supabase
            .from("whatsapp_messages")
            .update({ status: status.status })
            .eq("wa_message_id", status.id);
        }
      }
    }
  } catch (err) {
    console.error("WhatsApp webhook processing error:", err);
    // Still return 200 so Meta does not retry-storm a payload we've already partially processed.
  }

  return NextResponse.json({ received: true });
}

async function upsertContact(supabase: any, phone: string, name?: string) {
  const { data: existing } = await supabase
    .from("whatsapp_contacts")
    .select("*")
    .eq("phone_e164", phone)
    .maybeSingle();

  if (existing) return existing;

  const { data: created } = await supabase
    .from("whatsapp_contacts")
    .insert({ phone_e164: phone, display_name: name ?? null, source: "whatsapp_inbound" })
    .select()
    .single();

  return created;
}

async function ensureConversation(supabase: any, contactId: string) {
  const { data: existing } = await supabase
    .from("whatsapp_conversations")
    .select("*")
    .eq("contact_id", contactId)
    .eq("status", "open")
    .maybeSingle();

  if (existing) return existing;

  const { data: created } = await supabase
    .from("whatsapp_conversations")
    .insert({ contact_id: contactId, status: "open", last_message_at: new Date().toISOString() })
    .select()
    .single();

  return created;
}

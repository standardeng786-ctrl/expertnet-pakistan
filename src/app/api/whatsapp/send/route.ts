import { NextRequest, NextResponse } from "next/server";
import { createServerSupabase, createServiceRoleSupabase } from "@/lib/supabase/server";

// POST /api/whatsapp/send
// Body: { contactId: string, templateName?: string, text?: string }
// Sends via the official Meta WhatsApp Business Cloud API only.
// The Meta access token never leaves the server.
export async function POST(request: NextRequest) {
  const supabase = createServerSupabase();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  // Only admin/company staff may send — enforced again here even though RLS
  // also restricts the whatsapp_* tables, because this route uses the
  // service-role client to call Meta on the user's behalf.
  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if (!profile || !["admin", "company"].includes(profile.role)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { contactId, templateName, text } = await request.json();
  const admin = createServiceRoleSupabase();

  const { data: contact } = await admin
    .from("whatsapp_contacts")
    .select("*")
    .eq("id", contactId)
    .single();

  if (!contact) {
    return NextResponse.json({ error: "Contact not found" }, { status: 404 });
  }

  // Compliance gate: template/campaign sends require explicit opt-in.
  // One-off replies inside an already-open conversation are allowed regardless,
  // matching Meta's 24-hour customer-service-window rules.
  if (templateName && contact.consent_status !== "opted_in") {
    return NextResponse.json(
      { error: "Contact has not opted in to marketing messages" },
      { status: 409 }
    );
  }

  const body = templateName
    ? {
        messaging_product: "whatsapp",
        to: contact.phone_e164.replace("+", ""),
        type: "template",
        template: { name: templateName, language: { code: "en" } },
      }
    : {
        messaging_product: "whatsapp",
        to: contact.phone_e164.replace("+", ""),
        type: "text",
        text: { body: text },
      };

  const metaRes = await fetch(
    `https://graph.facebook.com/v20.0/${process.env.WHATSAPP_PHONE_NUMBER_ID}/messages`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.WHATSAPP_ACCESS_TOKEN}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    }
  );

  const metaData = await metaRes.json();

  if (!metaRes.ok) {
    return NextResponse.json({ error: metaData }, { status: 502 });
  }

  const { data: conversation } = await admin
    .from("whatsapp_conversations")
    .select("*")
    .eq("contact_id", contact.id)
    .eq("status", "open")
    .maybeSingle();

  await admin.from("whatsapp_messages").insert({
    conversation_id: conversation?.id,
    direction: "outbound",
    wa_message_id: metaData.messages?.[0]?.id,
    body: text ?? `[template: ${templateName}]`,
    status: "sent",
  });

  return NextResponse.json({ success: true, meta: metaData });
}

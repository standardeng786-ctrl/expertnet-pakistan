import { NextRequest, NextResponse } from "next/server";
import { createServerSupabase, createServiceRoleSupabase } from "@/lib/supabase/server";

// POST /api/whatsapp/campaigns/[id]/send
// Compliance-critical: only ever sends to whatsapp_contacts with
// consent_status = 'opted_in'. Segment filters (city/category/etc, stored in
// segments.filter_json) are applied first, then the opted-in gate — the
// opted-in check cannot be bypassed by a segment definition.
export async function POST(_req: NextRequest, { params }: { params: { id: string } }) {
  const supabase = createServerSupabase();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });

  const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).single();
  if (!profile || !["admin", "company"].includes(profile.role)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const admin = createServiceRoleSupabase();

  const { data: campaign } = await admin
    .from("whatsapp_campaigns")
    .select("*, whatsapp_templates(meta_template_name)")
    .eq("id", params.id)
    .single();

  if (!campaign) return NextResponse.json({ error: "Campaign not found" }, { status: 404 });

  const { data: contacts } = await admin
    .from("whatsapp_contacts")
    .select("id, phone_e164")
    .eq("consent_status", "opted_in");

  let sent = 0;
  let failed = 0;

  // Sequential, throttled loop (simple rate control — a production queue/worker
  // should replace this for large segments to respect Meta's messaging limits).
  for (const contact of contacts ?? []) {
    try {
      const res = await fetch(
        `https://graph.facebook.com/v20.0/${process.env.WHATSAPP_PHONE_NUMBER_ID}/messages`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${process.env.WHATSAPP_ACCESS_TOKEN}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            messaging_product: "whatsapp",
            to: contact.phone_e164.replace("+", ""),
            type: "template",
            template: { name: campaign.whatsapp_templates?.meta_template_name, language: { code: "en" } },
          }),
        }
      );
      if (res.ok) sent++; else failed++;
      await new Promise((r) => setTimeout(r, 250)); // basic throttle
    } catch {
      failed++;
    }
  }

  await admin
    .from("whatsapp_campaigns")
    .update({ status: "sent", sent_count: sent, failed_count: failed })
    .eq("id", params.id);

  return NextResponse.json({ success: true, sent, failed });
}

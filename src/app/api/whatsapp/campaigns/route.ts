import { NextRequest, NextResponse } from "next/server";
import { createServerSupabase } from "@/lib/supabase/server";

export async function POST(request: NextRequest) {
  const supabase = createServerSupabase();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });

  const { templateId, segmentId, scheduledAt } = await request.json();

  const { data: campaign, error } = await supabase
    .from("whatsapp_campaigns")
    .insert({ template_id: templateId, segment_id: segmentId, scheduled_at: scheduledAt ?? null, status: "draft" })
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ campaign });
}

export async function GET() {
  const supabase = createServerSupabase();
  const { data } = await supabase
    .from("whatsapp_campaigns")
    .select("*, whatsapp_templates(meta_template_name), segments(name)")
    .order("scheduled_at", { ascending: false });
  return NextResponse.json({ campaigns: data ?? [] });
}

import { NextRequest, NextResponse } from "next/server";
import { createServiceRoleSupabase } from "@/lib/supabase/server";

// POST /api/analytics/events
// Body: { event_type, entity_type?, entity_id?, city_id?, category_id? }
// Uses the service-role client because anonymous visitors (not logged in)
// must be able to log page_view/profile_view/whatsapp_click/call_click
// events, and analytics_events has no public RLS insert policy by design.
export async function POST(request: NextRequest) {
  const body = await request.json();
  const supabase = createServiceRoleSupabase();

  const { error } = await supabase.from("analytics_events").insert({
    event_type: body.event_type,
    entity_type: body.entity_type ?? null,
    entity_id: body.entity_id ?? null,
    city_id: body.city_id ?? null,
    category_id: body.category_id ?? null,
  });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ success: true });
}

import { NextRequest, NextResponse } from "next/server";
import { createServerSupabase } from "@/lib/supabase/server";

// POST /api/requirements
// Creates a requirement and a corresponding lead row (Lead Center feed).
// Does NOT auto-invite/broadcast to companies — matching happens separately
// via GET /api/requirements/[id]/matches, and the customer chooses who to invite.
export async function POST(request: NextRequest) {
  const supabase = createServerSupabase();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });

  const body = await request.json();
  const { title, city_id, project_type, description, budget, required_date, category_ids } = body;

  const { data: requirement, error } = await supabase
    .from("requirements")
    .insert({
      customer_id: user.id,
      title,
      city_id: city_id || null,
      project_type,
      description,
      budget: budget || null,
      required_date: required_date || null,
      category_ids: category_ids ?? [],
    })
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  await supabase.from("leads").insert({
    source: "requirement_form",
    category_id: category_ids?.[0] ?? null,
    city_id: city_id || null,
    customer_id: user.id,
    requirement_id: requirement.id,
    status: "new",
  });

  return NextResponse.json({ requirement });
}

export async function GET(request: NextRequest) {
  const supabase = createServerSupabase();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });

  const { data, error } = await supabase
    .from("requirements")
    .select("*")
    .eq("customer_id", user.id)
    .order("created_at", { ascending: false });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ requirements: data });
}

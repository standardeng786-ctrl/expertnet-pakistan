import { NextRequest, NextResponse } from "next/server";
import { createServerSupabase, createServiceRoleSupabase } from "@/lib/supabase/server";
import { rankCandidates } from "@/lib/matching";

// GET /api/requirements/[id]/matches
// Smart matching: scores companies by category overlap + city match + verification.
// Never auto-contacts anyone — this only returns a ranked shortlist for the
// customer to act on via POST below.
export async function GET(_req: NextRequest, { params }: { params: { id: string } }) {
  const supabase = createServerSupabase();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });

  const { data: requirement } = await supabase
    .from("requirements")
    .select("*")
    .eq("id", params.id)
    .eq("customer_id", user.id)
    .maybeSingle();

  if (!requirement) return NextResponse.json({ error: "Requirement not found" }, { status: 404 });

  const { data: candidates } = await supabase
    .from("companies")
    .select("id, name, slug, city_id, category_ids, verification_status")
    .overlaps("category_ids", requirement.category_ids ?? []);

  const scored = rankCandidates(candidates ?? [], requirement, 15);

  // Persist as requirement_matches (upsert, status defaults to 'suggested')
  const admin = createServiceRoleSupabase();
  for (const c of scored) {
    await admin
      .from("requirement_matches")
      .upsert(
        { requirement_id: requirement.id, company_id: c.id, match_score: c.match_score },
        { onConflict: "requirement_id,company_id", ignoreDuplicates: true }
      );
  }

  return NextResponse.json({ matches: scored });
}

// POST /api/requirements/[id]/matches
// Body: { companyId: string, action: "invite" | "contact" | "decline" }
// Customer-controlled action per matched company — this is the only way a
// company gets invited; nothing here broadcasts to every match automatically.
export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  const supabase = createServerSupabase();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });

  const { companyId, action } = await request.json();

  const { data: requirement } = await supabase
    .from("requirements")
    .select("*")
    .eq("id", params.id)
    .eq("customer_id", user.id)
    .maybeSingle();

  if (!requirement) return NextResponse.json({ error: "Requirement not found" }, { status: 404 });

  const statusMap: Record<string, string> = { invite: "invited", contact: "contacted", decline: "declined" };
  const newStatus = statusMap[action] ?? "suggested";

  await supabase
    .from("requirement_matches")
    .update({ status: newStatus })
    .eq("requirement_id", requirement.id)
    .eq("company_id", companyId);

  let rfq = null;
  if (action === "invite") {
    const { data: existingRfq } = await supabase
      .from("rfqs")
      .select("*")
      .eq("requirement_id", requirement.id)
      .maybeSingle();

    if (existingRfq) {
      rfq = existingRfq;
    } else {
      const { data: newRfq } = await supabase
        .from("rfqs")
        .insert({ requirement_id: requirement.id, customer_id: user.id, status: "invited" })
        .select()
        .single();
      rfq = newRfq;
    }
  }

  return NextResponse.json({ success: true, rfq });
}

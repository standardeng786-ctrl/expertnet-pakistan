import { NextRequest, NextResponse } from "next/server";
import { createServerSupabase } from "@/lib/supabase/server";

// POST /api/quotations
// Body: { rfqId, amount, notes, pdfUrl }
// Only the owning company of a valid RFQ invite may submit — enforced by
// RLS (quotations_company_write policy) as well as here.
export async function POST(request: NextRequest) {
  const supabase = createServerSupabase();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });

  const { rfqId, amount, notes, pdfUrl } = await request.json();

  const { data: company } = await supabase
    .from("companies")
    .select("id")
    .eq("owner_id", user.id)
    .maybeSingle();

  if (!company) return NextResponse.json({ error: "No company profile found for this account" }, { status: 403 });

  const { data: quotation, error } = await supabase
    .from("quotations")
    .insert({ rfq_id: rfqId, company_id: company.id, amount, notes, pdf_url: pdfUrl ?? null })
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  await supabase.from("rfqs").update({ status: "quotation_received" }).eq("id", rfqId);

  return NextResponse.json({ quotation });
}

// PATCH /api/quotations  — customer shortlists or awards a quotation
export async function PATCH(request: NextRequest) {
  const supabase = createServerSupabase();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });

  const { quotationId, status } = await request.json();

  const { data: quotation } = await supabase
    .from("quotations")
    .select("*, rfqs(customer_id, id)")
    .eq("id", quotationId)
    .single();

  if (!quotation || quotation.rfqs?.customer_id !== user.id) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  await supabase.from("quotations").update({ status }).eq("id", quotationId);

  if (status === "awarded") {
    await supabase.from("rfqs").update({ status: "awarded" }).eq("id", quotation.rfqs.id);
  }

  return NextResponse.json({ success: true });
}

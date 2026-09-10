import { NextRequest, NextResponse } from "next/server";
import { createServerSupabase } from "@/lib/supabase/server";

export async function PATCH(request: NextRequest, { params }: { params: { id: string } }) {
  const supabase = createServerSupabase();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });

  const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).single();
  if (profile?.role !== "admin") return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const { status, notes } = await request.json(); // status: 'verified' | 'rejected'

  await supabase
    .from("verifications")
    .update({ status, notes, reviewed_by: user.id, reviewed_at: new Date().toISOString() })
    .eq("id", params.id);

  const { data: verification } = await supabase.from("verifications").select("company_id").eq("id", params.id).single();
  if (verification) {
    await supabase.from("companies").update({ verification_status: status }).eq("id", verification.company_id);
  }

  return NextResponse.json({ success: true });
}

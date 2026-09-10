import { NextRequest, NextResponse } from "next/server";
import { createServerSupabase } from "@/lib/supabase/server";

// POST /api/subscriptions
// Creates a subscription row for the caller's company. Payment collection
// itself (JazzCash/EasyPaisa/Stripe etc.) is NOT integrated yet — this
// records the intent and creates a 'pending' payment row so a real gateway
// can be wired in without changing this contract. See README "Pending" list.
export async function POST(request: NextRequest) {
  const supabase = createServerSupabase();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });

  const { planId } = await request.json();

  const { data: company } = await supabase.from("companies").select("id").eq("owner_id", user.id).maybeSingle();
  if (!company) return NextResponse.json({ error: "No company profile found" }, { status: 403 });

  const { data: plan } = await supabase.from("subscription_plans").select("*").eq("id", planId).single();
  if (!plan) return NextResponse.json({ error: "Plan not found" }, { status: 404 });

  const { data: subscription, error } = await supabase
    .from("subscriptions")
    .insert({
      company_id: company.id,
      plan_id: planId,
      status: "pending_payment",
      expires_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
    })
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  await supabase.from("payments").insert({
    subscription_id: subscription.id,
    amount: plan.price_monthly,
    currency: "PKR",
    status: "pending",
  });

  return NextResponse.json({ subscription, note: "Payment gateway not yet integrated — status left as pending_payment." });
}

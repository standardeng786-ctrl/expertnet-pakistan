import { createServerSupabase } from "@/lib/supabase/server";
import SubscribeButton from "./subscribe-button";

export default async function PlansPage() {
  const supabase = createServerSupabase();
  const { data: plans } = await supabase
    .from("subscription_plans")
    .select("*")
    .eq("is_active", true)
    .order("price_monthly", { ascending: true });

  return (
    <div className="mx-auto max-w-5xl px-4 py-12">
      <h1 className="text-2xl font-bold text-navy mb-2">Plans & Pricing</h1>
      <p className="text-sm text-gray-500 mb-8">Pricing is set by ExpertNet Pakistan admin and may change.</p>
      <div className="grid md:grid-cols-3 gap-6">
        {(plans ?? []).map((p) => (
          <div key={p.id} className="border rounded-md p-6 flex flex-col">
            <h2 className="font-bold text-navy text-lg">{p.name}</h2>
            <p className="text-2xl font-bold mt-2">
              PKR {Number(p.price_monthly).toLocaleString()} <span className="text-sm font-normal">/mo</span>
            </p>
            <ul className="mt-4 text-sm text-gray-700 space-y-1 flex-1">
              {(p.benefits ?? []).map((b: string) => <li key={b}>✓ {b}</li>)}
            </ul>
            <SubscribeButton planId={p.id} />
          </div>
        ))}
      </div>
    </div>
  );
}

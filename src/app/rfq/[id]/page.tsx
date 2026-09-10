import { createServerSupabase } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import AwardButton from "./award-button";

export default async function RfqDetailPage({ params }: { params: { id: string } }) {
  const supabase = createServerSupabase();
  const { data: { user } } = await supabase.auth.getUser();

  const { data: rfq } = await supabase
    .from("rfqs")
    .select("*, requirements(title)")
    .eq("id", params.id)
    .maybeSingle();

  if (!rfq || rfq.customer_id !== user?.id) notFound();

  const { data: quotations } = await supabase
    .from("quotations")
    .select("*, companies(name, slug)")
    .eq("rfq_id", rfq.id)
    .order("amount", { ascending: true });

  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      <h1 className="text-2xl font-bold text-navy">RFQ: {rfq.requirements?.title}</h1>
      <p className="text-sm text-gray-600">Status: {rfq.status}</p>

      <div className="mt-8 space-y-3">
        {(quotations ?? []).map((q) => (
          <div key={q.id} className="border rounded-md p-4 flex items-center justify-between">
            <div>
              <a href={`/company/${q.companies?.slug}`} className="font-semibold hover:text-gold">
                {q.companies?.name}
              </a>
              <p className="text-sm text-gray-700">PKR {q.amount?.toLocaleString()}</p>
              <p className="text-xs text-gray-500">{q.notes}</p>
              <p className="text-xs mt-1 inline-block bg-gray-100 rounded px-2 py-0.5">{q.status}</p>
            </div>
            {q.status !== "awarded" && rfq.status !== "closed" && (
              <AwardButton quotationId={q.id} />
            )}
          </div>
        ))}
        {(!quotations || quotations.length === 0) && (
          <p className="text-sm text-gray-500">No quotations received yet.</p>
        )}
      </div>
    </div>
  );
}

import { createServerSupabase } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import MatchList from "./match-list";

export default async function RequirementDetailPage({ params }: { params: { id: string } }) {
  const supabase = createServerSupabase();
  const { data: { user } } = await supabase.auth.getUser();

  const { data: requirement } = await supabase
    .from("requirements")
    .select("*")
    .eq("id", params.id)
    .maybeSingle();

  if (!requirement || requirement.customer_id !== user?.id) notFound();

  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      <h1 className="text-2xl font-bold text-navy">{requirement.title}</h1>
      <p className="text-sm text-gray-600 mt-1">{requirement.project_type}</p>
      <p className="mt-4 text-gray-800">{requirement.description}</p>

      <div className="mt-10">
        <h2 className="font-bold text-navy mb-3">Matched Companies</h2>
        <MatchList requirementId={requirement.id} />
      </div>
    </div>
  );
}

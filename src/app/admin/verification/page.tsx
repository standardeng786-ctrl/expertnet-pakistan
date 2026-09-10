import { createServerSupabase } from "@/lib/supabase/server";
import VerificationActions from "./actions";

export default async function VerificationQueuePage() {
  const supabase = createServerSupabase();
  const { data: pending } = await supabase
    .from("verifications")
    .select("id, status, documents, companies(name, slug)")
    .eq("status", "pending");

  return (
    <div>
      <h1 className="text-2xl font-bold text-navy mb-6">Verification Queue</h1>
      <div className="space-y-3">
        {(pending ?? []).map((v: any) => (
          <div key={v.id} className="border rounded-md p-4 flex items-center justify-between">
            <div>
              <a href={`/company/${v.companies?.slug}`} className="font-semibold hover:text-gold">
                {v.companies?.name}
              </a>
              <p className="text-xs text-gray-500">{(v.documents ?? []).length} document(s) submitted</p>
            </div>
            <VerificationActions verificationId={v.id} />
          </div>
        ))}
        {(!pending || pending.length === 0) && <p className="text-sm text-gray-500">No pending verifications.</p>}
      </div>
    </div>
  );
}

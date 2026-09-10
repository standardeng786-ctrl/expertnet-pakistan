import { createServerSupabase } from "@/lib/supabase/server";

export default async function LeadCenterPage() {
  const supabase = createServerSupabase();
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const { data: leads } = await supabase
    .from("leads")
    .select("*, categories(name), cities(name), requirements(title)")
    .order("created_at", { ascending: false })
    .limit(100);

  const newToday = (leads ?? []).filter((l) => new Date(l.created_at) >= today).length;

  const byCategory: Record<string, number> = {};
  for (const l of leads ?? []) {
    const cat = (l as any).categories?.name ?? "Uncategorized";
    byCategory[cat] = (byCategory[cat] ?? 0) + 1;
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-navy mb-2">Lead Center</h1>
      <p className="text-sm text-gray-600 mb-6">{newToday} new lead(s) today</p>

      <div className="flex flex-wrap gap-3 mb-8">
        {Object.entries(byCategory).map(([cat, n]) => (
          <span key={cat} className="border rounded-full px-3 py-1 text-xs">{cat}: {n}</span>
        ))}
      </div>

      <table className="w-full text-sm border-collapse">
        <thead>
          <tr className="text-left border-b bg-navy text-white">
            <th className="p-2">Requirement</th>
            <th className="p-2">Category</th>
            <th className="p-2">City</th>
            <th className="p-2">Source</th>
            <th className="p-2">Status</th>
          </tr>
        </thead>
        <tbody>
          {(leads ?? []).map((l: any) => (
            <tr key={l.id} className="border-b">
              <td className="p-2">
                {l.requirement_id ? (
                  <a href={`/requirements/${l.requirement_id}`} className="hover:text-gold">
                    {l.requirements?.title ?? l.requirement_id}
                  </a>
                ) : "-"}
              </td>
              <td className="p-2">{l.categories?.name ?? "-"}</td>
              <td className="p-2">{l.cities?.name ?? "-"}</td>
              <td className="p-2">{l.source}</td>
              <td className="p-2">{l.status}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

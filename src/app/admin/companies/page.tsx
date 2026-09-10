import { createServerSupabase } from "@/lib/supabase/server";

export default async function AdminCompaniesPage() {
  const supabase = createServerSupabase();
  const { data: companies } = await supabase
    .from("companies")
    .select("id, name, slug, verification_status, cities(name)")
    .order("created_at", { ascending: false })
    .limit(100);

  return (
    <div>
      <h1 className="text-2xl font-bold text-navy mb-6">Companies</h1>
      <table className="w-full text-sm border-collapse">
        <thead>
          <tr className="text-left border-b bg-navy text-white">
            <th className="p-2">Name</th>
            <th className="p-2">City</th>
            <th className="p-2">Status</th>
          </tr>
        </thead>
        <tbody>
          {(companies ?? []).map((c: any) => (
            <tr key={c.id} className="border-b">
              <td className="p-2">
                <a href={`/company/${c.slug}`} className="hover:text-gold">{c.name}</a>
              </td>
              <td className="p-2">{c.cities?.name ?? "-"}</td>
              <td className="p-2">{c.verification_status}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

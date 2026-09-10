import { createServerSupabase } from "@/lib/supabase/server";

async function count(supabase: any, table: string) {
  const { count } = await supabase.from(table).select("*", { count: "exact", head: true });
  return count ?? 0;
}

export default async function AdminDashboard() {
  const supabase = createServerSupabase();
  const [companies, professionals, requirements, leads, rfqs, waContacts] = await Promise.all([
    count(supabase, "companies"),
    count(supabase, "professionals"),
    count(supabase, "requirements"),
    count(supabase, "leads"),
    count(supabase, "rfqs"),
    count(supabase, "whatsapp_contacts"),
  ]);

  const cards = [
    { label: "Companies", value: companies },
    { label: "Professionals", value: professionals },
    { label: "Requirements", value: requirements },
    { label: "Leads", value: leads },
    { label: "RFQs", value: rfqs },
    { label: "WhatsApp Contacts", value: waContacts },
  ];

  return (
    <div>
      <h1 className="text-2xl font-bold text-navy mb-6">Admin Dashboard</h1>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {cards.map((c) => (
          <div key={c.label} className="border rounded-md p-5">
            <p className="text-3xl font-bold text-navy">{c.value}</p>
            <p className="text-sm text-gray-600">{c.label}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

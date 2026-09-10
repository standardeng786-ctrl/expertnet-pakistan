import { createServerSupabase } from "@/lib/supabase/server";

export default async function WhatsappCrmDashboard() {
  const supabase = createServerSupabase();

  const [{ count: contacts }, { count: optedIn }, { count: conversations }, { count: campaigns }] =
    await Promise.all([
      supabase.from("whatsapp_contacts").select("*", { count: "exact", head: true }),
      supabase.from("whatsapp_contacts").select("*", { count: "exact", head: true }).eq("consent_status", "opted_in"),
      supabase.from("whatsapp_conversations").select("*", { count: "exact", head: true }).eq("status", "open"),
      supabase.from("whatsapp_campaigns").select("*", { count: "exact", head: true }),
    ]);

  const links = [
    { href: "/admin/whatsapp/inbox", label: "Inbox" },
    { href: "/admin/whatsapp/contacts", label: "Contacts" },
    { href: "/admin/whatsapp/templates", label: "Templates" },
    { href: "/admin/whatsapp/campaigns", label: "Campaigns" },
  ];

  return (
    <div>
      <h1 className="text-2xl font-bold text-navy mb-6">WhatsApp Business CRM</h1>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <Stat label="Total Contacts" value={contacts ?? 0} />
        <Stat label="Opted-In" value={optedIn ?? 0} />
        <Stat label="Open Conversations" value={conversations ?? 0} />
        <Stat label="Campaigns" value={campaigns ?? 0} />
      </div>
      <div className="flex gap-3">
        {links.map((l) => (
          <a key={l.href} href={l.href} className="border rounded-md px-4 py-2 text-sm hover:border-gold">
            {l.label}
          </a>
        ))}
      </div>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <div className="border rounded-md p-4">
      <p className="text-2xl font-bold text-navy">{value}</p>
      <p className="text-xs text-gray-600">{label}</p>
    </div>
  );
}

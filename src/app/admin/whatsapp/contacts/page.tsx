import { createServerSupabase } from "@/lib/supabase/server";

export default async function ContactsPage() {
  const supabase = createServerSupabase();
  const { data: contacts } = await supabase
    .from("whatsapp_contacts")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(200);

  return (
    <div>
      <h1 className="text-2xl font-bold text-navy mb-6">Contacts</h1>
      <table className="w-full text-sm border-collapse">
        <thead>
          <tr className="text-left border-b bg-navy text-white">
            <th className="p-2">Name</th>
            <th className="p-2">Phone</th>
            <th className="p-2">Consent</th>
            <th className="p-2">Source</th>
          </tr>
        </thead>
        <tbody>
          {(contacts ?? []).map((c) => (
            <tr key={c.id} className="border-b">
              <td className="p-2">{c.display_name || "-"}</td>
              <td className="p-2">{c.phone_e164}</td>
              <td className="p-2">
                <span
                  className={`text-xs px-2 py-0.5 rounded-full ${
                    c.consent_status === "opted_in"
                      ? "bg-green-100 text-green-700"
                      : c.consent_status === "opted_out"
                      ? "bg-red-100 text-red-700"
                      : "bg-gray-100 text-gray-600"
                  }`}
                >
                  {c.consent_status}
                </span>
              </td>
              <td className="p-2">{c.source ?? "-"}</td>
            </tr>
          ))}
        </tbody>
      </table>
      {(!contacts || contacts.length === 0) && <p className="text-sm text-gray-500 mt-4">No contacts yet.</p>}
    </div>
  );
}

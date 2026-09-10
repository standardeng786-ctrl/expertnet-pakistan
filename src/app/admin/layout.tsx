import { createServerSupabase } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

const NAV = [
  { href: "/admin", label: "Dashboard" },
  { href: "/admin/companies", label: "Companies" },
  { href: "/admin/leads", label: "Leads" },
  { href: "/admin/verification", label: "Verification" },
  { href: "/admin/analytics", label: "Analytics" },
  { href: "/admin/whatsapp", label: "WhatsApp CRM" },
];

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const supabase = createServerSupabase();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).single();
  if (profile?.role !== "admin") redirect("/");

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 flex gap-8">
      <aside className="w-48 shrink-0">
        <nav className="flex flex-col gap-1 text-sm">
          {NAV.map((item) => (
            <a key={item.href} href={item.href} className="px-3 py-2 rounded-md hover:bg-navy/5 hover:text-gold">
              {item.label}
            </a>
          ))}
        </nav>
      </aside>
      <div className="flex-1 min-w-0">{children}</div>
    </div>
  );
}

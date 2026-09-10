import type { Metadata } from "next";
import { createServerSupabase } from "@/lib/supabase/server";
import { notFound } from "next/navigation";

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const supabase = createServerSupabase();
  const { data: pro } = await supabase
    .from("professionals")
    .select("designation, about, profiles(full_name)")
    .eq("slug", params.slug)
    .maybeSingle();

  if (!pro) return { title: "Professional Not Found — ExpertNet Pakistan" };

  const title = `${(pro as any).profiles?.full_name ?? "Professional"} — ExpertNet Pakistan`;
  return { title, description: pro.about?.slice(0, 155) ?? pro.designation ?? title };
}

export default async function ProfessionalProfilePage({ params }: { params: { slug: string } }) {
  const supabase = createServerSupabase();
  const { data: pro } = await supabase
    .from("professionals")
    .select("*, profiles(full_name, whatsapp_number, phone, email), companies(name, slug)")
    .eq("slug", params.slug)
    .maybeSingle();

  if (!pro) notFound();

  const waMessage = encodeURIComponent(
    `Assalam-o-Alaikum, I found your professional profile on ExpertNet Pakistan and would like to discuss my requirement.`
  );

  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      <h1 className="text-2xl font-bold text-navy">{pro.profiles?.full_name}</h1>
      <p className="text-sm text-gray-600">{pro.designation}</p>
      {pro.companies && (
        <a href={`/company/${pro.companies.slug}`} className="text-sm text-gold">
          {pro.companies.name}
        </a>
      )}
      {pro.about && <p className="mt-4 text-gray-800">{pro.about}</p>}
      <div className="mt-6 flex flex-wrap gap-3">
        {pro.profiles?.whatsapp_number && (
          <a href={`https://wa.me/${pro.profiles.whatsapp_number.replace("+", "")}?text=${waMessage}`}
            target="_blank" className="bg-green-600 text-white px-4 py-2 rounded-md text-sm font-semibold">
            WhatsApp
          </a>
        )}
        {pro.profiles?.phone && (
          <a href={`tel:${pro.profiles.phone}`} className="border border-navy px-4 py-2 rounded-md text-sm font-semibold">
            Call
          </a>
        )}
      </div>
    </div>
  );
}

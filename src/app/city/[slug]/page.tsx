import type { Metadata } from "next";
import { createServerSupabase } from "@/lib/supabase/server";
import { notFound } from "next/navigation";

function unslugCity(slug: string) {
  return slug.split("-").map((w) => w[0]?.toUpperCase() + w.slice(1)).join(" ");
}

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const name = unslugCity(params.slug);
  return {
    title: `${name} — ExpertNet Pakistan`,
    description: `MEP, HVAC, Commercial Kitchen and Technical Industry companies in ${name}, Pakistan.`,
  };
}

export default async function CityPage({ params }: { params: { slug: string } }) {
  const supabase = createServerSupabase();
  const cityName = unslugCity(params.slug);

  const { data: city } = await supabase.from("cities").select("*").ilike("name", cityName).maybeSingle();
  if (!city) notFound();

  const { data: companies } = await supabase
    .from("companies")
    .select("id, name, slug, verification_status")
    .eq("city_id", city.id)
    .limit(50);

  return (
    <div className="mx-auto max-w-5xl px-4 py-10">
      <h1 className="text-2xl font-bold text-navy">{city.name}</h1>
      <p className="text-sm text-gray-600 mb-8">{companies?.length ?? 0} companies listed</p>

      <div className="grid md:grid-cols-3 gap-4">
        {(companies ?? []).map((c) => (
          <a key={c.id} href={`/company/${c.slug}`} className="border rounded-md p-4 hover:border-gold">
            <p className="font-semibold">{c.name}</p>
            {c.verification_status === "verified" && (
              <span className="text-xs bg-gold text-white px-2 py-0.5 rounded-full">Verified</span>
            )}
          </a>
        ))}
        {(!companies || companies.length === 0) && (
          <p className="text-gray-500 text-sm">No companies listed in {city.name} yet.</p>
        )}
      </div>
    </div>
  );
}

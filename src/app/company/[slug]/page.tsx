import type { Metadata } from "next";
import { createServerSupabase } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import ProfileActions from "./profile-actions";

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const supabase = createServerSupabase();
  const { data: company } = await supabase
    .from("companies")
    .select("name, about, logo_url")
    .eq("slug", params.slug)
    .maybeSingle();

  if (!company) return { title: "Company Not Found — ExpertNet Pakistan" };

  const title = `${company.name} — ExpertNet Pakistan`;
  const description = company.about?.slice(0, 155) ?? `${company.name} on ExpertNet Pakistan.`;

  return {
    title,
    description,
    openGraph: { title, description, images: company.logo_url ? [company.logo_url] : undefined },
  };
}

export default async function CompanyProfilePage({ params }: { params: { slug: string } }) {
  const supabase = createServerSupabase();

  const { data: company } = await supabase
    .from("companies")
    .select("*, cities(name, province)")
    .eq("slug", params.slug)
    .maybeSingle();

  if (!company) notFound();

  const { data: portfolios } = await supabase
    .from("portfolios")
    .select("*")
    .eq("company_id", company.id);

  const { data: products } = await supabase
    .from("products")
    .select("id, name, slug")
    .eq("company_id", company.id);

  const waMessage = encodeURIComponent(
    `Assalam-o-Alaikum, I found your profile "${company.name}" through ExpertNet Pakistan and would like to discuss my requirement.`
  );

  return (
    <div className="mx-auto max-w-4xl px-4 py-10">
      <div className="flex items-center gap-4">
        {company.logo_url && (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={company.logo_url} alt={company.name} className="w-16 h-16 rounded-md object-cover" />
        )}
        <div>
          <h1 className="text-2xl font-bold text-navy">{company.name}</h1>
          <p className="text-sm text-gray-600">
            {company.cities?.name}{company.cities?.province ? `, ${company.cities.province}` : ""}
          </p>
          {company.verification_status === "verified" && (
            <span className="inline-block mt-1 text-xs bg-gold text-white px-2 py-0.5 rounded-full">Verified</span>
          )}
        </div>
      </div>

      {company.about && <p className="mt-6 text-gray-800">{company.about}</p>}

      <ProfileActions
        companyId={company.id}
        whatsappNumber={company.whatsapp_number}
        phone={company.phone}
        email={company.email}
        website={company.website}
        waMessage={waMessage}
      />

      {portfolios && portfolios.length > 0 && (
        <div className="mt-10">
          <h2 className="text-lg font-bold text-navy mb-3">Projects & Portfolio</h2>
          <div className="grid md:grid-cols-2 gap-4">
            {portfolios.map((p) => (
              <div key={p.id} className="border rounded-md p-4">
                <h3 className="font-semibold">{p.title}</h3>
                <p className="text-sm text-gray-600">{p.description}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {products && products.length > 0 && (
        <div className="mt-10">
          <h2 className="text-lg font-bold text-navy mb-3">Products</h2>
          <div className="flex flex-wrap gap-3">
            {products.map((p) => (
              <a key={p.id} href={`/product/${p.slug}`} className="border rounded-md px-4 py-2 text-sm hover:border-gold">
                {p.name}
              </a>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

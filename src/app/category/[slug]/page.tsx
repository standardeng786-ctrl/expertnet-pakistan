import type { Metadata } from "next";
import { createServerSupabase } from "@/lib/supabase/server";
import { notFound } from "next/navigation";

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const supabase = createServerSupabase();
  const { data: category } = await supabase.from("categories").select("name").eq("slug", params.slug).maybeSingle();
  if (!category) return { title: "Category Not Found — ExpertNet Pakistan" };
  return {
    title: `${category.name} — ExpertNet Pakistan`,
    description: `Find ${category.name} companies and professionals across Pakistan on ExpertNet Pakistan.`,
  };
}

export default async function CategoryPage({ params }: { params: { slug: string } }) {
  const supabase = createServerSupabase();

  const { data: category } = await supabase
    .from("categories")
    .select("*")
    .eq("slug", params.slug)
    .maybeSingle();

  if (!category) notFound();

  // Companies offering this category (service categories)
  const { data: companies } = await supabase
    .from("companies")
    .select("id, name, slug, verification_status")
    .contains("category_ids", [category.id])
    .limit(30);

  // Products under this category (product categories, e.g. Kitchen Equipment)
  const { data: products } = await supabase
    .from("products")
    .select("id, name, slug, companies(name)")
    .eq("category_id", category.id)
    .limit(30);

  return (
    <div className="mx-auto max-w-5xl px-4 py-10">
      <h1 className="text-2xl font-bold text-navy">{category.name}</h1>
      <p className="text-sm text-gray-600 mb-8">
        {(companies?.length ?? 0) + (products?.length ?? 0)} listing(s)
      </p>

      {companies && companies.length > 0 && (
        <div className="mb-10">
          <h2 className="font-bold text-navy mb-3">Companies & Professionals</h2>
          <div className="grid md:grid-cols-3 gap-4">
            {companies.map((c) => (
              <a key={c.id} href={`/company/${c.slug}`} className="border rounded-md p-4 hover:border-gold">
                <p className="font-semibold">{c.name}</p>
                {c.verification_status === "verified" && (
                  <span className="text-xs bg-gold text-white px-2 py-0.5 rounded-full">Verified</span>
                )}
              </a>
            ))}
          </div>
        </div>
      )}

      {products && products.length > 0 && (
        <div>
          <h2 className="font-bold text-navy mb-3">Products</h2>
          <div className="grid md:grid-cols-3 gap-4">
            {products.map((p: any) => (
              <a key={p.id} href={`/product/${p.slug}`} className="border rounded-md p-4 hover:border-gold">
                <p className="font-semibold">{p.name}</p>
                <p className="text-xs text-gray-500">{p.companies?.name}</p>
              </a>
            ))}
          </div>
        </div>
      )}

      {(!companies || companies.length === 0) && (!products || products.length === 0) && (
        <p className="text-gray-500">No listings yet in this category.</p>
      )}
    </div>
  );
}

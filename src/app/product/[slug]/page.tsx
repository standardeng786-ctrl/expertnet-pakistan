import type { Metadata } from "next";
import { createServerSupabase } from "@/lib/supabase/server";
import { notFound } from "next/navigation";

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const supabase = createServerSupabase();
  const { data: product } = await supabase
    .from("products")
    .select("name, price_note, companies(name)")
    .eq("slug", params.slug)
    .maybeSingle();

  if (!product) return { title: "Product Not Found — ExpertNet Pakistan" };

  const title = `${product.name} — ${(product as any).companies?.name ?? "ExpertNet Pakistan"}`;
  return { title, description: product.price_note ?? title };
}

export default async function ProductPage({ params }: { params: { slug: string } }) {
  const supabase = createServerSupabase();
  const { data: product } = await supabase
    .from("products")
    .select("*, companies(name, slug, whatsapp_number)")
    .eq("slug", params.slug)
    .maybeSingle();

  if (!product) notFound();

  const waMessage = encodeURIComponent(
    `Assalam-o-Alaikum, I'm interested in "${product.name}" listed on ExpertNet Pakistan.`
  );

  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      <h1 className="text-2xl font-bold text-navy">{product.name}</h1>
      <a href={`/company/${product.companies?.slug}`} className="text-sm text-gold">
        {product.companies?.name}
      </a>
      {product.price_note && <p className="mt-2 text-gray-700">{product.price_note}</p>}
      {product.specs && (
        <pre className="mt-4 bg-gray-50 border rounded-md p-4 text-sm whitespace-pre-wrap">
          {JSON.stringify(product.specs, null, 2)}
        </pre>
      )}
      {product.companies?.whatsapp_number && (
        <a
          href={`https://wa.me/${product.companies.whatsapp_number.replace("+", "")}?text=${waMessage}`}
          target="_blank"
          className="inline-block mt-6 bg-green-600 text-white px-4 py-2 rounded-md text-sm font-semibold"
        >
          Ask on WhatsApp
        </a>
      )}
    </div>
  );
}

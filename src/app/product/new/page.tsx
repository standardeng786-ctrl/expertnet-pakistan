"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

function slugify(text: string) {
  return text.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
}

export default function NewProductPage() {
  const router = useRouter();
  const supabase = createClient();
  const [companyId, setCompanyId] = useState("");
  const [name, setName] = useState("");
  const [priceNote, setPriceNote] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const slug = `${slugify(name)}-${Date.now().toString(36)}`;
    const { data, error: insertError } = await supabase
      .from("products")
      .insert({ company_id: companyId, name, price_note: priceNote, slug })
      .select()
      .single();

    setLoading(false);
    if (insertError) { setError(insertError.message); return; }
    router.push(`/product/${data.slug}`);
  }

  return (
    <div className="mx-auto max-w-lg px-4 py-12">
      <h1 className="text-2xl font-bold text-navy mb-2">List a Product</h1>
      <p className="text-sm text-gray-500 mb-6">
        Your Company ID (RLS requires you to be the owning company).
      </p>
      <form onSubmit={handleSubmit} className="space-y-4">
        <input required placeholder="Company ID" value={companyId} onChange={(e) => setCompanyId(e.target.value)}
          className="w-full border border-navy/20 rounded-md px-4 py-2" />
        <input required placeholder="Product name" value={name} onChange={(e) => setName(e.target.value)}
          className="w-full border border-navy/20 rounded-md px-4 py-2" />
        <input placeholder="Price note (e.g. Starting PKR 150,000)" value={priceNote}
          onChange={(e) => setPriceNote(e.target.value)} className="w-full border border-navy/20 rounded-md px-4 py-2" />
        {error && <p className="text-red-600 text-sm">{error}</p>}
        <button type="submit" disabled={loading} className="w-full bg-navy text-white font-semibold py-2 rounded-md disabled:opacity-50">
          {loading ? "Publishing..." : "Publish Product"}
        </button>
      </form>
    </div>
  );
}

"use client";

import { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";

interface Result {
  type: "company" | "professional" | "product";
  id: string;
  name: string;
  slug: string;
  verified: boolean;
}

const TYPE_ROUTE: Record<Result["type"], string> = {
  company: "/company/",
  professional: "/professional/",
  product: "/product/",
};

export default function SearchPage() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const [q, setQ] = useState(searchParams.get("q") ?? "");
  const [city, setCity] = useState(searchParams.get("city") ?? "");
  const [verifiedOnly, setVerifiedOnly] = useState(searchParams.get("verified") === "true");
  const [results, setResults] = useState<Result[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const params = new URLSearchParams();
    if (q) params.set("q", q);
    if (city) params.set("city", city);
    if (verifiedOnly) params.set("verified", "true");

    setLoading(true);
    fetch(`/api/search?${params.toString()}`)
      .then((r) => r.json())
      .then((d) => setResults(d.results ?? []))
      .finally(() => setLoading(false));

    router.replace(`/search?${params.toString()}`);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [q, city, verifiedOnly]);

  return (
    <div className="mx-auto max-w-5xl px-4 py-10">
      <h1 className="text-2xl font-bold text-navy mb-6">Search Results</h1>

      <div className="flex flex-wrap gap-3 mb-8">
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search companies, professionals, products..."
          className="flex-1 min-w-[200px] border rounded-md px-4 py-2 text-sm"
        />
        <input
          value={city}
          onChange={(e) => setCity(e.target.value)}
          placeholder="City"
          className="w-40 border rounded-md px-4 py-2 text-sm"
        />
        <label className="flex items-center gap-2 text-sm border rounded-md px-3 py-2">
          <input type="checkbox" checked={verifiedOnly} onChange={(e) => setVerifiedOnly(e.target.checked)} />
          Verified only
        </label>
      </div>

      {loading && <p className="text-sm text-gray-500">Searching...</p>}
      {!loading && results.length === 0 && <p className="text-sm text-gray-500">No results found.</p>}

      <div className="grid md:grid-cols-3 gap-4">
        {results.map((r) => (
          <a key={`${r.type}-${r.id}`} href={`${TYPE_ROUTE[r.type]}${r.slug}`} className="border rounded-md p-4 hover:border-gold">
            <p className="text-[10px] uppercase tracking-wide text-gold font-semibold">{r.type}</p>
            <p className="font-semibold">{r.name}</p>
            {r.verified && <span className="text-xs bg-gold text-white px-2 py-0.5 rounded-full">Verified</span>}
          </a>
        ))}
      </div>
    </div>
  );
}

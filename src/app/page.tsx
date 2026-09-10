"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";

const POPULAR_CATEGORIES = [
  "MEP", "HVAC", "Architect", "Ducting", "Commercial Kitchen", "Kitchen Equipment",
  "Electrical", "Fire Fighting", "Plumbing", "Fabrication",
];

export default function HomePage() {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [city, setCity] = useState("");

  function handleSearch(e: FormEvent) {
    e.preventDefault();
    const params = new URLSearchParams();
    if (query) params.set("q", query);
    if (city) params.set("city", city);
    router.push(`/search?${params.toString()}`);
  }

  return (
    <div>
      <section className="bg-navy text-white py-16 px-4">
        <div className="mx-auto max-w-3xl text-center">
          <h1 className="text-3xl md:text-4xl font-bold">
            What service, product or expert do you need?
          </h1>
          <p className="mt-2 text-gold-light">
            Pakistan's MEP, HVAC, Commercial Kitchen & Technical Industry Network
          </p>

          <form
            onSubmit={handleSearch}
            className="mt-8 bg-white rounded-lg p-2 flex flex-col md:flex-row gap-2"
          >
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="e.g. HVAC contractor, kitchen equipment, ducting..."
              className="flex-1 px-4 py-3 text-black rounded-md focus:outline-none"
            />
            <input
              type="text"
              value={city}
              onChange={(e) => setCity(e.target.value)}
              placeholder="City (e.g. Karachi)"
              className="md:w-48 px-4 py-3 text-black rounded-md focus:outline-none"
            />
            <button
              type="submit"
              className="bg-gold hover:bg-gold-light text-white font-semibold px-6 py-3 rounded-md transition"
            >
              Search
            </button>
          </form>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-10">
        <h2 className="text-navy font-bold text-xl mb-4">Popular Categories</h2>
        <div className="flex flex-wrap gap-3">
          {POPULAR_CATEGORIES.map((cat) => (
            <a
              key={cat}
              href={`/category/${cat.toLowerCase().replace(/\s+/g, "-")}`}
              className="border border-navy/20 rounded-full px-4 py-2 text-sm hover:border-gold hover:text-gold transition"
            >
              {cat}
            </a>
          ))}
        </div>
      </section>
    </div>
  );
}

"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

function slugify(text: string) {
  return text.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
}

export default function NewCompanyPage() {
  const router = useRouter();
  const supabase = createClient();
  const [name, setName] = useState("");
  const [about, setAbout] = useState("");
  const [phone, setPhone] = useState("");
  const [whatsapp, setWhatsapp] = useState("");
  const [website, setWebsite] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      setLoading(false);
      setError("Please login first.");
      return;
    }

    const slug = `${slugify(name)}-${user.id.slice(0, 6)}`;

    const { data, error: insertError } = await supabase
      .from("companies")
      .insert({
        owner_id: user.id,
        name,
        slug,
        about,
        phone,
        whatsapp_number: whatsapp,
        website,
      })
      .select()
      .single();

    setLoading(false);

    if (insertError) {
      setError(insertError.message);
      return;
    }

    router.push(`/company/${data.slug}`);
  }

  return (
    <div className="mx-auto max-w-lg px-4 py-12">
      <h1 className="text-2xl font-bold text-navy mb-6">Create Company Profile</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        <input required placeholder="Company name" value={name} onChange={(e) => setName(e.target.value)}
          className="w-full border border-navy/20 rounded-md px-4 py-2" />
        <textarea placeholder="About your company" value={about} onChange={(e) => setAbout(e.target.value)}
          className="w-full border border-navy/20 rounded-md px-4 py-2" rows={4} />
        <input placeholder="Phone" value={phone} onChange={(e) => setPhone(e.target.value)}
          className="w-full border border-navy/20 rounded-md px-4 py-2" />
        <input placeholder="WhatsApp (+92...)" value={whatsapp} onChange={(e) => setWhatsapp(e.target.value)}
          className="w-full border border-navy/20 rounded-md px-4 py-2" />
        <input placeholder="Website" value={website} onChange={(e) => setWebsite(e.target.value)}
          className="w-full border border-navy/20 rounded-md px-4 py-2" />
        {error && <p className="text-red-600 text-sm">{error}</p>}
        <button type="submit" disabled={loading}
          className="w-full bg-navy text-white font-semibold py-2 rounded-md disabled:opacity-50">
          {loading ? "Creating..." : "Create Profile"}
        </button>
      </form>
    </div>
  );
}

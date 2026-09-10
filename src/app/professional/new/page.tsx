"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

function slugify(text: string) {
  return text.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
}

export default function NewProfessionalPage() {
  const router = useRouter();
  const supabase = createClient();
  const [designation, setDesignation] = useState("");
  const [about, setAbout] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { setLoading(false); setError("Please login first."); return; }

    const { data: profile } = await supabase.from("profiles").select("full_name").eq("id", user.id).single();
    const slug = `${slugify(profile?.full_name || "professional")}-${user.id.slice(0, 6)}`;

    const { data, error: insertError } = await supabase
      .from("professionals")
      .insert({ profile_id: user.id, designation, about, slug })
      .select()
      .single();

    setLoading(false);
    if (insertError) { setError(insertError.message); return; }
    router.push(`/professional/${data.slug}`);
  }

  return (
    <div className="mx-auto max-w-lg px-4 py-12">
      <h1 className="text-2xl font-bold text-navy mb-6">Create Professional Profile</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        <input required placeholder="Designation (e.g. HVAC Consultant)" value={designation}
          onChange={(e) => setDesignation(e.target.value)} className="w-full border border-navy/20 rounded-md px-4 py-2" />
        <textarea placeholder="About you" value={about} onChange={(e) => setAbout(e.target.value)}
          className="w-full border border-navy/20 rounded-md px-4 py-2" rows={4} />
        {error && <p className="text-red-600 text-sm">{error}</p>}
        <button type="submit" disabled={loading} className="w-full bg-navy text-white font-semibold py-2 rounded-md disabled:opacity-50">
          {loading ? "Creating..." : "Create Profile"}
        </button>
      </form>
    </div>
  );
}

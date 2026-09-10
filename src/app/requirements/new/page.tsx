"use client";

import { useState, type FormEvent } from "react";
import { useRouter, useSearchParams } from "next/navigation";

export default function NewRequirementPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const preselectedCompany = searchParams.get("company");

  const [title, setTitle] = useState("");
  const [projectType, setProjectType] = useState("");
  const [description, setDescription] = useState("");
  const [budget, setBudget] = useState("");
  const [requiredDate, setRequiredDate] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const res = await fetch("/api/requirements", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title,
        project_type: projectType,
        description,
        budget: budget ? Number(budget) : null,
        required_date: requiredDate || null,
        category_ids: [],
      }),
    });

    const data = await res.json();
    setLoading(false);

    if (!res.ok) { setError(data.error ?? "Something went wrong"); return; }

    router.push(`/requirements/${data.requirement.id}`);
  }

  return (
    <div className="mx-auto max-w-lg px-4 py-12">
      <h1 className="text-2xl font-bold text-navy mb-2">Post a Requirement</h1>
      {preselectedCompany && (
        <p className="text-sm text-gray-500 mb-4">
          This will also let you directly request a quotation from the company you were viewing.
        </p>
      )}
      <form onSubmit={handleSubmit} className="space-y-4">
        <input required placeholder="Project title" value={title} onChange={(e) => setTitle(e.target.value)}
          className="w-full border border-navy/20 rounded-md px-4 py-2" />
        <input placeholder="Project type (e.g. Restaurant Kitchen Exhaust)" value={projectType}
          onChange={(e) => setProjectType(e.target.value)} className="w-full border border-navy/20 rounded-md px-4 py-2" />
        <textarea required placeholder="Description" value={description} onChange={(e) => setDescription(e.target.value)}
          className="w-full border border-navy/20 rounded-md px-4 py-2" rows={5} />
        <input placeholder="Budget (PKR, optional)" value={budget} onChange={(e) => setBudget(e.target.value)}
          className="w-full border border-navy/20 rounded-md px-4 py-2" />
        <input type="date" value={requiredDate} onChange={(e) => setRequiredDate(e.target.value)}
          className="w-full border border-navy/20 rounded-md px-4 py-2" />
        {error && <p className="text-red-600 text-sm">{error}</p>}
        <button type="submit" disabled={loading} className="w-full bg-gold text-white font-semibold py-2 rounded-md disabled:opacity-50">
          {loading ? "Posting..." : "Post Requirement"}
        </button>
      </form>
    </div>
  );
}

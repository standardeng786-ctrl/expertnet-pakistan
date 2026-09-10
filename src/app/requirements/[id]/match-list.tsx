"use client";

import { useEffect, useState } from "react";

interface Match {
  id: string;
  name: string;
  slug: string;
  match_score: number;
  verification_status: string;
}

export default function MatchList({ requirementId }: { requirementId: string }) {
  const [matches, setMatches] = useState<Match[]>([]);
  const [loading, setLoading] = useState(true);
  const [actioning, setActioning] = useState<string | null>(null);

  useEffect(() => {
    fetch(`/api/requirements/${requirementId}/matches`)
      .then((r) => r.json())
      .then((d) => setMatches(d.matches ?? []))
      .finally(() => setLoading(false));
  }, [requirementId]);

  async function act(companyId: string, action: "invite" | "contact" | "decline") {
    setActioning(companyId + action);
    await fetch(`/api/requirements/${requirementId}/matches`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ companyId, action }),
    });
    setActioning(null);
    alert(`Action recorded: ${action}`);
  }

  if (loading) return <p className="text-sm text-gray-500">Finding suitable companies...</p>;
  if (matches.length === 0) return <p className="text-sm text-gray-500">No matches found yet for this category/city.</p>;

  return (
    <div className="space-y-3">
      {matches.map((m) => (
        <div key={m.id} className="border rounded-md p-4 flex items-center justify-between">
          <div>
            <a href={`/company/${m.slug}`} className="font-semibold hover:text-gold">{m.name}</a>
            <p className="text-xs text-gray-500">Match score: {m.match_score}</p>
          </div>
          <div className="flex gap-2">
            <button onClick={() => act(m.id, "invite")} disabled={actioning === m.id + "invite"}
              className="bg-gold text-white text-xs px-3 py-1.5 rounded-md">Invite to Quote</button>
            <button onClick={() => act(m.id, "contact")} disabled={actioning === m.id + "contact"}
              className="border border-navy text-xs px-3 py-1.5 rounded-md">Request Contact</button>
          </div>
        </div>
      ))}
    </div>
  );
}

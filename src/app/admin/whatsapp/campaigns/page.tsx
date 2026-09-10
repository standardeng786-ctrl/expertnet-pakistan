"use client";

import { useEffect, useState } from "react";

export default function CampaignsPage() {
  const [campaigns, setCampaigns] = useState<any[]>([]);
  const [sending, setSending] = useState<string | null>(null);

  function load() {
    fetch("/api/whatsapp/campaigns").then((r) => r.json()).then((d) => setCampaigns(d.campaigns ?? []));
  }

  useEffect(() => { load(); }, []);

  async function sendCampaign(id: string) {
    setSending(id);
    const res = await fetch(`/api/whatsapp/campaigns/${id}/send`, { method: "POST" });
    const data = await res.json();
    setSending(null);
    alert(res.ok ? `Sent: ${data.sent}, Failed: ${data.failed}` : data.error);
    load();
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-navy mb-2">Campaigns</h1>
      <p className="text-sm text-gray-500 mb-6">
        Campaigns only ever send to contacts with consent_status = opted_in, regardless of segment filters.
      </p>
      <div className="space-y-3">
        {campaigns.map((c) => (
          <div key={c.id} className="border rounded-md p-4 flex items-center justify-between">
            <div>
              <p className="font-semibold">{c.whatsapp_templates?.meta_template_name}</p>
              <p className="text-xs text-gray-500">
                {c.status} · sent {c.sent_count} · failed {c.failed_count}
              </p>
            </div>
            {c.status === "draft" && (
              <button
                onClick={() => sendCampaign(c.id)}
                disabled={sending === c.id}
                className="bg-gold text-white text-xs px-3 py-1.5 rounded-md"
              >
                {sending === c.id ? "Sending..." : "Send Now"}
              </button>
            )}
          </div>
        ))}
        {campaigns.length === 0 && (
          <p className="text-sm text-gray-500">
            No campaigns yet. Create one by inserting into whatsapp_campaigns with a registered template + segment,
            or wire up a creation form here in the next iteration.
          </p>
        )}
      </div>
    </div>
  );
}

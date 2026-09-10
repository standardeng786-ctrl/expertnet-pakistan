"use client";

import { useState } from "react";

export default function SubscribeButton({ planId }: { planId: string }) {
  const [loading, setLoading] = useState(false);

  async function subscribe() {
    setLoading(true);
    const res = await fetch("/api/subscriptions", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ planId }),
    });
    const data = await res.json();
    setLoading(false);
    alert(res.ok ? "Subscription created (payment gateway integration pending)." : data.error);
  }

  return (
    <button onClick={subscribe} disabled={loading} className="mt-4 bg-navy text-white font-semibold py-2 rounded-md disabled:opacity-50">
      {loading ? "Processing..." : "Choose Plan"}
    </button>
  );
}

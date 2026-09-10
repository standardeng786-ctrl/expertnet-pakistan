"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function AwardButton({ quotationId }: { quotationId: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function award() {
    setLoading(true);
    await fetch("/api/quotations", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ quotationId, status: "awarded" }),
    });
    setLoading(false);
    router.refresh();
  }

  return (
    <button onClick={award} disabled={loading} className="bg-gold text-white text-xs px-3 py-1.5 rounded-md">
      {loading ? "Awarding..." : "Award"}
    </button>
  );
}

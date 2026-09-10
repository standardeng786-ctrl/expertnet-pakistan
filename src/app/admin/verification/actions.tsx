"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function VerificationActions({ verificationId }: { verificationId: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function act(status: "verified" | "rejected") {
    setLoading(true);
    await fetch(`/api/admin/verification/${verificationId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    setLoading(false);
    router.refresh();
  }

  return (
    <div className="flex gap-2">
      <button onClick={() => act("verified")} disabled={loading} className="bg-gold text-white text-xs px-3 py-1.5 rounded-md">
        Approve
      </button>
      <button onClick={() => act("rejected")} disabled={loading} className="border border-red-500 text-red-600 text-xs px-3 py-1.5 rounded-md">
        Reject
      </button>
    </div>
  );
}

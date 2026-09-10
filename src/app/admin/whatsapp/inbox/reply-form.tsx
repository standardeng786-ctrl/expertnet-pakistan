"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function ReplyForm({ contactId }: { contactId: string }) {
  const router = useRouter();
  const [text, setText] = useState("");
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function send() {
    if (!text.trim()) return;
    setSending(true);
    setError(null);
    const res = await fetch("/api/whatsapp/send", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ contactId, text }),
    });
    const data = await res.json();
    setSending(false);
    if (!res.ok) { setError(data.error?.error?.message ?? data.error ?? "Failed to send"); return; }
    setText("");
    router.refresh();
  }

  return (
    <div className="mt-4 flex gap-2 sticky bottom-0 bg-white pt-2">
      <input
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="Type a reply (24-hour customer service window)"
        className="flex-1 border rounded-md px-3 py-2 text-sm"
        onKeyDown={(e) => e.key === "Enter" && send()}
      />
      <button onClick={send} disabled={sending} className="bg-navy text-white text-sm px-4 py-2 rounded-md disabled:opacity-50">
        {sending ? "Sending..." : "Send"}
      </button>
      {error && <p className="text-xs text-red-600 self-center">{error}</p>}
    </div>
  );
}

"use client";

import { useState, type FormEvent } from "react";

interface Msg { role: "user" | "assistant"; content: string; }

export default function AiAdvisorPage() {
  const [messages, setMessages] = useState<Msg[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!input.trim()) return;
    const next = [...messages, { role: "user" as const, content: input }];
    setMessages(next);
    setInput("");
    setLoading(true);

    const res = await fetch("/api/ai-advisor/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ messages: next }),
    });
    const data = await res.json();
    setLoading(false);

    setMessages([
      ...next,
      { role: "assistant", content: res.ok ? data.reply : `⚠️ ${data.error?.message ?? data.error}` },
    ]);
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-10">
      <h1 className="text-2xl font-bold text-navy">Ask ExpertNet AI</h1>
      <p className="text-sm text-gray-500 mb-6">
        Describe your project — e.g. "I want to build a 500 sqft restaurant kitchen" or
        "I need an exhaust system for three pizza ovens".
      </p>

      <div className="border rounded-md p-4 space-y-3 min-h-[300px] mb-4">
        {messages.map((m, i) => (
          <div key={i} className={m.role === "user" ? "text-right" : ""}>
            <span
              className={`inline-block px-3 py-2 rounded-md text-sm whitespace-pre-wrap ${
                m.role === "user" ? "bg-navy text-white" : "bg-gray-100"
              }`}
            >
              {m.content}
            </span>
          </div>
        ))}
        {loading && <p className="text-sm text-gray-400">Thinking...</p>}
      </div>

      <form onSubmit={handleSubmit} className="flex gap-2">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Describe your requirement..."
          className="flex-1 border rounded-md px-4 py-2 text-sm"
        />
        <button type="submit" disabled={loading} className="bg-gold text-white px-4 py-2 rounded-md text-sm font-semibold">
          Send
        </button>
      </form>

      <div className="mt-4 flex gap-3 text-sm">
        <a href="/search" className="border rounded-md px-3 py-1.5 hover:border-gold">Find Professionals</a>
        <a href="/requirements/new" className="border rounded-md px-3 py-1.5 hover:border-gold">Post Requirement</a>
      </div>
    </div>
  );
}

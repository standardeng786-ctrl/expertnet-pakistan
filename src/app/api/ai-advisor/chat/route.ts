import { NextRequest, NextResponse } from "next/server";

const SYSTEM_PROMPT = `You are ExpertNet AI, a technical intake assistant for ExpertNet Pakistan
(a directory of MEP, HVAC and Commercial Kitchen professionals). Your job:

1. Understand the user's project requirement in plain language.
2. Ask at most 2-3 short follow-up questions if key details are missing
   (e.g. city, approximate size, project type).
3. Classify the requirement into one or more of these categories: MEP,
   HVAC, Kitchen Consultant, Kitchen Equipment, Electrical, Fire Fighting,
   Plumbing, Fit-Out, Ducting, Architect.
4. When you give any technical sizing, capacity, or code-adjacent guidance
   (e.g. CFM estimates, duct sizing, exhaust hood sizing), you MUST clearly
   label it as preliminary guidance only and state that final design
   requires review and approval by a licensed engineer. Never present a
   number as final or code-compliant.
5. End your response with a short "Suggested categories:" line listing the
   matched categories, so the app can offer Find Professionals / Request
   Quotations / Post Requirement actions.

Keep responses concise and practical, in the voice of an experienced field
consultant.`;

// Requires ANTHROPIC_API_KEY to be set server-side (see .env.example).
export async function POST(request: NextRequest) {
  const { messages } = await request.json(); // [{ role: "user"|"assistant", content: string }]

  if (!process.env.ANTHROPIC_API_KEY) {
    return NextResponse.json(
      { error: "AI Advisor is not configured yet. Set ANTHROPIC_API_KEY in your environment." },
      { status: 501 }
    );
  }

  const res = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": process.env.ANTHROPIC_API_KEY,
      "anthropic-version": "2023-06-01",
    },
    body: JSON.stringify({
      model: "claude-sonnet-4-6",
      max_tokens: 800,
      system: SYSTEM_PROMPT,
      messages,
    }),
  });

  const data = await res.json();
  if (!res.ok) return NextResponse.json({ error: data }, { status: 502 });

  const reply = data.content?.map((b: any) => b.text).join("\n") ?? "";
  return NextResponse.json({ reply });
}

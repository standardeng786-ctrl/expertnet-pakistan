"use client";

export function trackEvent(event_type: string, extra?: Record<string, unknown>) {
  try {
    fetch("/api/analytics/events", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ event_type, ...extra }),
      keepalive: true,
    }).catch(() => {});
  } catch {
    // analytics must never break the user-facing action
  }
}

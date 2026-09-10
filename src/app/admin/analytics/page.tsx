import { createServerSupabase } from "@/lib/supabase/server";

async function countSince(supabase: any, table: string, since: Date, filters?: Record<string, any>) {
  let q = supabase.from(table).select("*", { count: "exact", head: true }).gte("created_at", since.toISOString());
  if (filters) for (const [k, v] of Object.entries(filters)) q = q.eq(k, v);
  const { count } = await q;
  return count ?? 0;
}

export default async function AnalyticsPage() {
  const supabase = createServerSupabase();
  const since30 = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);

  const [
    visitorsToday,
    searches30d,
    profileViews30d,
    waClicks30d,
    callClicks30d,
    quotationRequests30d,
    requirementsPosted30d,
    leadsGenerated30d,
    conversionsAwarded30d,
    activeSubscribers,
  ] = await Promise.all([
    countSince(supabase, "analytics_events", todayStart, { event_type: "page_view" }),
    countSince(supabase, "analytics_events", since30, { event_type: "search" }),
    countSince(supabase, "analytics_events", since30, { event_type: "profile_view" }),
    countSince(supabase, "analytics_events", since30, { event_type: "whatsapp_click" }),
    countSince(supabase, "analytics_events", since30, { event_type: "call_click" }),
    countSince(supabase, "rfqs", since30),
    countSince(supabase, "requirements", since30),
    countSince(supabase, "leads", since30),
    supabase.from("rfqs").select("*", { count: "exact", head: true }).eq("status", "awarded")
      .then((r: any) => r.count ?? 0),
    supabase.from("subscriptions").select("*", { count: "exact", head: true }).eq("status", "active")
      .then((r: any) => r.count ?? 0),
  ]);

  const { data: topCategoryEvents } = await supabase
    .from("analytics_events")
    .select("category_id, categories(name)")
    .eq("event_type", "search")
    .gte("created_at", since30.toISOString())
    .not("category_id", "is", null);

  const { data: topCityEvents } = await supabase
    .from("analytics_events")
    .select("city_id, cities(name)")
    .eq("event_type", "search")
    .gte("created_at", since30.toISOString())
    .not("city_id", "is", null);

  const categoryCounts = tally(topCategoryEvents, (e: any) => e.categories?.name);
  const cityCounts = tally(topCityEvents, (e: any) => e.cities?.name);

  const revenue30d = await supabase
    .from("payments")
    .select("amount")
    .eq("status", "paid")
    .gte("created_at", since30.toISOString())
    .then((r: any) => (r.data ?? []).reduce((sum: number, p: any) => sum + Number(p.amount), 0));

  const cards = [
    { label: "Visitors Today", value: visitorsToday },
    { label: "Searches (30d)", value: searches30d },
    { label: "Profile Views (30d)", value: profileViews30d },
    { label: "WhatsApp Clicks (30d)", value: waClicks30d },
    { label: "Call Clicks (30d)", value: callClicks30d },
    { label: "Quotation Requests (30d)", value: quotationRequests30d },
    { label: "Requirements Posted (30d)", value: requirementsPosted30d },
    { label: "Leads Generated (30d)", value: leadsGenerated30d },
    { label: "Conversions (Awarded)", value: conversionsAwarded30d },
    { label: "Active Subscribers", value: activeSubscribers },
    { label: "Revenue (30d, PKR)", value: revenue30d.toLocaleString() },
  ];

  return (
    <div>
      <h1 className="text-2xl font-bold text-navy mb-1">Analytics</h1>
      <p className="text-sm text-gray-500 mb-6">
        All figures below are computed live from analytics_events, rfqs, requirements, leads, subscriptions
        and payments — no placeholder numbers.
      </p>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
        {cards.map((c) => (
          <div key={c.label} className="border rounded-md p-4">
            <p className="text-2xl font-bold text-navy">{c.value}</p>
            <p className="text-xs text-gray-600">{c.label}</p>
          </div>
        ))}
      </div>

      <div className="grid md:grid-cols-2 gap-8">
        <div>
          <h2 className="font-bold text-navy mb-3">Most Searched Categories (30d)</h2>
          <RankedList data={categoryCounts} empty="No category searches recorded yet." />
        </div>
        <div>
          <h2 className="font-bold text-navy mb-3">Most Searched Cities (30d)</h2>
          <RankedList data={cityCounts} empty="No city-filtered searches recorded yet." />
        </div>
      </div>
    </div>
  );
}

function tally(rows: any[] | null, keyFn: (row: any) => string | undefined) {
  const counts: Record<string, number> = {};
  for (const row of rows ?? []) {
    const key = keyFn(row);
    if (!key) continue;
    counts[key] = (counts[key] ?? 0) + 1;
  }
  return Object.entries(counts).sort((a, b) => b[1] - a[1]).slice(0, 10);
}

function RankedList({ data, empty }: { data: [string, number][]; empty: string }) {
  if (data.length === 0) return <p className="text-sm text-gray-500">{empty}</p>;
  return (
    <ul className="space-y-1 text-sm">
      {data.map(([name, count]) => (
        <li key={name} className="flex justify-between border-b py-1">
          <span>{name}</span>
          <span className="text-gray-500">{count}</span>
        </li>
      ))}
    </ul>
  );
}

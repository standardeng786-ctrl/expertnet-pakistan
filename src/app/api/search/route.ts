import { NextRequest, NextResponse } from "next/server";
import { createServerSupabase } from "@/lib/supabase/server";

// GET /api/search?q=hvac&city=karachi&category=hvac&verified=true
// Real database-backed search across companies, professionals, and products.
// No static/mock data — every result is a live row from Supabase.
export async function GET(request: NextRequest) {
  const supabase = createServerSupabase();
  const { searchParams } = new URL(request.url);

  const q = searchParams.get("q")?.trim() ?? "";
  const city = searchParams.get("city")?.trim();
  const categorySlug = searchParams.get("category")?.trim();
  const verifiedOnly = searchParams.get("verified") === "true";

  let categoryId: string | null = null;
  if (categorySlug) {
    const { data: cat } = await supabase
      .from("categories")
      .select("id")
      .eq("slug", categorySlug)
      .maybeSingle();
    categoryId = cat?.id ?? null;
  }

  let cityId: string | null = null;
  if (city) {
    const { data: cityRow } = await supabase
      .from("cities")
      .select("id")
      .ilike("name", city)
      .maybeSingle();
    cityId = cityRow?.id ?? null;
  }

  let companiesQuery = supabase
    .from("companies")
    .select("id, name, slug, city_id, category_ids, verification_status")
    .limit(20);

  if (q) companiesQuery = companiesQuery.ilike("name", `%${q}%`);
  if (cityId) companiesQuery = companiesQuery.eq("city_id", cityId);
  if (categoryId) companiesQuery = companiesQuery.contains("category_ids", [categoryId]);
  if (verifiedOnly) companiesQuery = companiesQuery.eq("verification_status", "verified");

  const { data: companies, error } = await companiesQuery;

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  // Phase 2: also search professionals and products so "MEP Consultant
  // Islamabad" or a specific equipment name surfaces results beyond companies.
  let professionalsQuery = supabase
    .from("professionals")
    .select("id, slug, designation, category_ids, profiles(full_name)")
    .limit(20);
  if (categoryId) professionalsQuery = professionalsQuery.contains("category_ids", [categoryId]);

  let productsQuery = supabase
    .from("products")
    .select("id, name, slug, category_id, companies(name)")
    .limit(20);
  if (q) productsQuery = productsQuery.ilike("name", `%${q}%`);
  if (categoryId) productsQuery = productsQuery.eq("category_id", categoryId);

  const [{ data: professionals }, { data: products }] = await Promise.all([
    professionalsQuery,
    productsQuery,
  ]);

  // Fire-and-forget analytics event (does not block the response)
  supabase
    .from("analytics_events")
    .insert({
      event_type: "search",
      entity_type: "search",
      city_id: cityId,
      category_id: categoryId,
    })
    .then(() => {});

  const results = [
    ...(companies ?? []).map((c) => ({
      type: "company" as const,
      id: c.id,
      name: c.name,
      slug: c.slug,
      city_id: c.city_id,
      category_ids: c.category_ids,
      verified: c.verification_status === "verified",
    })),
    ...(professionals ?? []).map((p: any) => ({
      type: "professional" as const,
      id: p.id,
      name: p.profiles?.full_name ?? p.designation ?? "Professional",
      slug: p.slug,
      city_id: null,
      category_ids: p.category_ids,
      verified: false,
    })),
    ...(products ?? []).map((p: any) => ({
      type: "product" as const,
      id: p.id,
      name: `${p.name} — ${p.companies?.name ?? ""}`.trim(),
      slug: p.slug,
      city_id: null,
      category_ids: p.category_id ? [p.category_id] : [],
      verified: false,
    })),
  ];

  return NextResponse.json({ query: q, city, category: categorySlug, results });
}

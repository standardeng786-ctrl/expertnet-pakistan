import type { MetadataRoute } from "next";
import { createServerSupabase } from "@/lib/supabase/server";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const supabase = createServerSupabase();

  const [{ data: companies }, { data: professionals }, { data: products }, { data: categories }, { data: cities }] =
    await Promise.all([
      supabase.from("companies").select("slug, updated_at"),
      supabase.from("professionals").select("slug, created_at"),
      supabase.from("products").select("slug, created_at"),
      supabase.from("categories").select("slug"),
      supabase.from("cities").select("name"),
    ]);

  const staticRoutes: MetadataRoute.Sitemap = [
    { url: SITE_URL, changeFrequency: "daily", priority: 1 },
    { url: `${SITE_URL}/search`, changeFrequency: "daily", priority: 0.8 },
    { url: `${SITE_URL}/ai-advisor`, changeFrequency: "weekly", priority: 0.6 },
    { url: `${SITE_URL}/billing/plans`, changeFrequency: "monthly", priority: 0.4 },
  ];

  const companyRoutes = (companies ?? []).map((c) => ({
    url: `${SITE_URL}/company/${c.slug}`,
    lastModified: c.updated_at ?? undefined,
    changeFrequency: "weekly" as const,
    priority: 0.7,
  }));

  const professionalRoutes = (professionals ?? []).map((p) => ({
    url: `${SITE_URL}/professional/${p.slug}`,
    lastModified: p.created_at ?? undefined,
    changeFrequency: "weekly" as const,
    priority: 0.6,
  }));

  const productRoutes = (products ?? []).map((p) => ({
    url: `${SITE_URL}/product/${p.slug}`,
    lastModified: p.created_at ?? undefined,
    changeFrequency: "weekly" as const,
    priority: 0.6,
  }));

  const categoryRoutes = (categories ?? []).map((c) => ({
    url: `${SITE_URL}/category/${c.slug}`,
    changeFrequency: "weekly" as const,
    priority: 0.5,
  }));

  const cityRoutes = (cities ?? []).map((c) => ({
    url: `${SITE_URL}/city/${c.name.toLowerCase().replace(/\s+/g, "-")}`,
    changeFrequency: "weekly" as const,
    priority: 0.5,
  }));

  return [...staticRoutes, ...companyRoutes, ...professionalRoutes, ...productRoutes, ...categoryRoutes, ...cityRoutes];
}

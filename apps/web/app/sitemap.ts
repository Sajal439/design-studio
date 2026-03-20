import { MetadataRoute } from "next";
import { prisma } from "@repo/database";

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://goeltraders.com";

const CATEGORY_SLUGS = ["kitchen", "wardrobe", "tv-unit", "bedroom", "study", "office"];
const CITY_SLUGS = ["karnal", "panipat", "kurukshetra", "ambala", "kaithal", "rohtak", "sonipat"];

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  // Static routes
  const staticRoutes: MetadataRoute.Sitemap = [
    { url: BASE_URL, lastModified: new Date(), changeFrequency: "weekly", priority: 1 },
    { url: `${BASE_URL}/designs`, lastModified: new Date(), changeFrequency: "daily", priority: 0.9 },
    { url: `${BASE_URL}/estimator`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.8 },
    { url: `${BASE_URL}/quote`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.7 },
  ];

  // Dynamic design pages
  const designs = await prisma.design.findMany({
    select: { slug: true, updatedAt: true },
  });
  const designRoutes: MetadataRoute.Sitemap = designs.map((d) => ({
    url: `${BASE_URL}/designs/${d.slug}`,
    lastModified: d.updatedAt,
    changeFrequency: "monthly",
    priority: 0.7,
  }));

  // SEO category × city landing pages
  const seoRoutes: MetadataRoute.Sitemap = CATEGORY_SLUGS.flatMap((cat) =>
    CITY_SLUGS.map((city) => ({
      url: `${BASE_URL}/designs/${cat}/${city}`,
      lastModified: new Date(),
      changeFrequency: "monthly" as const,
      priority: 0.65,
    })),
  );

  return [...staticRoutes, ...designRoutes, ...seoRoutes];
}

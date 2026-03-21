import { unstable_cache } from "next/cache";
import { prisma } from "@repo/database";
import type { Metadata } from "next";
import { DesignGalleryClient } from "@/components/marketing/design-gallery-client";
import { getFirstImageUrl } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Design Gallery | Goel Traders Design Studio",
  description: "Browse curated interior design inspirations for kitchens, wardrobes, bedrooms, TV units, and more.",
};

// ── Cached fetchers ────────────────────────────────────────────────────────────

const getCategories = unstable_cache(
  async () =>
    prisma.category.findMany({ where: { type: "design" }, orderBy: { name: "asc" } }),
  ["design-gallery-categories"],
  { revalidate: 300, tags: ["categories"] },
);

const getDesigns = unstable_cache(
  async (category?: string) => {
    const where = category && category !== "all"
      ? { category: { slug: category } }
      : {};
    return prisma.design.findMany({
      where,
      include: { category: true },
      orderBy: { createdAt: "desc" },
    });
  },
  ["design-gallery-designs"],
  { revalidate: 300, tags: ["designs"] },
);

// ── Page ───────────────────────────────────────────────────────────────────────

export default async function DesignsPage({
  searchParams,
}: {
  searchParams: Promise<{ category?: string }>;
}) {
  const { category } = await searchParams;
  const activeCategory = category || "all";
  const [categories, designs] = await Promise.all([
    getCategories(),
    getDesigns(activeCategory),
  ]);

  return (
    <div className="py-12">
      <div className="container mx-auto px-4">
        <div className="mb-10 text-center">
          <h1 className="mb-3 text-4xl font-bold">Design Gallery</h1>
          <p className="text-lg text-muted-foreground">
            Explore curated interior designs. Click any design for material details
            and cost estimates.
          </p>
        </div>
        <DesignGalleryClient
          activeCategory={activeCategory}
          categories={categories.map((cat) => ({
            id: cat.id,
            slug: cat.slug,
            label: cat.label,
          }))}
          designs={designs.map((design) => ({
            id: design.id,
            slug: design.slug,
            title: design.title,
            description: design.description,
            estimatedCost: design.estimatedCost,
            imageUrl: getFirstImageUrl(design.images),
            category: {
              label: design.category.label,
              slug: design.category.slug,
            },
          }))}
        />
      </div>
    </div>
  );
}

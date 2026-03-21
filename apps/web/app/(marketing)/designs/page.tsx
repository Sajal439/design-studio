import Image from "next/image";
import Link from "next/link";
import { unstable_cache } from "next/cache";
import { prisma } from "@repo/database";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowRight } from "lucide-react";
import type { Metadata } from "next";
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

        {/* Category filters */}
        <div className="mb-10 flex flex-wrap justify-center gap-2">
          <Link href="/designs">
            <Badge
              variant={activeCategory === "all" ? "default" : "outline"}
              className="cursor-pointer px-4 py-2 text-sm"
            >
              All
            </Badge>
          </Link>
          {categories.map((cat) => (
            <Link key={cat.id} href={`/designs?category=${cat.slug}`}>
              <Badge
                variant={activeCategory === cat.slug ? "default" : "outline"}
                className="cursor-pointer px-4 py-2 text-sm"
              >
                {cat.label}
              </Badge>
            </Link>
          ))}
        </div>

        {/* Design grid */}
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {designs.map((design, index) => (
            <Link key={design.id} href={`/designs/${design.slug}`}>
              <Card className="group h-full overflow-hidden transition-all hover:-translate-y-1 hover:shadow-lg">
                <div className="relative aspect-video bg-muted">
                  {getFirstImageUrl(design.images) ? (
                    <Image
                      alt={design.title}
                      className="object-cover transition-transform duration-300 group-hover:scale-105"
                      fill
                      // First 6 cards are above the fold on desktop — load eagerly
                      priority={index < 6}
                      sizes="(max-width: 1024px) 50vw, 33vw"
                      src={getFirstImageUrl(design.images)!}
                    />
                  ) : null}
                </div>
                <CardContent className="p-5">
                  <Badge variant="secondary" className="mb-2">
                    {design.category.label}
                  </Badge>
                  <h3 className="mb-1 text-lg font-semibold transition-colors group-hover:text-primary">
                    {design.title}
                  </h3>
                  <p className="mb-3 line-clamp-2 text-sm text-muted-foreground">
                    {design.description}
                  </p>
                  <div className="flex items-center justify-between text-sm">
                    <span className="font-medium">{design.estimatedCost}</span>
                    <span className="flex items-center gap-1 text-primary">
                      View Details <ArrowRight className="h-3 w-3" />
                    </span>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}

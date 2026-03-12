import Link from "next/link";
import { prisma } from "@repo/database";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowRight } from "lucide-react";

export const metadata = {
  title: "Design Gallery | Goel Traders Design Studio",
  description: "Browse curated interior design inspirations for kitchens, wardrobes, bedrooms, TV units, and more.",
};

async function getCategories() {
  return prisma.category.findMany({
    where: { type: "design" },
    orderBy: { name: "asc" },
  });
}

async function getDesigns(category?: string) {
  const where = category && category !== "all"
    ? { category: { slug: category } }
    : {};

  return prisma.design.findMany({
    where,
    include: { category: true, materials: true },
    orderBy: { createdAt: "desc" },
  });
}

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
            Explore curated interior designs. Click any design for material details and cost estimates.
          </p>
        </div>

        {/* Category Filters */}
        <div className="mb-10 flex flex-wrap justify-center gap-2">
          <Link href="/designs">
            <Badge
              variant={activeCategory === "all" ? "default" : "outline"}
              className="cursor-pointer px-4 py-2 text-sm"
            >
              All
            </Badge>
          </Link>
          {categories.map((cat: { id: string; slug: string; label: string }) => (
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

        {/* Design Grid */}
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {designs.map((design: { id: string; slug: string; title: string; description: string; estimatedCost: string; category: { label: string }; materials: { id: string; name: string; quantity: number; unit: string }[] }) => (
            <Link key={design.id} href={`/designs/${design.slug}`}>
              <Card className="group h-full overflow-hidden transition-all hover:shadow-lg hover:-translate-y-1">
                <div className="aspect-video bg-gradient-to-br from-muted to-muted/50 flex items-center justify-center">
                  <span className="text-5xl opacity-30">🏠</span>
                </div>
                <CardContent className="p-5">
                  <Badge variant="secondary" className="mb-2">
                    {design.category.label}
                  </Badge>
                  <h3 className="mb-1 text-lg font-semibold group-hover:text-primary transition-colors">
                    {design.title}
                  </h3>
                  <p className="mb-3 text-sm text-muted-foreground line-clamp-2">
                    {design.description}
                  </p>
                  <div className="flex items-center justify-between text-sm">
                    <span className="font-medium">{design.estimatedCost}</span>
                    <span className="text-primary flex items-center gap-1">
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

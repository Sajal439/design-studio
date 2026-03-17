export const dynamic = "force-dynamic";

import Image from "next/image";
import Link from "next/link";
import { prisma } from "@repo/database";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowRight, CheckCircle, XCircle } from "lucide-react";
import { Metadata } from "next";
import { siteConfig } from "@/lib/site-config";

export async function generateMetadata({
  searchParams,
}: {
  searchParams: Promise<{ category?: string }>;
}): Promise<Metadata> {
  const { category } = await searchParams;
  let categoryLabel = "All products";

  if (category && category !== "all") {
    const cat = await prisma.category.findUnique({ where: { slug: category } });
    if (cat) {
      categoryLabel = cat.label;
    } else {
      categoryLabel = category
        .split("-")
        .map((s) => s.charAt(0).toUpperCase() + s.slice(1))
        .join(" ");
    }
  }

  return {
    title: `${categoryLabel} | ${siteConfig.name}`,
    description: `Browse ${categoryLabel.toLowerCase()} from trusted brands — Century, Greenply, Merino, Hettich, Hafele and more. Competitive pricing from Goel Traders.`,
  };
}

async function getProductCategories() {
  return prisma.category.findMany({ where: { type: "product" }, orderBy: { name: "asc" } });
}

async function getProducts(category?: string) {
  const where = category && category !== "all" ? { category: { slug: category } } : {};
  return prisma.product.findMany({ where, include: { category: true, specifications: true }, orderBy: { createdAt: "desc" } });
}

export default async function ProductsPage({ searchParams }: { searchParams: Promise<{ category?: string }> }) {
  const { category } = await searchParams;
  const activeCategory = category || "all";
  const [categories, products] = await Promise.all([getProductCategories(), getProducts(activeCategory)]);

  return (
    <div className="py-12">
      <div className="container mx-auto px-4">
        <div className="mb-10 text-center">
          <h1 className="mb-3 text-4xl font-bold">Our Products</h1>
          <p className="text-lg text-muted-foreground">Quality interior materials from trusted brands — plywood, laminates, hardware & more.</p>
        </div>

        <div className="mb-10 flex flex-wrap justify-center gap-2">
          <Link href="/products"><Badge variant={activeCategory === "all" ? "default" : "outline"} className="cursor-pointer px-4 py-2 text-sm">All</Badge></Link>
          {categories.map((cat: { id: string; slug: string; label: string }) => (
            <Link key={cat.id} href={`/products?category=${cat.slug}`}>
              <Badge variant={activeCategory === cat.slug ? "default" : "outline"} className="cursor-pointer px-4 py-2 text-sm">{cat.label}</Badge>
            </Link>
          ))}
        </div>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {products.map((product: { id: string; slug: string; name: string; brand: string; description: string; priceRange: string; inStock: boolean; images: string[]; category: { label: string } }) => (
            <Link key={product.id} href={`/products/${product.slug}`}>
              <Card className="group h-full overflow-hidden transition-all hover:-translate-y-1 hover:shadow-lg">
                <div className="relative aspect-[4/3] bg-muted">
                  {product.images[0] ? <Image alt={product.name} className="object-cover transition-transform duration-300 group-hover:scale-105" fill sizes="(max-width: 1024px) 50vw, 33vw" src={product.images[0]} /> : null}
                </div>
                <CardContent className="p-5">
                  <div className="mb-2 flex items-center justify-between">
                    <Badge variant="secondary" className="text-xs">{product.category.label}</Badge>
                    {product.inStock ? (
                      <span className="flex items-center gap-1 text-xs text-green-600"><CheckCircle className="h-3 w-3" /> In Stock</span>
                    ) : (
                      <span className="flex items-center gap-1 text-xs text-red-500"><XCircle className="h-3 w-3" /> Out of Stock</span>
                    )}
                  </div>
                  <h3 className="mb-1 text-lg font-semibold transition-colors group-hover:text-primary">{product.name}</h3>
                  <p className="mb-1 text-xs text-muted-foreground">{product.brand}</p>
                  <p className="mb-3 line-clamp-2 text-sm text-muted-foreground">{product.description}</p>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">{product.priceRange}</span>
                    <span className="flex items-center gap-1 text-sm text-primary">Details <ArrowRight className="h-3 w-3" /></span>
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


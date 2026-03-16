import { prisma } from "@repo/database";
import { cache } from "react";

export type LiveProduct = {
  slug: string;
  name: string;
  category: string;
  brand: string;
  unit: string;
  priceRange: string;
  inStock: boolean;
};

export type LiveMapping = {
  pattern: RegExp;
  productSlugs: string[];
  reason: string;
};

export type ProductCatalog = {
  // Keyed by slug for O(1) lookup
  bySlug: Map<string, LiveProduct>;
  // Ordered mapping rules (sorted by priority ASC)
  mappings: LiveMapping[];
};

export const loadProductCatalog = cache(async (): Promise<ProductCatalog> => {
  const [products, mappingRows] = await Promise.all([
    prisma.product.findMany({
      where: { inStock: true },
      select: {
        slug: true,
        name: true,
        category: {
          select: { name: true },
        },
        brand: true,
        unit: true,
        priceRange: true,
        inStock: true,
      },
    }),
    prisma.productMapping.findMany({
      where: { active: true },
      orderBy: { priority: "asc" },
    }),
  ]);

  const bySlug = new Map<string, LiveProduct>(
    products.map((p) => [
      p.slug,
      {
        ...p,
        category: p.category.name,
      },
    ])
  );

  const mappings: LiveMapping[] = mappingRows.map((row) => ({
    pattern: new RegExp(row.pattern, "i"),
    productSlugs: row.productSlugs,
    reason: row.reason,
  }));

  return { bySlug, mappings };
});

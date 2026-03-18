/**
 * scripts/bulk-upload-products.ts
 *
 * Bulk-import products + specs from docs/products-data.json into the database.
 * Idempotent: skips products whose slugs already exist.
 *
 * Usage:
 *   cd c:/dev/design studio
 *   npx tsx scripts/bulk-upload-products.ts
 *
 * Input format (docs/products-data.json):
 * [
 *   {
 *     "name": "BWR Plywood 18mm",
 *     "slug": "bwr-plywood-18mm",
 *     "brand": "CenturyPly",
 *     "category": "plywood",         <- must match an existing category slug
 *     "description": "...",
 *     "priceRange": "₹65-90/sqft",
 *     "unit": "sqft",
 *     "images": ["https://..."],
 *     "inStock": true,
 *     "specifications": [
 *       { "label": "Thickness", "value": "18mm" }
 *     ]
 *   }
 * ]
 */

import { PrismaClient } from "@prisma/client";
import { readFileSync } from "fs";
import { resolve } from "path";

const prisma = new PrismaClient();

interface ProductRow {
  name: string;
  slug: string;
  brand: string;
  category: string; // category slug
  description: string;
  priceRange: string;
  unit: string;
  images: string[];
  inStock?: boolean;
  specifications?: { label: string; value: string }[];
}

async function main() {
  const dataPath = resolve(process.cwd(), "docs/products-data.json");
  let rows: ProductRow[];

  try {
    rows = JSON.parse(readFileSync(dataPath, "utf-8")) as ProductRow[];
  } catch {
    console.error(`❌  Could not read ${dataPath}`);
    console.error("   Create docs/products-data.json using the format in this file's header comment.");
    process.exit(1);
  }

  console.log(`📦  Found ${rows.length} products to import.`);

  const categories = await prisma.category.findMany({ select: { id: true, slug: true } });
  const catMap = new Map(categories.map((c) => [c.slug, c.id]));

  let created = 0;
  let skipped = 0;
  let errors = 0;

  for (const row of rows) {
    const categoryId = catMap.get(row.category);
    if (!categoryId) {
      console.warn(`⚠️   Unknown category "${row.category}" for "${row.slug}" — skipping.`);
      skipped++;
      continue;
    }

    const existing = await prisma.product.findUnique({ where: { slug: row.slug } });
    if (existing) {
      console.log(`⏭️   Skipping existing: ${row.slug}`);
      skipped++;
      continue;
    }

    try {
      await prisma.product.create({
        data: {
          name: row.name,
          slug: row.slug,
          brand: row.brand,
          description: row.description,
          priceRange: row.priceRange,
          unit: row.unit,
          images: row.images,
          inStock: row.inStock ?? true,
          categoryId,
          specifications: row.specifications
            ? {
                create: row.specifications.map((s) => ({
                  label: s.label,
                  value: s.value,
                })),
              }
            : undefined,
        },
      });
      console.log(`✅  Created: ${row.slug}`);
      created++;
    } catch (err) {
      console.error(`❌  Error creating ${row.slug}:`, err);
      errors++;
    }
  }

  console.log(
    `\n🎉  Done. Created: ${created}, Skipped: ${skipped}, Errors: ${errors}`,
  );
}

main()
  .then(() => prisma.$disconnect())
  .catch((err) => {
    console.error(err);
    prisma.$disconnect();
    process.exit(1);
  });

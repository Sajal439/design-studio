/**
 * scripts/bulk-upload-designs.ts
 *
 * Bulk-import designs from docs/designs-data.json into the database.
 * Idempotent: skips designs whose slugs already exist.
 *
 * Usage:
 *   cd c:/dev/design studio
 *   npx tsx scripts/bulk-upload-designs.ts
 *
 * Input format (docs/designs-data.json):
 * [
 *   {
 *     "title": "Modern L-Kitchen",
 *     "slug": "modern-l-kitchen",
 *     "category": "kitchen",         <- must match an existing category slug
 *     "description": "...",
 *     "style": "Modern",
 *     "roomSize": "10x12 ft",
 *     "estimatedCost": "₹2.5L - ₹4L",
 *     "images": ["https://..."],
 *     "materials": [
 *       { "name": "BWR Plywood 18mm", "quantity": 120, "unit": "sqft" }
 *     ]
 *   }
 * ]
 */

import { PrismaClient } from "@prisma/client";
import { readFileSync } from "fs";
import { resolve } from "path";

const prisma = new PrismaClient();

interface DesignRow {
  title: string;
  slug: string;
  category: string; // category slug
  description: string;
  style: string;
  roomSize: string;
  estimatedCost: string;
  images: string[];
  materials?: { name: string; quantity: number; unit: string }[];
}

async function main() {
  const dataPath = resolve(process.cwd(), "docs/designs-data.json");
  let rows: DesignRow[];

  try {
    rows = JSON.parse(readFileSync(dataPath, "utf-8")) as DesignRow[];
  } catch {
    console.error(`❌  Could not read ${dataPath}`);
    console.error("   Create docs/designs-data.json using the format in this file's header comment.");
    process.exit(1);
  }

  console.log(`📦  Found ${rows.length} designs to import.`);

  // Cache categories
  const categories = await prisma.category.findMany({
    select: { id: true, slug: true },
  });
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

    const existing = await prisma.design.findUnique({ where: { slug: row.slug } });
    if (existing) {
      console.log(`⏭️   Skipping existing: ${row.slug}`);
      skipped++;
      continue;
    }

    try {
      await prisma.design.create({
        data: {
          title: row.title,
          slug: row.slug,
          description: row.description,
          style: row.style,
          roomSize: row.roomSize,
          estimatedCost: row.estimatedCost,
          images: row.images,
          categoryId,
          materials: row.materials
            ? {
                create: row.materials.map((m) => ({
                  name: m.name,
                  quantity: m.quantity,
                  unit: m.unit,
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

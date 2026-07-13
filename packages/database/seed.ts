import { PrismaClient } from "@prisma/client";
import { seedPriceBook } from "./prisma/seeds/priceBook";
import { seedProducts } from "./prisma/seeds/productSeed";

const prisma = new PrismaClient();

// Main Prisma seed entrypoint.
// Run via: npm run db:seed  (or automatically after prisma migrate reset)

async function main() {
  console.log("Seeding database...");

  await seedPriceBook(prisma);
  await seedProducts(prisma);

  const categories = [
    { slug: "kitchen",  label: "Modular Kitchens",    name: "kitchen",  type: "design" },
    { slug: "wardrobe", label: "Wardrobes",            name: "wardrobe", type: "design" },
    { slug: "tv-unit",  label: "TV Units",             name: "tv-unit",  type: "design" },
    { slug: "bedroom",  label: "Bedroom Interiors",    name: "bedroom",  type: "design" },
    { slug: "study",    label: "Study Tables",         name: "study",    type: "design" },
    { slug: "office",   label: "Office Furniture",     name: "office",   type: "design" },
  ] as const;

  for (const category of categories) {
    await prisma.category.upsert({
      where:  { slug: category.slug },
      update: category,
      create: category,
    });
  }

  console.log(`Seeded price book, products, and ${categories.length} categories.`);
}

main()
  .catch((error) => {
    console.error("Seed error:", error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

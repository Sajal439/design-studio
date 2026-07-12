/**
 * packages/database/prisma/seeds/productSeed.ts
 *
 * Seeds the default kitchen appliance products (chimney + hob)
 * for each pricing tier. The estimator picks the isDefault=true product
 * per (category, tier) pair.
 */

import { PrismaClient } from "@prisma/client";

const defaultProducts = [
  // Chimney
  {
    id: "seed-chimney-BUDGET",
    name: "Standard Wall-Mount Chimney",
    brand: "Generic",
    description: "60cm wall-mount chimney with basic suction and mesh filter.",
    category: "chimney",
    tier: "BUDGET",
    price: 10000,
    isDefault: true,
  },
  {
    id: "seed-chimney-STANDARD",
    name: "Glen 60cm Auto-Clean Chimney",
    brand: "Glen",
    description: "60cm auto-clean chimney with baffle filter and LED lights.",
    category: "chimney",
    tier: "STANDARD",
    price: 18000,
    isDefault: true,
  },
  {
    id: "seed-chimney-PREMIUM",
    name: "Faber 90cm Touch Control Chimney",
    brand: "Faber",
    description: "90cm curved glass chimney with touch control and filterless technology.",
    category: "chimney",
    tier: "PREMIUM",
    price: 30000,
    isDefault: true,
  },
  // Hob
  {
    id: "seed-hob-BUDGET",
    name: "2-Burner LPG Hob",
    brand: "Generic",
    description: "Standard 2-burner glass-top hob, manual ignition.",
    category: "hob",
    tier: "BUDGET",
    price: 5000,
    isDefault: true,
  },
  {
    id: "seed-hob-STANDARD",
    name: "Prestige 3-Burner Glass Hob",
    brand: "Prestige",
    description: "3-burner toughened glass hob with auto-ignition.",
    category: "hob",
    tier: "STANDARD",
    price: 9000,
    isDefault: true,
  },
  {
    id: "seed-hob-PREMIUM",
    name: "Elica 4-Burner Premium Hob",
    brand: "Elica",
    description: "4-burner glass hob with Italian burners and flame failure device.",
    category: "hob",
    tier: "PREMIUM",
    price: 16000,
    isDefault: true,
  },
];

export async function seedProducts(prisma: PrismaClient) {
  console.log("Seeding products...");
  for (const product of defaultProducts) {
    await prisma.product.upsert({
      where: { id: product.id },
      update: { name: product.name, brand: product.brand, description: product.description, price: product.price, isDefault: product.isDefault, active: true },
      create: { ...product, active: true },
    });
  }
  console.log(`Seeded ${defaultProducts.length} products.`);
}

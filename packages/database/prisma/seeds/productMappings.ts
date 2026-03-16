import { PrismaClient } from "@prisma/client";

const mappings = [
  {
    pattern: "PLYWOOD|MDF|HDHMR",
    productSlugs: ["bwr-plywood-19mm", "marine-plywood-19mm"],
    reason:
      "Recommended board stock for carcass, shutters, and structural panels.",
    priority: 10,
  },
  {
    pattern: "LAMINATE|ACRYLIC",
    productSlugs: ["high-gloss-laminate-1mm", "matte-laminate-08mm"],
    reason:
      "Surface finish options mapped to the visible finish layers in the estimate.",
    priority: 20,
  },
  {
    pattern: "VENEER",
    productSlugs: ["teak-wood-veneer"],
    reason:
      "Premium natural veneer finish aligned to higher-end design selections.",
    priority: 30,
  },
  {
    pattern: "HINGE",
    productSlugs: ["soft-close-hinges"],
    reason:
      "Soft-close hinge recommendation matched to shutter hardware demand.",
    priority: 40,
  },
  {
    pattern: "CHANNEL",
    productSlugs: ["telescopic-drawer-channel"],
    reason: "Drawer movement hardware mapped from drawer modules.",
    priority: 50,
  },
  {
    pattern: "EDGE",
    productSlugs: ["pvc-edge-band-22mm"],
    reason:
      "Edge band quantity mapped to exposed panel edges in the module plan.",
    priority: 60,
  },
  {
    pattern: "ADHESIVE|GLUE",
    productSlugs: ["fevicol-sh-adhesive"],
    reason: "Adhesive recommendation for fabrication and laminate bonding.",
    priority: 70,
  },
] as const;

export async function seedProductMappings(prisma: PrismaClient) {
  console.log("Seeding product mappings...");
  let count = 0;
  for (const m of mappings) {
    await prisma.productMapping.upsert({
      where: { id: `seed-${m.priority}` },
      update: { ...m, productSlugs: [...m.productSlugs] },
      create: {
        id: `seed-${m.priority}`,
        ...m,
        productSlugs: [...m.productSlugs],
      },
    });
    count++;
  }
  console.log(`Seeded ${count} product mappings.`);
}

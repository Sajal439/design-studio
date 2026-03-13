import { PrismaClient } from "./src/generated/client";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Seeding database...");

  // ─── Design Categories ─────────────────────────────────────
  const designCategories = [
    { slug: "kitchen", label: "Modular Kitchens", name: "kitchen", type: "design" },
    { slug: "wardrobe", label: "Wardrobes", name: "wardrobe", type: "design" },
    { slug: "tv-unit", label: "TV Units", name: "tv-unit", type: "design" },
    { slug: "bedroom", label: "Bedroom Interiors", name: "bedroom", type: "design" },
    { slug: "study", label: "Study Tables", name: "study", type: "design" },
    { slug: "office", label: "Office Furniture", name: "office", type: "design" },
  ];

  // ─── Product Categories ────────────────────────────────────
  const productCategories = [
    { slug: "plywood", label: "Plywood", name: "plywood", type: "product" },
    { slug: "laminates", label: "Laminates", name: "laminates", type: "product" },
    { slug: "hardware", label: "Hardware & Fittings", name: "hardware", type: "product" },
    { slug: "adhesives", label: "Adhesives", name: "adhesives", type: "product" },
    { slug: "veneers", label: "Veneers", name: "veneers", type: "product" },
    { slug: "edges", label: "Edge Bands", name: "edges", type: "product" },
  ];

  const allCategories = [...designCategories, ...productCategories];

  const categoryMap: Record<string, string> = {};
  for (const cat of allCategories) {
    const created = await prisma.category.upsert({
      where: { slug: cat.slug },
      update: { label: cat.label, name: cat.name, type: cat.type },
      create: cat,
    });
    categoryMap[cat.slug] = created.id;
  }
  console.log(`  ✅ ${allCategories.length} categories seeded`);

  // ─── Designs ───────────────────────────────────────────────
  const designs = [
    {
      title: "Modern L-Shaped Modular Kitchen",
      slug: "modern-l-shaped-kitchen",
      categorySlug: "kitchen",
      description: "A sleek L-shaped kitchen with handleless cabinets, quartz countertop, and integrated appliances. Perfect for medium-sized apartments.",
      estimatedCost: "₹2,50,000 - ₹3,50,000",
      roomSize: "10ft × 8ft",
      style: "Modern Minimalist",
      images: ["/placeholder-kitchen-1.jpg"],
      materials: [
        { name: "BWR Plywood (8×4)", quantity: 12, unit: "sheets" },
        { name: "Laminate Sheets", quantity: 14, unit: "sheets" },
        { name: "Soft-Close Hinges", quantity: 24, unit: "pieces" },
        { name: "Handles", quantity: 16, unit: "pieces" },
        { name: "Drawer Channels", quantity: 6, unit: "pairs" },
        { name: "Kitchen Baskets", quantity: 4, unit: "pieces" },
      ],
    },
    {
      title: "Classic Wooden Wardrobe with Mirror",
      slug: "classic-wooden-wardrobe",
      categorySlug: "wardrobe",
      description: "A 3-door wardrobe with full-length mirror, internal drawers, and hanging space. Timeless design with premium veneer finish.",
      estimatedCost: "₹1,20,000 - ₹1,80,000",
      roomSize: "7ft × 7ft × 2ft",
      style: "Classic",
      images: ["/placeholder-wardrobe-1.jpg"],
      materials: [
        { name: "BWR Plywood (8×4)", quantity: 8, unit: "sheets" },
        { name: "Veneer Sheets", quantity: 10, unit: "sheets" },
        { name: "Soft-Close Hinges", quantity: 9, unit: "pieces" },
        { name: "Handles", quantity: 3, unit: "pieces" },
        { name: "Drawer Channels", quantity: 4, unit: "pairs" },
        { name: "Mirror (6×2)", quantity: 1, unit: "piece" },
      ],
    },
    {
      title: "Contemporary Wall-Mounted TV Unit",
      slug: "contemporary-tv-unit",
      categorySlug: "tv-unit",
      description: "A floating TV unit with LED backlight panel, open shelves, and concealed storage. Wall-mounted for a clean, spacious look.",
      estimatedCost: "₹45,000 - ₹75,000",
      roomSize: "8ft × 5ft",
      style: "Contemporary",
      images: ["/placeholder-tv-1.jpg"],
      materials: [
        { name: "BWR Plywood (8×4)", quantity: 4, unit: "sheets" },
        { name: "Laminate Sheets", quantity: 5, unit: "sheets" },
        { name: "Soft-Close Hinges", quantity: 4, unit: "pieces" },
        { name: "LED Strip Light", quantity: 2, unit: "meters" },
        { name: "Wall Mounting Hardware", quantity: 1, unit: "set" },
      ],
    },
    {
      title: "Luxury Master Bedroom Interior",
      slug: "luxury-master-bedroom",
      categorySlug: "bedroom",
      description: "Complete bedroom package with upholstered bed back panel, side tables, dresser unit, and false ceiling cove lights.",
      estimatedCost: "₹3,00,000 - ₹4,50,000",
      roomSize: "14ft × 12ft",
      style: "Luxury",
      images: ["/placeholder-bedroom-1.jpg"],
      materials: [
        { name: "BWR Plywood (8×4)", quantity: 14, unit: "sheets" },
        { name: "Laminate Sheets", quantity: 12, unit: "sheets" },
        { name: "Fabric for Upholstery", quantity: 30, unit: "sq ft" },
        { name: "Soft-Close Hinges", quantity: 12, unit: "pieces" },
        { name: "Handles", quantity: 8, unit: "pieces" },
        { name: "Drawer Channels", quantity: 4, unit: "pairs" },
      ],
    },
    {
      title: "Compact Study Table with Bookshelf",
      slug: "compact-study-bookshelf",
      categorySlug: "study",
      description: "An ergonomic study setup with built-in bookshelf, cable management, and adjustable shelf heights. Ideal for students and WFH professionals.",
      estimatedCost: "₹25,000 - ₹40,000",
      roomSize: "5ft × 2ft × 6ft",
      style: "Functional Modern",
      images: ["/placeholder-study-1.jpg"],
      materials: [
        { name: "BWR Plywood (8×4)", quantity: 3, unit: "sheets" },
        { name: "Laminate Sheets", quantity: 4, unit: "sheets" },
        { name: "Shelf Supports", quantity: 8, unit: "pieces" },
        { name: "Handles", quantity: 2, unit: "pieces" },
        { name: "Drawer Channels", quantity: 2, unit: "pairs" },
      ],
    },
    {
      title: "Executive Office Cabin Furniture",
      slug: "executive-office-cabin",
      categorySlug: "office",
      description: "Full office cabin setup with L-shaped desk, overhead storage, filing cabinets, and visitor seating area divider.",
      estimatedCost: "₹1,80,000 - ₹2,50,000",
      roomSize: "12ft × 10ft",
      style: "Professional",
      images: ["/placeholder-office-1.jpg"],
      materials: [
        { name: "BWR Plywood (8×4)", quantity: 10, unit: "sheets" },
        { name: "Laminate Sheets", quantity: 12, unit: "sheets" },
        { name: "Soft-Close Hinges", quantity: 16, unit: "pieces" },
        { name: "Handles", quantity: 10, unit: "pieces" },
        { name: "Drawer Channels", quantity: 6, unit: "pairs" },
        { name: "Cable Grommet", quantity: 3, unit: "pieces" },
      ],
    },
  ];

  for (const d of designs) {
    const { categorySlug, materials, ...designData } = d;
    await prisma.design.upsert({
      where: { slug: d.slug },
      update: {
        ...designData,
        categoryId: categoryMap[categorySlug]!,
      },
      create: {
        ...designData,
        categoryId: categoryMap[categorySlug]!,
        materials: {
          create: materials,
        },
      },
    });
  }
  console.log(`  ✅ ${designs.length} designs seeded`);

  // ─── Products ──────────────────────────────────────────────
  const products = [
    {
      name: "BWR Grade Plywood 8×4 (19mm)",
      slug: "bwr-plywood-19mm",
      categorySlug: "plywood",
      brand: "Century Plyboards",
      description: "Boiling Water Resistant plywood ideal for kitchen cabinets, bathroom vanities, and areas exposed to moisture. IS:303 certified with 20+ year warranty.",
      priceRange: "₹85 - ₹110 / sq ft",
      unit: "sheet",
      images: ["/placeholder-plywood.jpg"],
      inStock: true,
      specifications: [
        { label: "Size", value: "8ft × 4ft" },
        { label: "Thickness", value: "19mm" },
        { label: "Grade", value: "BWR (IS:303)" },
        { label: "Core", value: "Hardwood" },
        { label: "Warranty", value: "20 Years" },
      ],
    },
    {
      name: "Marine Grade Plywood 8×4 (19mm)",
      slug: "marine-plywood-19mm",
      categorySlug: "plywood",
      brand: "Greenply",
      description: "Superior waterproof plywood for extreme moisture areas. IS:710 certified, suitable for boat building, exterior use, and wet-area furniture.",
      priceRange: "₹120 - ₹160 / sq ft",
      unit: "sheet",
      images: ["/placeholder-marine.jpg"],
      inStock: true,
      specifications: [
        { label: "Size", value: "8ft × 4ft" },
        { label: "Thickness", value: "19mm" },
        { label: "Grade", value: "Marine (IS:710)" },
        { label: "Core", value: "Hardwood" },
        { label: "Warranty", value: "25 Years" },
      ],
    },
    {
      name: "High Gloss Laminate Sheet (1mm)",
      slug: "high-gloss-laminate-1mm",
      categorySlug: "laminates",
      brand: "Merino Laminates",
      description: "Premium high-gloss finish laminate for modern kitchens and wardrobes. Scratch-resistant, anti-fingerprint coating with 200+ color options.",
      priceRange: "₹1,200 - ₹1,800 / sheet",
      unit: "sheet",
      images: ["/placeholder-laminate.jpg"],
      inStock: true,
      specifications: [
        { label: "Size", value: "8ft × 4ft" },
        { label: "Thickness", value: "1mm" },
        { label: "Finish", value: "High Gloss" },
        { label: "Surface", value: "Anti-fingerprint" },
        { label: "Colors Available", value: "200+" },
      ],
    },
    {
      name: "Matte Finish Laminate (0.8mm)",
      slug: "matte-laminate-08mm",
      categorySlug: "laminates",
      brand: "Royale Touche",
      description: "Elegant matte finish laminate with soft-touch feel. Perfect for bedroom wardrobes, study tables, and living room furniture.",
      priceRange: "₹900 - ₹1,400 / sheet",
      unit: "sheet",
      images: ["/placeholder-matte.jpg"],
      inStock: true,
      specifications: [
        { label: "Size", value: "8ft × 4ft" },
        { label: "Thickness", value: "0.8mm" },
        { label: "Finish", value: "Matte / Suede" },
        { label: "Surface", value: "Soft Touch" },
        { label: "Colors Available", value: "150+" },
      ],
    },
    {
      name: "Soft-Close Cabinet Hinges (Pair)",
      slug: "soft-close-hinges",
      categorySlug: "hardware",
      brand: "Hettich",
      description: "German-engineered hydraulic soft-close hinges. Self-closing mechanism, 110° opening angle, 50,000+ cycle tested for durability.",
      priceRange: "₹120 - ₹250 / pair",
      unit: "pair",
      images: ["/placeholder-hinge.jpg"],
      inStock: true,
      specifications: [
        { label: "Type", value: "Hydraulic Soft-Close" },
        { label: "Opening Angle", value: "110°" },
        { label: "Overlay", value: "Full / Half / Inset" },
        { label: "Load Capacity", value: "Up to 5 kg per hinge" },
        { label: "Durability", value: "50,000+ cycles" },
      ],
    },
    {
      name: "Telescopic Drawer Channel (Pair)",
      slug: "telescopic-drawer-channel",
      categorySlug: "hardware",
      brand: "Hafele",
      description: "Full-extension ball-bearing drawer slides with soft-close. Zinc-plated for corrosion resistance, suitable for kitchen and office drawers.",
      priceRange: "₹350 - ₹800 / pair",
      unit: "pair",
      images: ["/placeholder-channel.jpg"],
      inStock: true,
      specifications: [
        { label: "Type", value: "Full Extension" },
        { label: "Sizes", value: '12" / 16" / 18" / 20"' },
        { label: "Load Capacity", value: "45 kg" },
        { label: "Material", value: "Cold-rolled Steel" },
        { label: "Finish", value: "Zinc Plated" },
      ],
    },
    {
      name: "Fevicol SH Wood Adhesive",
      slug: "fevicol-sh-adhesive",
      categorySlug: "adhesives",
      brand: "Pidilite",
      description: "Industry-standard synthetic resin adhesive for wood-to-wood bonding. Superior bond strength, heat and water resistant, ideal for all furniture work.",
      priceRange: "₹200 - ₹450 / kg",
      unit: "kg",
      images: ["/placeholder-adhesive.jpg"],
      inStock: true,
      specifications: [
        { label: "Type", value: "Synthetic Resin" },
        { label: "Available Sizes", value: "500g / 1kg / 5kg / 10kg / 50kg" },
        { label: "Bond Strength", value: "High (D3 rated)" },
        { label: "Setting Time", value: "3-4 hours" },
        { label: "Resistance", value: "Heat & Water" },
      ],
    },
    {
      name: "Natural Teak Wood Veneer",
      slug: "teak-wood-veneer",
      categorySlug: "veneers",
      brand: "Decowood",
      description: "Premium natural teak veneer sheets with consistent grain pattern. Perfect for luxury wardrobes, doors, and wall paneling.",
      priceRange: "₹80 - ₹200 / sq ft",
      unit: "sheet",
      images: ["/placeholder-veneer.jpg"],
      inStock: true,
      specifications: [
        { label: "Size", value: "8ft × 4ft" },
        { label: "Thickness", value: "0.5mm" },
        { label: "Wood Type", value: "Natural Teak" },
        { label: "Grain", value: "Straight / Crown" },
        { label: "Finish", value: "Unfinished (ready for polish)" },
      ],
    },
    {
      name: "PVC Edge Band Roll (22mm)",
      slug: "pvc-edge-band-22mm",
      categorySlug: "edges",
      brand: "Rehau",
      description: "Color-matched PVC edge banding for a seamless furniture finish. Pre-glued for easy application with edge banding machines.",
      priceRange: "₹3 - ₹8 / meter",
      unit: "roll",
      images: ["/placeholder-edge.jpg"],
      inStock: true,
      specifications: [
        { label: "Width", value: "22mm" },
        { label: "Thickness", value: "0.8mm / 1mm / 2mm" },
        { label: "Roll Length", value: "50 meters" },
        { label: "Type", value: "Pre-glued" },
        { label: "Colors", value: "Matching with major laminate brands" },
      ],
    },
  ];

  for (const p of products) {
    const { categorySlug, specifications, ...productData } = p;
    await prisma.product.upsert({
      where: { slug: p.slug },
      update: {
        ...productData,
        categoryId: categoryMap[categorySlug]!,
      },
      create: {
        ...productData,
        categoryId: categoryMap[categorySlug]!,
        specifications: {
          create: specifications,
        },
      },
    });
  }
  console.log(`  ✅ ${products.length} products seeded`);

  console.log("🎉 Seeding complete!");
}

main()
  .catch((e) => {
    console.error("❌ Seed error:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

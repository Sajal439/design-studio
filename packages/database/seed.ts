import { PrismaClient } from "@prisma/client";
import { seedPriceBook } from "./prisma/seeds/priceBook";

const prisma = new PrismaClient();

// Main Prisma seed entrypoint.
// Use this for baseline categories, sample designs, and price-book data.

type SeedImage = {
  url: string;
  publicId: string;
};

function cloudinaryImage(publicId: string): SeedImage {
  return {
    publicId,
    url: `https://res.cloudinary.com/demo/image/upload/f_auto,q_auto,w_1200/${publicId}.jpg`,
  };
}

async function main() {
  console.log("Seeding database...");

  await seedPriceBook(prisma);

  const categories = [
    { slug: "kitchen", label: "Modular Kitchens", name: "kitchen", type: "design" },
    { slug: "wardrobe", label: "Wardrobes", name: "wardrobe", type: "design" },
    { slug: "tv-unit", label: "TV Units", name: "tv-unit", type: "design" },
    { slug: "bedroom", label: "Bedroom Interiors", name: "bedroom", type: "design" },
    { slug: "study", label: "Study Tables", name: "study", type: "design" },
    { slug: "office", label: "Office Furniture", name: "office", type: "design" },
  ] as const;

  const categoryIds = new Map<string, string>();

  for (const category of categories) {
    const record = await prisma.category.upsert({
      where: { slug: category.slug },
      update: category,
      create: category,
    });

    categoryIds.set(category.slug, record.id);
  }

  const designs = [
    {
      title: "Modern L-Shaped Modular Kitchen",
      slug: "modern-l-shaped-kitchen",
      categorySlug: "kitchen",
      description:
        "A sleek L-shaped kitchen with matte shutters, quartz countertop, and soft-close hardware for compact family homes.",
      estimatedCost: "₹2,50,000 - ₹3,50,000",
      roomSize: "10ft × 8ft",
      style: "Modern Minimalist",
      images: [
        cloudinaryImage("sample"),
        cloudinaryImage("samples/landscapes/nature-mountains"),
      ],
      tags: ["l-shape", "modern", "soft-close"],
      isRealWork: false,
      location: null,
      priceRange: null,
      badge: null,
      waText: "Hi! I want pricing for a modern L-shaped modular kitchen.",
    },
    {
      title: "Classic Wooden Wardrobe with Mirror",
      slug: "classic-wooden-wardrobe",
      categorySlug: "wardrobe",
      description:
        "A 3-door wardrobe with mirror, drawer stack, and warm wood finish designed for everyday family storage.",
      estimatedCost: "₹1,20,000 - ₹1,80,000",
      roomSize: "7ft × 7ft × 2ft",
      style: "Classic",
      images: [
        cloudinaryImage("samples/people/jazz"),
        cloudinaryImage("samples/animals/three-dogs"),
      ],
      tags: ["wardrobe", "mirror", "classic"],
      isRealWork: false,
      location: null,
      priceRange: null,
      badge: null,
      waText: "Hi! I want pricing for a wardrobe like this one.",
    },
    {
      title: "Contemporary Wall-Mounted TV Unit",
      slug: "contemporary-tv-unit",
      categorySlug: "tv-unit",
      description:
        "A floating TV wall with concealed storage, display shelves, and a clean low-maintenance laminate finish.",
      estimatedCost: "₹45,000 - ₹75,000",
      roomSize: "8ft × 5ft",
      style: "Contemporary",
      images: [
        cloudinaryImage("samples/ecommerce/accessories-bag"),
        cloudinaryImage("samples/landscapes/beach-boat"),
      ],
      tags: ["tv-unit", "floating", "living-room"],
      isRealWork: true,
      location: "Sector 13, Karnal",
      priceRange: "₹68,000",
      badge: "Delivered",
      waText: "Hi! I want a TV unit with similar storage and finish.",
    },
    {
      title: "Luxury Master Bedroom Interior",
      slug: "luxury-master-bedroom",
      categorySlug: "bedroom",
      description:
        "Full-height wardrobes with upholstered headboard and premium finish details for a warm luxury bedroom setup.",
      estimatedCost: "₹3,00,000 - ₹4,50,000",
      roomSize: "14ft × 12ft",
      style: "Luxury",
      images: [
        cloudinaryImage("samples/landscapes/girl-urban-view"),
        cloudinaryImage("samples/landscapes/architecture-signs"),
      ],
      tags: ["bedroom", "luxury", "wardrobe"],
      isRealWork: true,
      location: "Model Town, Panipat",
      priceRange: "₹3.8L",
      badge: "Real Project",
      waText: "Hi! I want bedroom interiors in this premium style.",
    },
    {
      title: "Compact Study Table with Bookshelf",
      slug: "compact-study-bookshelf",
      categorySlug: "study",
      description:
        "A practical study setup with overhead shelves, drawer storage, and cable management for work-from-home rooms.",
      estimatedCost: "₹25,000 - ₹40,000",
      roomSize: "5ft × 2ft × 6ft",
      style: "Functional Modern",
      images: [
        cloudinaryImage("samples/food/spices"),
        cloudinaryImage("samples/animals/reindeer"),
      ],
      tags: ["study", "compact", "storage"],
      isRealWork: false,
      location: null,
      priceRange: null,
      badge: null,
      waText: "Hi! I want a study table with bookshelf and storage.",
    },
    {
      title: "Executive Office Cabin Furniture",
      slug: "executive-office-cabin",
      categorySlug: "office",
      description:
        "A coordinated office cabin with desk, overhead cabinets, and visitor-side storage built for long-term commercial use.",
      estimatedCost: "₹1,80,000 - ₹2,50,000",
      roomSize: "12ft × 10ft",
      style: "Professional",
      images: [
        cloudinaryImage("samples/landscapes/nature-mountains"),
        cloudinaryImage("samples/animals/cat"),
      ],
      tags: ["office", "workstation", "storage"],
      isRealWork: false,
      location: null,
      priceRange: null,
      badge: null,
      waText: "Hi! I need office furniture pricing for a cabin like this.",
    },
  ] as const;

  for (const design of designs) {
    const categoryId = categoryIds.get(design.categorySlug);

    if (!categoryId) {
      throw new Error(`Missing category for ${design.slug}`);
    }

    await prisma.design.upsert({
      where: { slug: design.slug },
      update: {
        title: design.title,
        description: design.description,
        estimatedCost: design.estimatedCost,
        roomSize: design.roomSize,
        style: design.style,
        images: design.images,
        tags: [...design.tags],
        isRealWork: design.isRealWork,
        location: design.location,
        priceRange: design.priceRange,
        badge: design.badge,
        waText: design.waText,
        categoryId,
      },
      create: {
        title: design.title,
        slug: design.slug,
        description: design.description,
        estimatedCost: design.estimatedCost,
        roomSize: design.roomSize,
        style: design.style,
        images: design.images,
        tags: [...design.tags],
        isRealWork: design.isRealWork,
        location: design.location,
        priceRange: design.priceRange,
        badge: design.badge,
        waText: design.waText,
        categoryId,
      },
    });
  }

  console.log(`Seeded ${categories.length} categories and ${designs.length} designs.`);
}

main()
  .catch((error) => {
    console.error("Seed error:", error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

import { PrismaClient } from "@prisma/client";
import { v2 as cloudinary } from "cloudinary";
import fs from "fs";
import path from "path";
import pLimit from "p-limit";

// Configuration
const SEED_DIR = path.join(__dirname, "../");
const IMAGES_DIR = path.join(SEED_DIR, "seed-images");
const JSON_FILE = path.join(SEED_DIR, "scripts/data/designs.json");
const CONCURRENCY = 5;

const prisma = new PrismaClient();
const limit = pLimit(CONCURRENCY);

// Initialize Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

function slugify(text: string) {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_-]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

async function main() {
  console.log("🚀 Starting bulk design seeding...\n");

  if (!fs.existsSync(JSON_FILE)) {
    console.error(`❌ Error: designs manifest not found at ${JSON_FILE}`);
    process.exit(1);
  }

  const rawData = fs.readFileSync(JSON_FILE, "utf-8");
  const designs = JSON.parse(rawData);

  if (!Array.isArray(designs)) {
    console.error("❌ Error: scripts/data/designs.json must be an array.");
    process.exit(1);
  }

  // Pre-load all categories for mapping
  const categories = await prisma.category.findMany();
  const categoryMap = new Map(categories.map((c) => [c.slug, c.id]));

  console.log(`📊 Processing ${designs.length} potential designs...`);

  const tasks = designs.map((item, idx) =>
    limit(async () => {
      const { title, categorySlug, filename, isRealWork, description, waText, tags, priceRange, priceTag } = item;
      const slug = slugify(title);
      
      try {
        // 1. Validation
        if (!title || !categorySlug || !filename) {
          console.warn(`[Skip ${idx}] Missing required fields for: ${title}`);
          return;
        }

        const categoryId = categoryMap.get(categorySlug);
        if (!categoryId) {
          console.warn(`[Skip ${idx}] Category not found in DB: ${categorySlug}`);
          return;
        }

        const localPath = path.join(IMAGES_DIR, filename);
        if (!fs.existsSync(localPath)) {
          console.warn(`[Skip ${idx}] Image file does not exist: ${filename}`);
          return;
        }

        // 2. Idempotency Check (Does this slug already exist?)
        const existing = await prisma.design.findUnique({ where: { slug } });
        if (existing) {
          console.log(`[Skip ${idx}] Design already exists with slug: ${slug}`);
          return;
        }

        // 3. Upload to Cloudinary
        console.log(`[Upload ${idx}] Uploading ${filename}...`);
        const folder = `goel-traders/${isRealWork ? "real-work" : "inspirations"}/${categorySlug}`;
        
        const uploadResult = await cloudinary.uploader.upload(localPath, {
          folder,
          resource_type: "image",
          use_filename: true,
          unique_filename: true,
        });

        // 4. Save to Database
        const images = [{
          url: uploadResult.secure_url,
          publicId: uploadResult.public_id
        }];

        await prisma.design.create({
          data: {
            title,
            slug,
            description: description || "",
            images: images as any,
            categoryId,
            isRealWork: !!isRealWork,
            waText: waText || "",
            tags: Array.isArray(tags) ? tags : [],
            priceRange: priceTag || priceRange || "",
          }
        });

        console.log(`✅ [Success ${idx}] Created: ${title} (${slug})`);
        
      } catch (error) {
        console.error(`❌ [Error ${idx}] Failed to process "${title}":`, error instanceof Error ? error.message : error);
      }
    })
  );

  await Promise.all(tasks);

  console.log("\n🏁 Seeding complete!");
  await prisma.$disconnect();
}

main().catch(async (e) => {
  console.error(e);
  await prisma.$disconnect();
  process.exit(1);
});

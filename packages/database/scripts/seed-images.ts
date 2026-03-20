import { PrismaClient } from "@prisma/client";
import { v2 as cloudinary } from "cloudinary";
import fs from "fs";
import path from "path";

const prisma = new PrismaClient();

// Configure Cloudinary (requires environment variables CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET)
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

async function main() {
  const seedJsonPath = path.join(__dirname, "../seed.json");
  const seedImagesDir = path.join(__dirname, "../seed-images");

  if (!fs.existsSync(seedJsonPath)) {
    console.warn("seed.json not found.");
    return;
  }

  const rawData = fs.readFileSync(seedJsonPath, "utf-8");
  const items = JSON.parse(rawData);

  console.log(`Loaded ${items.length} items from seed.json. Starting seed process...`);

  for (const item of items) {
    const { title, categorySlug, isRealWork, location, priceRange, badge, waText, description, filename } = item;
    
    // Find or create category
    let category = await prisma.category.findUnique({ where: { slug: categorySlug } });
    if (!category) {
      console.log(`Category "${categorySlug}" not found. Creating a generic wrapper...`);
      category = await prisma.category.create({
        data: {
          slug: categorySlug,
          name: categorySlug,
          label: categorySlug,
          type: "ROOM",
        }
      });
    }

    let imageUrl = null;
    if (filename) {
      const filePath = path.join(seedImagesDir, filename);
      if (fs.existsSync(filePath)) {
        console.log(`Uploading ${filename} to Cloudinary...`);
        try {
          // Check if Cloudinary is configured (skip upload if missing API keys)
          if (!process.env.CLOUDINARY_CLOUD_NAME) {
            console.warn("Cloudinary not configured. Skipping upload for", filename);
          } else {
             const result = await cloudinary.uploader.upload(filePath, {
               folder: "goel-traders-design-studio/seed",
               resource_type: "image",
             });
             imageUrl = result.secure_url;
             console.log(`Uploaded! URL: ${imageUrl}`);
          }
        } catch (e) {
          console.error(`Error uploading ${filename}:`, e);
        }
      } else {
        console.warn(`File ${filename} not found in seed-images folder. Cannot upload.`);
      }
    }

    // Upsert the Design model
    const slug = title.toLowerCase().replace(/[^a-z0-9]+/g, '-');
    
    await prisma.design.upsert({
      where: { slug },
      create: {
        slug,
        title,
        categoryId: category.id,
        isRealWork: isRealWork || false,
        location: location || null,
        priceRange: priceRange || null,
        badge: badge || null,
        waText: waText || null,
        description: description || "Premium interior design materials.",
        images: imageUrl ? [imageUrl] : [],
      },
      update: {
        title,
        categoryId: category.id,
        isRealWork: isRealWork || false,
        location: location || null,
        priceRange: priceRange || null,
        badge: badge || null,
        waText: waText || null,
        description: description || "Premium interior design materials.",
        images: imageUrl ? [imageUrl] : undefined, // Keep existing if no new one
      }
    });

    console.log(`Successfully mapped Design: ${title}`);
  }

  console.log("Seeding process finalized.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

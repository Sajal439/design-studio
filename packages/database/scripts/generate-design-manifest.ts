import fs from "fs";
import path from "path";

type DesignSeedItem = {
  title: string;
  categorySlug: string;
  isRealWork: boolean;
  filename: string;
  description: string;
  waText: string;
};

const ROOT_DIR = path.join(__dirname, "..");
const IMAGES_DIR = path.join(ROOT_DIR, "seed-images");
const OUTPUT_FILE = path.join(ROOT_DIR, "scripts/data/designs.generated.json");

const IMAGE_EXTENSIONS = new Set([".jpg", ".jpeg", ".png", ".webp", ".avif"]);

const CATEGORY_RULES: Array<{ slug: string; tokens: string[] }> = [
  { slug: "kitchen", tokens: ["kitchen", "island", "crockery"] },
  { slug: "wardrobe", tokens: ["wardrobe", "closet", "almirah"] },
  { slug: "study", tokens: ["study", "desk", "bookshelf"] },
  { slug: "office", tokens: ["office", "cabin", "workstation", "conference"] },
  { slug: "bedroom", tokens: ["bedroom", "bed", "headboard"] },
  { slug: "tv-unit", tokens: ["tv", "tv-unit", "entertainment", "media-unit"] },
];

function toTitleCase(input: string) {
  return input
    .split(" ")
    .filter(Boolean)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

function normalizeFilename(filename: string) {
  return path
    .parse(filename)
    .name
    .toLowerCase()
    .replace(/[_]+/g, "-")
    .replace(/[^\w-]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

function inferCategorySlug(slugSource: string) {
  for (const rule of CATEGORY_RULES) {
    if (rule.tokens.some((token) => slugSource.includes(token))) {
      return rule.slug;
    }
  }
  return "miscellaneous";
}

function buildTitle(slugSource: string) {
  const cleaned = slugSource
    .replace(/\b\d+x\d+\b/g, "")
    .replace(/\b(?:img|image|final|edit|copy|render|photo)\b/g, "")
    .replace(/-+/g, " ")
    .trim();

  return toTitleCase(cleaned || "Interior Design");
}

function buildSeedItem(filename: string): DesignSeedItem {
  const slugSource = normalizeFilename(filename);
  const title = buildTitle(slugSource);
  const categorySlug = inferCategorySlug(slugSource);

  return {
    title,
    categorySlug,
    isRealWork: false,
    filename,
    description: "",
    waText: `Hi! I want pricing for ${title.toLowerCase()}.`,
  };
}

function main() {
  if (!fs.existsSync(IMAGES_DIR)) {
    throw new Error(`seed-images folder not found at ${IMAGES_DIR}`);
  }

  const files = fs
    .readdirSync(IMAGES_DIR)
    .filter((file) => IMAGE_EXTENSIONS.has(path.extname(file).toLowerCase()))
    .sort((a, b) => a.localeCompare(b));

  const items = files.map(buildSeedItem);

  fs.mkdirSync(path.dirname(OUTPUT_FILE), { recursive: true });
  fs.writeFileSync(OUTPUT_FILE, `${JSON.stringify(items, null, 2)}\n`, "utf8");

  console.log(`Generated ${items.length} design entries at ${OUTPUT_FILE}`);
  console.log("Review categorySlug, description, and waText before importing.");
}

main();

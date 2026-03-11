export type Product = {
  id: string;
  name: string;
  slug: string;
  category: string;
  brand: string;
  description: string;
  specifications: { label: string; value: string }[];
  priceRange: string;
  unit: string;
  images: string[];
  inStock: boolean;
};

export const productCategories = [
  { id: "plywood", label: "Plywood" },
  { id: "laminates", label: "Laminates" },
  { id: "hardware", label: "Hardware & Fittings" },
  { id: "adhesives", label: "Adhesives" },
  { id: "veneers", label: "Veneers" },
  { id: "edges", label: "Edge Bands" },
];

export const products: Product[] = [
  {
    id: "1",
    name: "BWR Grade Plywood 8×4 (19mm)",
    slug: "bwr-plywood-19mm",
    category: "plywood",
    brand: "Century Plyboards",
    description:
      "Boiling Water Resistant plywood ideal for kitchen cabinets, bathroom vanities, and areas exposed to moisture. IS:303 certified with 20+ year warranty.",
    specifications: [
      { label: "Size", value: "8ft × 4ft" },
      { label: "Thickness", value: "19mm" },
      { label: "Grade", value: "BWR (IS:303)" },
      { label: "Core", value: "Hardwood" },
      { label: "Warranty", value: "20 Years" },
    ],
    priceRange: "₹85 - ₹110 / sq ft",
    unit: "sheet",
    images: ["/placeholder-plywood.jpg"],
    inStock: true,
  },
  {
    id: "2",
    name: "Marine Grade Plywood 8×4 (19mm)",
    slug: "marine-plywood-19mm",
    category: "plywood",
    brand: "Greenply",
    description:
      "Superior waterproof plywood for extreme moisture areas. IS:710 certified, suitable for boat building, exterior use, and wet-area furniture.",
    specifications: [
      { label: "Size", value: "8ft × 4ft" },
      { label: "Thickness", value: "19mm" },
      { label: "Grade", value: "Marine (IS:710)" },
      { label: "Core", value: "Hardwood" },
      { label: "Warranty", value: "25 Years" },
    ],
    priceRange: "₹120 - ₹160 / sq ft",
    unit: "sheet",
    images: ["/placeholder-marine.jpg"],
    inStock: true,
  },
  {
    id: "3",
    name: "High Gloss Laminate Sheet (1mm)",
    slug: "high-gloss-laminate-1mm",
    category: "laminates",
    brand: "Merino Laminates",
    description:
      "Premium high-gloss finish laminate for modern kitchens and wardrobes. Scratch-resistant, anti-fingerprint coating with 200+ color options.",
    specifications: [
      { label: "Size", value: "8ft × 4ft" },
      { label: "Thickness", value: "1mm" },
      { label: "Finish", value: "High Gloss" },
      { label: "Surface", value: "Anti-fingerprint" },
      { label: "Colors Available", value: "200+" },
    ],
    priceRange: "₹1,200 - ₹1,800 / sheet",
    unit: "sheet",
    images: ["/placeholder-laminate.jpg"],
    inStock: true,
  },
  {
    id: "4",
    name: "Matte Finish Laminate (0.8mm)",
    slug: "matte-laminate-08mm",
    category: "laminates",
    brand: "Royale Touche",
    description:
      "Elegant matte finish laminate with soft-touch feel. Perfect for bedroom wardrobes, study tables, and living room furniture.",
    specifications: [
      { label: "Size", value: "8ft × 4ft" },
      { label: "Thickness", value: "0.8mm" },
      { label: "Finish", value: "Matte / Suede" },
      { label: "Surface", value: "Soft Touch" },
      { label: "Colors Available", value: "150+" },
    ],
    priceRange: "₹900 - ₹1,400 / sheet",
    unit: "sheet",
    images: ["/placeholder-matte.jpg"],
    inStock: true,
  },
  {
    id: "5",
    name: "Soft-Close Cabinet Hinges (Pair)",
    slug: "soft-close-hinges",
    category: "hardware",
    brand: "Hettich",
    description:
      "German-engineered hydraulic soft-close hinges. Self-closing mechanism, 110° opening angle, 50,000+ cycle tested for durability.",
    specifications: [
      { label: "Type", value: "Hydraulic Soft-Close" },
      { label: "Opening Angle", value: "110°" },
      { label: "Overlay", value: "Full / Half / Inset" },
      { label: "Load Capacity", value: "Up to 5 kg per hinge" },
      { label: "Durability", value: "50,000+ cycles" },
    ],
    priceRange: "₹120 - ₹250 / pair",
    unit: "pair",
    images: ["/placeholder-hinge.jpg"],
    inStock: true,
  },
  {
    id: "6",
    name: "Telescopic Drawer Channel (Pair)",
    slug: "telescopic-drawer-channel",
    category: "hardware",
    brand: "Hafele",
    description:
      "Full-extension ball-bearing drawer slides with soft-close. Zinc-plated for corrosion resistance, suitable for kitchen and office drawers.",
    specifications: [
      { label: "Type", value: "Full Extension" },
      { label: "Sizes", value: '12" / 16" / 18" / 20"' },
      { label: "Load Capacity", value: "45 kg" },
      { label: "Material", value: "Cold-rolled Steel" },
      { label: "Finish", value: "Zinc Plated" },
    ],
    priceRange: "₹350 - ₹800 / pair",
    unit: "pair",
    images: ["/placeholder-channel.jpg"],
    inStock: true,
  },
  {
    id: "7",
    name: "Fevicol SH Wood Adhesive",
    slug: "fevicol-sh-adhesive",
    category: "adhesives",
    brand: "Pidilite",
    description:
      "Industry-standard synthetic resin adhesive for wood-to-wood bonding. Superior bond strength, heat and water resistant, ideal for all furniture work.",
    specifications: [
      { label: "Type", value: "Synthetic Resin" },
      { label: "Available Sizes", value: "500g / 1kg / 5kg / 10kg / 50kg" },
      { label: "Bond Strength", value: "High (D3 rated)" },
      { label: "Setting Time", value: "3-4 hours" },
      { label: "Resistance", value: "Heat & Water" },
    ],
    priceRange: "₹200 - ₹450 / kg",
    unit: "kg",
    images: ["/placeholder-adhesive.jpg"],
    inStock: true,
  },
  {
    id: "8",
    name: "Natural Teak Wood Veneer",
    slug: "teak-wood-veneer",
    category: "veneers",
    brand: "Decowood",
    description:
      "Premium natural teak veneer sheets with consistent grain pattern. Perfect for luxury wardrobes, doors, and wall paneling.",
    specifications: [
      { label: "Size", value: "8ft × 4ft" },
      { label: "Thickness", value: "0.5mm" },
      { label: "Wood Type", value: "Natural Teak" },
      { label: "Grain", value: "Straight / Crown" },
      { label: "Finish", value: "Unfinished (ready for polish)" },
    ],
    priceRange: "₹80 - ₹200 / sq ft",
    unit: "sheet",
    images: ["/placeholder-veneer.jpg"],
    inStock: true,
  },
  {
    id: "9",
    name: "PVC Edge Band Roll (22mm)",
    slug: "pvc-edge-band-22mm",
    category: "edges",
    brand: "Rehau",
    description:
      "Color-matched PVC edge banding for a seamless furniture finish. Pre-glued for easy application with edge banding machines.",
    specifications: [
      { label: "Width", value: "22mm" },
      { label: "Thickness", value: "0.8mm / 1mm / 2mm" },
      { label: "Roll Length", value: "50 meters" },
      { label: "Type", value: "Pre-glued" },
      { label: "Colors", value: "Matching with major laminate brands" },
    ],
    priceRange: "₹3 - ₹8 / meter",
    unit: "roll",
    images: ["/placeholder-edge.jpg"],
    inStock: true,
  },
];

export function getProductsByCategory(category?: string) {
  if (!category || category === "all") return products;
  return products.filter((p) => p.category === category);
}

export function getProductBySlug(slug: string) {
  return products.find((p) => p.slug === slug);
}

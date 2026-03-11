export type Design = {
  id: string;
  title: string;
  slug: string;
  category: string;
  description: string;
  estimatedCost: string;
  roomSize: string;
  style: string;
  images: string[];
  materials: { name: string; quantity: number; unit: string }[];
};

export const categories = [
  { id: "kitchen", label: "Modular Kitchens" },
  { id: "wardrobe", label: "Wardrobes" },
  { id: "tv-unit", label: "TV Units" },
  { id: "bedroom", label: "Bedroom Interiors" },
  { id: "study", label: "Study Tables" },
  { id: "office", label: "Office Furniture" },
];

export const designs: Design[] = [
  {
    id: "1",
    title: "Modern L-Shaped Modular Kitchen",
    slug: "modern-l-shaped-kitchen",
    category: "kitchen",
    description:
      "A sleek L-shaped kitchen with handleless cabinets, quartz countertop, and integrated appliances. Perfect for medium-sized apartments.",
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
    id: "2",
    title: "Classic Wooden Wardrobe with Mirror",
    slug: "classic-wooden-wardrobe",
    category: "wardrobe",
    description:
      "A 3-door wardrobe with full-length mirror, internal drawers, and hanging space. Timeless design with premium veneer finish.",
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
    id: "3",
    title: "Contemporary Wall-Mounted TV Unit",
    slug: "contemporary-tv-unit",
    category: "tv-unit",
    description:
      "A floating TV unit with LED backlight panel, open shelves, and concealed storage. Wall-mounted for a clean, spacious look.",
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
    id: "4",
    title: "Luxury Master Bedroom Interior",
    slug: "luxury-master-bedroom",
    category: "bedroom",
    description:
      "Complete bedroom package with upholstered bed back panel, side tables, dresser unit, and false ceiling cove lights.",
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
    id: "5",
    title: "Compact Study Table with Bookshelf",
    slug: "compact-study-bookshelf",
    category: "study",
    description:
      "An ergonomic study setup with built-in bookshelf, cable management, and adjustable shelf heights. Ideal for students and WFH professionals.",
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
    id: "6",
    title: "Executive Office Cabin Furniture",
    slug: "executive-office-cabin",
    category: "office",
    description:
      "Full office cabin setup with L-shaped desk, overhead storage, filing cabinets, and visitor seating area divider.",
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

export function getDesignsByCategory(category?: string) {
  if (!category || category === "all") return designs;
  return designs.filter((d) => d.category === category);
}

export function getDesignBySlug(slug: string) {
  return designs.find((d) => d.slug === slug);
}

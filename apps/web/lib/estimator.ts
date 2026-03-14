// ─── Material Estimator Calculation Engine ─────────────────────────
// Pure functions for scaling material quantities based on room dimensions.

export interface MaterialEstimate {
  name: string;
  quantity: number;
  unit: string;
  unitPrice: number;
  estimatedCost: number;
}

export interface EstimatorResult {
  designTitle: string;
  designSlug: string;
  referenceArea: number;
  userArea: number;
  scaleFactor: number;
  materials: MaterialEstimate[];
  totalCostMin: number;
  totalCostMax: number;
}

export interface DesignInput {
  title: string;
  slug: string;
  roomSize: string;
  style?: string;
  estimatedCost?: string;
  materials: { name: string; quantity: number; unit: string }[];
}

// ─── Base Prices (₹ per standard unit) ──────────────────────────────
// These are approximate mid-range prices used for estimation.
const BASE_PRICES: Record<string, { price: number; variance: number }> = {
  "BWR Plywood (8×4)":        { price: 3200,  variance: 0.20 },
  "Marine Plywood (8×4)":     { price: 4800,  variance: 0.20 },
  "Laminate Sheets":          { price: 1500,  variance: 0.25 },
  "Veneer Sheets":            { price: 1800,  variance: 0.30 },
  "Soft-Close Hinges":        { price: 185,   variance: 0.35 },
  "Handles":                  { price: 150,   variance: 0.40 },
  "Drawer Channels":          { price: 575,   variance: 0.40 },
  "Kitchen Baskets":          { price: 1200,  variance: 0.30 },
  "Mirror (6×2)":             { price: 2500,  variance: 0.20 },
  "LED Strip Light":          { price: 350,   variance: 0.30 },
  "Wall Mounting Hardware":   { price: 800,   variance: 0.25 },
  "Fabric for Upholstery":   { price: 120,   variance: 0.35 },
  "Shelf Supports":           { price: 80,    variance: 0.25 },
  "Cable Grommet":            { price: 250,   variance: 0.30 },
};

const DEFAULT_PRICE = { price: 500, variance: 0.30 };

// ─── Room Size Parser ───────────────────────────────────────────────
// Parses strings like "10ft × 8ft" or "7ft × 7ft × 2ft" into width × height area.
export function parseRoomSize(roomSize: string): number {
  const numbers = roomSize.match(/[\d.]+/g)?.map(Number) ?? [];
  if (numbers.length >= 2) {
    return numbers[0]! * numbers[1]!; // width × depth (or height)
  }
  return 100; // fallback to 100 sq ft
}

// ─── Estimator Core ─────────────────────────────────────────────────
export function estimateMaterials(
  design: DesignInput,
  userWidth: number,
  userDepth: number
): EstimatorResult {
  const referenceArea = parseRoomSize(design.roomSize);
  const userArea = userWidth * userDepth;
  const scaleFactor = Math.max(0.5, Math.min(3.0, userArea / referenceArea)); // clamp 0.5x–3x

  const materials: MaterialEstimate[] = design.materials.map((mat) => {
    const { price, variance } = BASE_PRICES[mat.name] ?? DEFAULT_PRICE;
    const scaledQuantity = Math.ceil(mat.quantity * scaleFactor);
    const estimatedCost = scaledQuantity * price;

    return {
      name: mat.name,
      quantity: scaledQuantity,
      unit: mat.unit,
      unitPrice: price,
      estimatedCost,
    };
  });

  const totalBase = materials.reduce((sum, m) => sum + m.estimatedCost, 0);
  const avgVariance = 0.15; // ±15% for the total
  const totalCostMin = Math.round(totalBase * (1 - avgVariance));
  const totalCostMax = Math.round(totalBase * (1 + avgVariance));

  return {
    designTitle: design.title,
    designSlug: design.slug,
    referenceArea,
    userArea,
    scaleFactor: Math.round(scaleFactor * 100) / 100,
    materials,
    totalCostMin,
    totalCostMax,
  };
}

// ─── Format Helpers ─────────────────────────────────────────────────
export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(amount);
}

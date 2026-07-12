import type { MaterialGrade } from "./types";

/** A kitchen appliance product from the Product catalog. */
export type KitchenProduct = {
  id: string;
  name: string;
  brand: string | null;
  price: number;
  tier: string;
  category: string;
};

export type PriceBook = {
  estimator: Record<
    "kitchen" | "wardrobe" | "tv-unit" | "bedroom" | "study" | "office",
    Record<MaterialGrade, number>
  >;
  sheets: Record<MaterialGrade, { plywood: number; surface: number }>;
  hardware: Record<string, number>;
  rates: {
    labor: number;
    installation: number;
    transport: number;
    dealer: number;
    contractor: number;
    customer: number;
  };
  kitchen: {
    chimney: Record<"BUDGET" | "STANDARD" | "PREMIUM", number>;
    hob: Record<"BUDGET" | "STANDARD" | "PREMIUM", number>;
    /** Resolved Product objects per tier — undefined if none seeded yet. */
    chimneyProducts: Partial<Record<"BUDGET" | "STANDARD" | "PREMIUM", KitchenProduct>>;
    hobProducts: Partial<Record<"BUDGET" | "STANDARD" | "PREMIUM", KitchenProduct>>;
  };
};


// Fallback used only if DB is unreachable — never in production flow
export const FALLBACK_PRICE_BOOK: PriceBook = {
  estimator: {
    kitchen: { BUDGET: 2200, STANDARD: 2800, PREMIUM: 3500 },
    wardrobe: { BUDGET: 600, STANDARD: 1000, PREMIUM: 1800 },
    "tv-unit": { BUDGET: 700, STANDARD: 1100, PREMIUM: 1800 },
    bedroom: { BUDGET: 700, STANDARD: 1100, PREMIUM: 2000 },
    study: { BUDGET: 550, STANDARD: 900, PREMIUM: 1500 },
    office: { BUDGET: 650, STANDARD: 1050, PREMIUM: 1800 },
  },
  sheets: {
    BUDGET: { plywood: 65, surface: 55 },
    STANDARD: { plywood: 95, surface: 65 },
    PREMIUM: { plywood: 140, surface: 180 },
  },
  hardware: {
    EDGE_BAND: 8,
    HINGE_SOFT_CLOSE: 180,
    HINGE_NORMAL: 80,
    HANDLE: 150,
    PROFILE_HANDLE: 350,
    TELESCOPIC_CHANNEL: 450,
    TANDEM_BOX: 1800,
    MAGNETIC_CATCH: 70,
    SLIDING_TRACK_SET: 3200,
    SLIDING_ROLLER_SET: 650,
    SOFT_STOPPER: 450,
    LED_CHANNEL: 550,
    KITCHEN_BASKET: 1800,
    CABLE_GROMMET: 250,
    METAL_FRAME: 520,
    PARTITION_PANEL: 110,
    MIRROR: 2400,
    FABRIC_UPHOLSTERY: 130,
    SCREWS_AND_NAILS: 1500,
    ADHESIVE: 950,
  },
  rates: {
    labor: 0.26,
    installation: 0.08,
    transport: 0.04,
    dealer: 0.06,
    contractor: 0.1,
    customer: 0.18,
  },
  kitchen: {
    chimney: { BUDGET: 10000, STANDARD: 18000, PREMIUM: 30000 },
    hob: { BUDGET: 5000, STANDARD: 9000, PREMIUM: 16000 },
    chimneyProducts: {},
    hobProducts: {},
  },
};

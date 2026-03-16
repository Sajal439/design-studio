import type { MaterialGrade } from "./types";

export type PriceBook = {
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
};

// Fallback used only if DB is unreachable — never in production flow
export const FALLBACK_PRICE_BOOK: PriceBook = {
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
};

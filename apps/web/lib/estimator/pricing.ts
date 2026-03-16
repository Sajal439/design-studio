import type { MaterialCategory, MaterialGrade } from "./types";
import type { PriceBook } from "./priceBook";
export const SQFT_PER_SHEET = 32;

export const WASTE_FACTORS = {
  SHEET: 0.12,
  SURFACE: 0.1,
  EDGE: 0.15,
  HARDWARE: 0,
  ACCESSORY: 0.03,
  CONSUMABLE: 0.05,
} as const satisfies Record<MaterialCategory, number>;

export const LABOR_RATE_PERCENTAGE = 0.26;
export const INSTALLATION_RATE_PERCENTAGE = 0.08;
export const TRANSPORT_RATE_PERCENTAGE = 0.04;
export const DEALER_MARGIN_PERCENTAGE = 0.06;
export const CONTRACTOR_MARGIN_PERCENTAGE = 0.1;
export const CUSTOMER_MARGIN_PERCENTAGE = 0.18;

const SHEET_PRICES: Record<
  MaterialGrade,
  { plywood: number; surface: number }
> = {
  BUDGET: {
    plywood: 65,
    surface: 55,
  },
  STANDARD: {
    plywood: 95,
    surface: 65,
  },
  PREMIUM: {
    plywood: 140,
    surface: 180,
  },
};

const FIXED_PRICES = {
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
} as const;

export function getSheetUnitCost(
  grade: MaterialGrade,
  category: "PLYWOOD" | "SURFACE",
  priceBook: PriceBook,
): number {
  const row = priceBook.sheets[grade];
  return category === "PLYWOOD" ? row.plywood : row.surface;
}

export function getHardwareUnitCost(
  name: string,
  grade: MaterialGrade,
  priceBook: PriceBook,
): number {
  const upper = name.toUpperCase();
  const hw = priceBook.hardware;

  if (upper.includes("HINGE")) {
    return grade === "BUDGET"
      ? (hw["HINGE_NORMAL"] ?? 80)
      : (hw["HINGE_SOFT_CLOSE"] ?? 180);
  }
  if (upper.includes("HANDLE")) {
    return grade === "PREMIUM"
      ? (hw["PROFILE_HANDLE"] ?? 350)
      : (hw["HANDLE"] ?? 150);
  }
  if (upper.includes("EDGE")) {
    return hw["EDGE_BAND"] ?? 8;
  }
  if (upper.includes("CHANNEL") || upper.includes("TANDEM")) {
    return grade === "PREMIUM"
      ? (hw["TANDEM_BOX"] ?? 1800)
      : (hw["TELESCOPIC_CHANNEL"] ?? 450);
  }
  if (upper.includes("TRACK")) return hw["SLIDING_TRACK_SET"] ?? 3200;
  if (upper.includes("ROLLER")) return hw["SLIDING_ROLLER_SET"] ?? 650;
  if (upper.includes("STOPPER")) return hw["SOFT_STOPPER"] ?? 450;
  if (upper.includes("MAGNET")) return hw["MAGNETIC_CATCH"] ?? 70;
  if (upper.includes("LED")) return hw["LED_CHANNEL"] ?? 550;
  if (upper.includes("BASKET")) return hw["KITCHEN_BASKET"] ?? 1800;
  if (upper.includes("GROMMET")) return hw["CABLE_GROMMET"] ?? 250;
  if (upper.includes("FRAME")) return hw["METAL_FRAME"] ?? 520;
  if (upper.includes("PARTITION")) return hw["PARTITION_PANEL"] ?? 110;
  if (upper.includes("MIRROR")) return hw["MIRROR"] ?? 2400;
  if (upper.includes("FABRIC")) return hw["FABRIC_UPHOLSTERY"] ?? 130;
  if (upper.includes("WALL MOUNT")) return 800;
  if (upper.includes("ROD")) return 450;
  if (upper.includes("MOISTURE")) return 90;
  if (upper.includes("JOINT")) return 650;
  if (upper.includes("SCREW") || upper.includes("NAIL"))
    return hw["SCREWS_AND_NAILS"] ?? 1500;
  if (upper.includes("ADHESIVE") || upper.includes("GLUE"))
    return hw["ADHESIVE"] ?? 950;

  return 100;
}

export const CONSUMABLE_COSTS = {
  screwsAndNails: FIXED_PRICES.SCREWS_AND_NAILS,
  adhesive: FIXED_PRICES.ADHESIVE,
} as const;

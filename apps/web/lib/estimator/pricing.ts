import type { MaterialCategory, MaterialGrade } from "./types";

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

const SHEET_PRICES: Record<MaterialGrade, { plywood: number; surface: number }> = {
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

export function getSheetUnitCost(grade: MaterialGrade, category: "PLYWOOD" | "SURFACE"): number {
  return category === "PLYWOOD"
    ? SHEET_PRICES[grade].plywood
    : SHEET_PRICES[grade].surface;
}

export function getHardwareUnitCost(name: string, grade: MaterialGrade): number {
  const upperName = name.toUpperCase();

  if (upperName.includes("HINGE")) {
    return grade === "BUDGET" ? FIXED_PRICES.HINGE_NORMAL : FIXED_PRICES.HINGE_SOFT_CLOSE;
  }

  if (upperName.includes("HANDLE")) {
    return grade === "PREMIUM" ? FIXED_PRICES.PROFILE_HANDLE : FIXED_PRICES.HANDLE;
  }

  if (upperName.includes("EDGE")) {
    return FIXED_PRICES.EDGE_BAND;
  }

  if (upperName.includes("CHANNEL") || upperName.includes("TANDEM")) {
    return grade === "PREMIUM" ? FIXED_PRICES.TANDEM_BOX : FIXED_PRICES.TELESCOPIC_CHANNEL;
  }

  if (upperName.includes("TRACK")) {
    return FIXED_PRICES.SLIDING_TRACK_SET;
  }

  if (upperName.includes("ROLLER")) {
    return FIXED_PRICES.SLIDING_ROLLER_SET;
  }

  if (upperName.includes("STOPPER")) {
    return FIXED_PRICES.SOFT_STOPPER;
  }

  if (upperName.includes("MAGNET")) {
    return FIXED_PRICES.MAGNETIC_CATCH;
  }

  if (upperName.includes("LED")) {
    return FIXED_PRICES.LED_CHANNEL;
  }

  if (upperName.includes("BASKET")) {
    return FIXED_PRICES.KITCHEN_BASKET;
  }

  if (upperName.includes("GROMMET")) {
    return FIXED_PRICES.CABLE_GROMMET;
  }

  if (upperName.includes("FRAME")) {
    return FIXED_PRICES.METAL_FRAME;
  }

  if (upperName.includes("PARTITION")) {
    return FIXED_PRICES.PARTITION_PANEL;
  }

  if (upperName.includes("MIRROR")) {
    return FIXED_PRICES.MIRROR;
  }

  if (upperName.includes("FABRIC")) {
    return FIXED_PRICES.FABRIC_UPHOLSTERY;
  }

  if (upperName.includes("WALL MOUNT")) {
    return 800;
  }

  if (upperName.includes("ROD")) {
    return 450;
  }

  if (upperName.includes("MOISTURE")) {
    return 90;
  }

  if (upperName.includes("JOINT")) {
    return 650;
  }

  if (upperName.includes("SCREW") || upperName.includes("NAIL")) {
    return FIXED_PRICES.SCREWS_AND_NAILS;
  }

  if (upperName.includes("ADHESIVE") || upperName.includes("GLUE")) {
    return FIXED_PRICES.ADHESIVE;
  }

  return 100;
}

export const CONSUMABLE_COSTS = {
  screwsAndNails: FIXED_PRICES.SCREWS_AND_NAILS,
  adhesive: FIXED_PRICES.ADHESIVE,
} as const;

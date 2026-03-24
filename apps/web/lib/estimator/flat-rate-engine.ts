/**
 * apps/web/lib/estimator/flat-rate-engine.ts
 *
 * Single source of truth for the flat-rate estimation model.
 *
 * Input model (replaces single "size"):
 *
 *   Kitchen  → separate lower cabinet rft + upper cabinet rft
 *              lower = base units (full carcass + countertop height)
 *              upper = wall units (shallower, no countertop)
 *              each has its own rate because material use differs
 *
 *   All else → width (ft) × height (ft) = sqft
 *              rate is ₹ per sqft
 *
 * Nothing in this file has side effects — pure data + pure functions.
 */
import type { PriceBook } from "./priceBook";
import type { CategorySlug } from "./types";

// ── Types ─────────────────────────────────────────────────────────────────────

export type TierKey = "BUDGET" | "STANDARD" | "PREMIUM";

/** Used by all non-kitchen categories */
export interface DimensionInput {
  width: number; // feet
  height: number; // feet
}

/** Used only by kitchen */
export interface KitchenInput {
  lowerRft: number; // running feet of lower / base cabinets
  upperRft: number; // running feet of upper / wall cabinets
}

export type EstimatorInput = DimensionInput | KitchenInput;

export function isKitchenInput(input: EstimatorInput): input is KitchenInput {
  return "lowerRft" in input;
}

// ─────────────────────────────────────────────────────────────────────────────

export interface TierColor {
  /** Card background */
  bg: string;
  /** Border when not selected */
  border: string;
  /** Border + accent color when selected */
  accent: string;
}

/**
 * Standard tier — used by all non-kitchen categories.
 * rate = ₹ per sqft
 */
export interface DimensionTierSpec {
  key: TierKey;
  label: string;
  badge?: string;
  /** Display string e.g. "₹1,000 / sqft" */
  rateLabel: string;
  /** ₹ per sqft */
  rate: number;
  /** 3–4 bullets; first item used as one-line summary in WA messages */
  materials: string[];
}

/**
 * Kitchen tier — has separate rates for lower and upper cabinets.
 */
export interface KitchenTierSpec {
  key: TierKey;
  label: string;
  badge?: string;
  ratePerSqft: number;
  chimneyPrice: number; // ← ADD
  hobPrice: number;
  /** Bullets describing materials — shared across upper + lower */
  materials: string[];
}

// ─────────────────────────────────────────────────────────────────────────────

interface BaseCategorySpec {
  slug: CategorySlug;
  label: string;
  icon: string;
}

export interface DimensionCategorySpec extends BaseCategorySpec {
  inputType: "dimensions";
  widthLabel: string;
  heightLabel: string;
  widthPlaceholder: string;
  heightPlaceholder: string;
  hint: string;
  tiers: [DimensionTierSpec, DimensionTierSpec, DimensionTierSpec];
}

export interface KitchenCategorySpec extends BaseCategorySpec {
  inputType: "kitchen";
  lowerLabel: string; // label for lower cabinet input
  upperLabel: string; // label for upper cabinet input
  lowerPlaceholder: string;
  upperPlaceholder: string;
  lowerHint: string;
  upperHint: string;
  tiers: [KitchenTierSpec, KitchenTierSpec, KitchenTierSpec];
}

export type CategorySpec = DimensionCategorySpec | KitchenCategorySpec;

export function isKitchenCategory(
  cat: CategorySpec,
): cat is KitchenCategorySpec {
  return cat.inputType === "kitchen";
}

// ─────────────────────────────────────────────────────────────────────────────

export interface DimensionEstimateResult {
  kind: "dimensions";
  category: DimensionCategorySpec;
  tier: DimensionTierSpec;
  width: number;
  height: number;
  sqft: number;
  total: number;
}

export interface KitchenEstimateResult {
  kind: "kitchen";
  category: KitchenCategorySpec;
  tier: KitchenTierSpec;
  lowerRft: number;
  upperRft: number;
  totalArea: number;
  cabinetTotal: number; // ← ADD (cabinet cost only)
  chimneyPrice: number; // ← ADD
  hobPrice: number; // ← ADD
  total: number;
}

export type EstimateResult = DimensionEstimateResult | KitchenEstimateResult;

// ── Rate data ─────────────────────────────────────────────────────────────────
//
// KITCHEN  (₹ per running foot)
// ─────────────────────────────────────────────────────────────────
//  Tier      Lower (base)   Upper (wall)
//  Budget    ₹2,500         ₹1,500
//  Standard  ₹4,000         ₹2,500
//  Premium   ₹7,000         ₹4,500
//
// ALL OTHER  (₹ per sqft = width × height)
// ─────────────────────────────────────────────────────────────────
//  Category    Budget   Standard   Premium
//  Wardrobe     ₹600    ₹1,000    ₹1,800
//  TV Unit      ₹700    ₹1,100    ₹1,800
//  Bedroom      ₹700    ₹1,100    ₹2,000
//  Study        ₹550      ₹900    ₹1,500
//  Office       ₹650    ₹1,050    ₹1,800

export const CATEGORIES: CategorySpec[] = [
  // ── Kitchen ──────────────────────────────────────────────────────────────
  {
    slug: "kitchen",
    label: "Kitchen",
    icon: "🍳",
    inputType: "kitchen",
    lowerLabel: "Lower cabinets (base units)",
    upperLabel: "Upper cabinets (wall units)",
    lowerPlaceholder: "e.g. 10",
    upperPlaceholder: "e.g. 8",
    lowerHint: "Running feet along the wall at counter level",
    upperHint: "Running feet of wall-mounted cabinets above counter",
    tiers: [
      {
        key: "BUDGET",
        label: "Budget",
        ratePerSqft: 2200,
        chimneyPrice: 10000,
        hobPrice: 5000,
        materials: [
          "BWR plywood basic",
          "Laminate finish",
          "Standard hardware",
          "Basic Chimney + 2 burner hob",
        ],
      },
      {
        key: "STANDARD",
        label: "Standard",
        ratePerSqft: 2800,
        chimneyPrice: 15000,
        hobPrice: 10000,
        materials: [
          "BWR plywood",
          "Designer laminate",
          "Soft-close hardware",
          "Glass Chimney + 3 burner hob",
        ],
      },
      {
        key: "PREMIUM",
        label: "Premium",
        ratePerSqft: 3500,
        chimneyPrice: 25000,
        hobPrice: 15000,
        materials: [
          "calibrated plywood / HDHMR",
          "Acrylic / veneer",
          "Hettich / Hafele hardware",
          "Premium Chimney + Glass hob",
        ],
      },
    ] as [KitchenTierSpec, KitchenTierSpec, KitchenTierSpec],
  },

  // ── Wardrobe ──────────────────────────────────────────────────────────────
  {
    slug: "wardrobe",
    label: "Wardrobe",
    icon: "👔",
    inputType: "dimensions",
    widthLabel: "Width (ft)",
    heightLabel: "Height (ft)",
    widthPlaceholder: "e.g. 6",
    heightPlaceholder: "e.g. 8",
    hint: "Measure the full face of the wardrobe",
    tiers: [
      {
        key: "BUDGET",
        label: "Budget",
        rate: 600,
        rateLabel: "₹600 / sqft",
        materials: [
          "MR plywood 18mm carcass",
          "Basic laminate shutters",
          "Standard hinges & handles",
          "Fixed shelves + hanging rod",
        ],
      },
      {
        key: "STANDARD",
        label: "Standard",
        badge: "Most popular",
        rate: 1000,
        rateLabel: "₹1,000 / sqft",
        materials: [
          "BWR plywood 18mm carcass",
          "Decorative laminate shutters",
          "Soft-close hinges + metal handles",
          "Adjustable shelves + drawer unit",
        ],
      },
      {
        key: "PREMIUM",
        label: "Premium",
        rate: 1800,
        rateLabel: "₹1,800 / sqft",
        materials: [
          "BWP / HDHMR 18mm carcass",
          "Acrylic or veneer shutters",
          "Hettich / Hafele soft-close",
          "Profile handles",
          "Tandem boxes + LED interior light",
        ],
      },
    ],
  },

  // ── TV Unit ───────────────────────────────────────────────────────────────
  {
    slug: "tv-unit",
    label: "TV Unit",
    icon: "📺",
    inputType: "dimensions",
    widthLabel: "Width (ft)",
    heightLabel: "Height (ft)",
    widthPlaceholder: "e.g. 8",
    heightPlaceholder: "e.g. 5",
    hint: "Full feature wall width × height",
    tiers: [
      {
        key: "BUDGET",
        label: "Budget",
        rate: 700,
        rateLabel: "₹700 / sqft",
        materials: [
          "MDF 12mm back panel",
          "BWR plywood cabinets",
          "Basic laminate finish",
          "Standard hinges & handles",
        ],
      },
      {
        key: "STANDARD",
        label: "Standard",
        badge: "Most popular",
        rate: 1100,
        rateLabel: "₹1,100 / sqft",
        materials: [
          "MDF 12mm textured back panel",
          "BWR plywood + decorative laminate",
          "Soft-close cabinet hinges",
          "Open shelves + concealed storage",
        ],
      },
      {
        key: "PREMIUM",
        label: "Premium",
        rate: 1800,
        rateLabel: "₹1,800 / sqft",
        materials: [
          "MDF back with cove LED channel",
          "HDHMR + acrylic / veneer panels",
          "Hettich soft-close hardware",
          "Profile handles + LED strip",
        ],
      },
    ],
  },

  // ── Bedroom ───────────────────────────────────────────────────────────────
  {
    slug: "bedroom",
    label: "Bedroom",
    icon: "🛏",
    inputType: "dimensions",
    widthLabel: "Wardrobe width (ft)",
    heightLabel: "Ceiling height (ft)",
    widthPlaceholder: "e.g. 8",
    heightPlaceholder: "e.g. 8",
    hint: "Width of the wardrobe wall × ceiling height",
    tiers: [
      {
        key: "BUDGET",
        label: "Budget",
        rate: 700,
        rateLabel: "₹700 / sqft",
        materials: [
          "MR plywood carcass + basic laminate",
          "Standard hinged shutters",
          "Bed head panel in laminate",
          "Standard handles & hinges",
        ],
      },
      {
        key: "STANDARD",
        label: "Standard",
        badge: "Most popular",
        rate: 1100,
        rateLabel: "₹1,100 / sqft",
        materials: [
          "BWR plywood + decorative laminate",
          "Soft-close wardrobe shutters",
          "Upholstered or veneer bed panel",
          "Dorset / Action TESA soft-close",
        ],
      },
      {
        key: "PREMIUM",
        label: "Premium",
        rate: 2000,
        rateLabel: "₹2,000 / sqft",
        materials: [
          "HDHMR / BWP full waterproof carcass",
          "Acrylic or veneer shutter finish",
          "Hettich / Hafele premium hardware",
          "Integrated LED + dressing mirror",
        ],
      },
    ],
  },

  // ── Study ─────────────────────────────────────────────────────────────────
  {
    slug: "study",
    label: "Study",
    icon: "📚",
    inputType: "dimensions",
    widthLabel: "Width (ft)",
    heightLabel: "Height incl. shelves (ft)",
    widthPlaceholder: "e.g. 5",
    heightPlaceholder: "e.g. 5",
    hint: "Total width × height including bookshelf above",
    tiers: [
      {
        key: "BUDGET",
        label: "Budget",
        rate: 550,
        rateLabel: "₹550 / sqft",
        materials: [
          "MR plywood tabletop + shelf unit",
          "Basic laminate finish",
          "2 drawers with telescopic channels",
          "Fixed bookshelf above",
        ],
      },
      {
        key: "STANDARD",
        label: "Standard",
        badge: "Most popular",
        rate: 900,
        rateLabel: "₹900 / sqft",
        materials: [
          "BWR plywood + decorative laminate",
          "Soft-close drawer unit",
          "Cable management grommet",
          "Adjustable shelves + storage cabinet",
        ],
      },
      {
        key: "PREMIUM",
        label: "Premium",
        rate: 1500,
        rateLabel: "₹1,500 / sqft",
        materials: [
          "HDHMR waterproof board",
          "Acrylic or veneer table surface",
          "Hettich tandem box drawers",
          "LED under-shelf + integrated cable tray",
        ],
      },
    ],
  },

  // ── Office ────────────────────────────────────────────────────────────────
  {
    slug: "office",
    label: "Office",
    icon: "💼",
    inputType: "dimensions",
    widthLabel: "Workstation width (ft)",
    heightLabel: "Height (ft)",
    widthPlaceholder: "e.g. 10",
    heightPlaceholder: "e.g. 8",
    hint: "Total workstation run × height including overhead storage",
    tiers: [
      {
        key: "BUDGET",
        label: "Budget",
        rate: 650,
        rateLabel: "₹650 / sqft",
        materials: [
          "MR plywood carcass + basic laminate",
          "Standard hinges & handles",
          "Telescopic drawer channels",
          "Fixed shelves + overhead storage",
        ],
      },
      {
        key: "STANDARD",
        label: "Standard",
        badge: "Most popular",
        rate: 1050,
        rateLabel: "₹1,050 / sqft",
        materials: [
          "BWR plywood + decorative laminate",
          "Soft-close storage units",
          "Cable grommet + metal handles",
          "Modular workstation layout",
        ],
      },
      {
        key: "PREMIUM",
        label: "Premium",
        rate: 1800,
        rateLabel: "₹1,800 / sqft",
        materials: [
          "HDHMR / BWP full waterproof",
          "Acrylic or veneer surfaces",
          "Hettich / Hafele hardware throughout",
          "Partition panels + LED task lighting",
        ],
      },
    ],
  },
];

function formatRateLabel(rate: number): string {
  return `₹${Math.round(rate).toLocaleString("en-IN")} / sqft`;
}

export function getEstimatorCategories(priceBook?: PriceBook): CategorySpec[] {
  if (!priceBook) {
    return CATEGORIES;
  }

  return CATEGORIES.map((category) => {
    if (category.inputType === "kitchen") {
      const tiers = category.tiers.map((tier) => {
        return {
          ...tier,
          ratePerSqft: priceBook.estimator[category.slug][tier.key],
          chimneyPrice: priceBook.kitchen.chimney[tier.key],
          hobPrice: priceBook.kitchen.hob[tier.key],
        };
      }) as [KitchenTierSpec, KitchenTierSpec, KitchenTierSpec];

      return {
        ...category,
        tiers,
      };
    }

    const tiers = category.tiers.map((tier) => {
      const rate = priceBook.estimator[category.slug][tier.key];

      return {
        ...tier,
        rate,
        rateLabel: formatRateLabel(rate),
      };
    }) as [DimensionTierSpec, DimensionTierSpec, DimensionTierSpec];

    return {
      ...category,
      tiers,
    };
  });
}

// ── Lookup helpers ────────────────────────────────────────────────────────────

export function getCategory(slug: string): CategorySpec | undefined {
  return CATEGORIES.find((c) => c.slug === slug);
}

export function getCategoryOrFallback(slug: string): CategorySpec {
  return getCategory(slug) ?? CATEGORIES.find((c) => c.slug === "wardrobe")!;
}

// ── Calculation ───────────────────────────────────────────────────────────────

/**
 * Calculate estimate for a dimension-based category (width × height).
 * Returns null if either dimension is 0.
 */
export function calculateDimension(
  cat: DimensionCategorySpec,
  tier: DimensionTierSpec,
  width: number,
  height: number,
): DimensionEstimateResult | null {
  if (!width || width <= 0 || !height || height <= 0) return null;
  const sqft = width * height;
  return {
    kind: "dimensions",
    category: cat,
    tier,
    width,
    height,
    sqft,
    total: Math.round(sqft * tier.rate),
  };
}

export function calculateKitchen(
  cat: KitchenCategorySpec,
  tier: KitchenTierSpec,
  lowerRft: number,
  upperRft: number,
): KitchenEstimateResult | null {
  if (lowerRft <= 0 && upperRft <= 0) return null;

  const LOWER_HEIGHT = 2.5;
  const UPPER_HEIGHT = 2.0;

  const totalArea = lowerRft * LOWER_HEIGHT + upperRft * UPPER_HEIGHT;
  const cabinetTotal = Math.round(totalArea * tier.ratePerSqft);
  const total = cabinetTotal + tier.chimneyPrice + tier.hobPrice;

  return {
    kind: "kitchen",
    category: cat,
    tier,
    lowerRft,
    upperRft,
    totalArea,
    cabinetTotal, // ← ADD
    chimneyPrice: tier.chimneyPrice, // ← ADD
    hobPrice: tier.hobPrice,
    total,
  };
}

/**
 * Calculate all three tiers for a dimension category.
 * Returns a map of TierKey → result | null.
 */
export function calculateAllDimensionTiers(
  cat: DimensionCategorySpec,
  width: number,
  height: number,
): Record<TierKey, DimensionEstimateResult | null> {
  return {
    BUDGET: calculateDimension(cat, cat.tiers[0], width, height),
    STANDARD: calculateDimension(cat, cat.tiers[1], width, height),
    PREMIUM: calculateDimension(cat, cat.tiers[2], width, height),
  };
}

/**
 * Calculate all three tiers for a kitchen.
 */
export function calculateAllKitchenTiers(
  cat: KitchenCategorySpec,
  lowerRft: number,
  upperRft: number,
): Record<TierKey, KitchenEstimateResult | null> {
  return {
    BUDGET: calculateKitchen(cat, cat.tiers[0], lowerRft, upperRft),
    STANDARD: calculateKitchen(cat, cat.tiers[1], lowerRft, upperRft),
    PREMIUM: calculateKitchen(cat, cat.tiers[2], lowerRft, upperRft),
  };
}

// ── Formatting ────────────────────────────────────────────────────────────────

/** ₹85,000 → "₹85K" | ₹150,000 → "₹1.5L" */
export function formatCompact(n: number): string {
  if (n >= 100_000) return `₹${(n / 100_000).toFixed(1)}L`;
  return `₹${Math.round(n / 1_000)}K`;
}

/** 85000 → "₹85,000" */
export function formatFull(n: number): string {
  return `₹${n.toLocaleString("en-IN")}`;
}

// ── WhatsApp message builders ─────────────────────────────────────────────────

export interface WaMessageOptions {
  designTitle?: string;
  closingLine?: string;
}

export function buildWaMessage(
  result: EstimateResult,
  options: WaMessageOptions = {},
): string {
  const { designTitle } = options;
  const lines: string[] = [];

  // Opening
  lines.push(
    designTitle
      ? `Hi, I'm interested in the "${designTitle}" setup.`
      : `Hi! I used the estimator on Goel Traders website and need a quote.`,
  );
  lines.push("");

  // Details
  if (result.kind === "kitchen") {
    lines.push(`\u{1F4D0} *Furniture:* Modular Kitchen`);
    lines.push(
      `\u{1F4CF} *Size:* ${result.lowerRft}ft lower + ${result.upperRft}ft upper`,
    );
  } else {
    lines.push(`\u{1F4D0} *Furniture:* ${result.category.label}`);
    lines.push(
      `\u{1F4CF} *Size:* ${result.width} ft × ${result.height} ft (${result.sqft} sqft)`,
    );
  }

  lines.push(`\u{1F3F7} *Quality:* ${result.tier.label}`);
  lines.push(`\u{1F4B0} *Estimated Cost:* ${formatCompact(result.total)}`);

  lines.push("");

  // 🔥 Conversion Push
  lines.push(
    `I want the exact material list with current prices and brand options.`,
  );

  lines.push(
    `Please share the material list with brand options and current prices.`,
  );

  lines.push("");
  lines.push(`(Sent via Goel Traders estimator)`);

  return lines.join("\n");
}
export function buildWaUrl(
  whatsappNumber: string,
  result: EstimateResult,
  options?: WaMessageOptions,
): string {
  return `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(buildWaMessage(result, options))}`;
}

export function buildFallbackWaUrl(
  whatsappNumber: string,
  cat: CategorySpec,
  designTitle?: string,
): string {
  const text = designTitle
    ? `Hi! I'm interested in the "${designTitle}" design. Can you share material pricing for a ${cat.label.toLowerCase()}?`
    : `Hi! I want a material estimate for my ${cat.label.toLowerCase()}. Can you help?`;
  return `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(text)}`;
}

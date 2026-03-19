/**
 * apps/web/lib/estimator/estimate-engine.ts
 *
 * Two-phase estimation:
 *   Phase 1 — getQuantities()  →  pure thumb-rule math, no prices, no waste
 *   Phase 2 — buildEstimate()  →  applies grade tier + DB price book
 *
 * Prices come entirely from the admin PriceBook (loadPriceBook() → DB).
 * Nothing is hardcoded here. Admin price changes take effect immediately.
 *
 * Grade tiers change the material type AND the price:
 *   BUDGET   → MR plywood · standard hinges · basic handles · telescopic channels
 *   STANDARD → BWR plywood · soft-close hinges · handles · telescopic channels
 *   PREMIUM  → BWP/HDHMR · soft-close hinges · profile handles · tandem boxes
 *
 * No waste factor applied — quantities are net. One 8×4 sheet = 32 sqft.
 */

import type { PriceBook } from "@/lib/estimator/priceBook";

// ─── Public types ─────────────────────────────────────────────────────────────

export type CategorySlug =
  | "kitchen"
  | "wardrobe"
  | "tv-unit"
  | "bedroom"
  | "study"
  | "office";

export type GradeKey = "BUDGET" | "STANDARD" | "PREMIUM";

export interface EstimateInput {
  category: CategorySlug;
  width: number; // ft — kitchen: running length; all else: furniture width
  height: number; // ft — furniture height (ceiling height for bedroom/office)
  sliding?: boolean; // wardrobe: sliding vs hinged
}

export interface PricedLine {
  name: string; // material name for this grade
  qty: number; // exact quantity, no waste
  unit: string;
  unitPrice: number; // from DB price book
  total: number; // qty × unitPrice
}

export interface EstimateResult {
  grade: GradeKey;
  gradeLabel: string; // "Budget" | "Medium" | "Premium"
  gradeDescription: string; // one-line material summary
  lines: PricedLine[];
  materialTotal: number;
  labor: number; // from priceBook.rates.labor (Haryana rate)
  grandTotal: number;
  basisNote: string; // human-readable measurement basis
}

// ─── Internal quantity shape ──────────────────────────────────────────────────

interface Quantities {
  plywoodSheets: number;
  laminateSheets: number;
  mdfSheets: number; // TV unit back panel only
  hinges: number; // pairs
  handles: number; // pcs
  drawerChannels: number; // sets
  slidingTracks: number; // sets (wardrobe sliding only)
  edgeBand: number; // rft
  basisNote: string;
}

// ─── Constants ────────────────────────────────────────────────────────────────

const SQFT_PER_SHEET = 32;

function sheets(sqft: number): number {
  return Math.ceil(sqft / SQFT_PER_SHEET);
}

// ─── Grade config ─────────────────────────────────────────────────────────────
// Material display names + PriceBook.hardware key mapping per grade.
// Hardware keys must match what the admin seeds in the price book DB table.

const GRADE_CONFIG: Record<
  GradeKey,
  {
    label: string;
    description: string;
    plyName: string;
    lamName: string;
    mdfName: string;
    hingeKey: string;
    handleKey: string;
    channelKey: string;
    slidingKey: string;
    edgeKey: string;
  }
> = {
  BUDGET: {
    label: "Budget",
    description: "MR plywood · standard hinges · basic handles",
    plyName: "MR plywood 18mm (8×4 sheet)",
    lamName: "Basic laminate 1mm (8×4 sheet)",
    mdfName: "MDF 12mm back panel (8×4 sheet)",
    hingeKey: "HINGE_NORMAL",
    handleKey: "HANDLE",
    channelKey: "TELESCOPIC_CHANNEL",
    slidingKey: "SLIDING_TRACK_SET",
    edgeKey: "EDGE_BAND",
  },
  STANDARD: {
    label: "Medium",
    description: "BWR plywood · soft-close hinges · handles",
    plyName: "BWR plywood 18mm (8×4 sheet)",
    lamName: "Decorative laminate 1mm (8×4 sheet)",
    mdfName: "MDF 12mm back panel (8×4 sheet)",
    hingeKey: "HINGE_SOFT_CLOSE",
    handleKey: "HANDLE",
    channelKey: "TELESCOPIC_CHANNEL",
    slidingKey: "SLIDING_TRACK_SET",
    edgeKey: "EDGE_BAND",
  },
  PREMIUM: {
    label: "Premium",
    description:
      "BWP/HDHMR · soft-close hinges · profile handles · tandem boxes",
    plyName: "BWP / HDHMR 18mm (8×4 sheet)",
    lamName: "Acrylic / veneer laminate (8×4 sheet)",
    mdfName: "MDF 12mm back panel (8×4 sheet)",
    hingeKey: "HINGE_SOFT_CLOSE",
    handleKey: "PROFILE_HANDLE",
    channelKey: "TANDEM_BOX",
    slidingKey: "SLIDING_TRACK_SET",
    edgeKey: "EDGE_BAND",
  },
};

// ─── Price helpers (all from DB) ──────────────────────────────────────────────

/** Plywood price per sheet = (per-sqft rate from DB) × 32 */
function plyPrice(grade: GradeKey, pb: PriceBook): number {
  return Math.round(pb.sheets[grade].plywood * SQFT_PER_SHEET);
}

/** Laminate price per sheet = (per-sqft surface rate from DB) × 32 */
function lamPrice(grade: GradeKey, pb: PriceBook): number {
  return Math.round(pb.sheets[grade].surface * SQFT_PER_SHEET);
}

/**
 * MDF sheet price — stored as hardware.MDF_SHEET if admin has set it,
 * otherwise falls back to Budget surface price as a reasonable proxy.
 */
function mdfPrice(pb: PriceBook): number {
  const stored = pb.hardware["MDF_SHEET"];
  if (stored) return Math.round(stored);
  return Math.round(pb.sheets["BUDGET"].surface * SQFT_PER_SHEET);
}

function hw(key: string, pb: PriceBook): number {
  return pb.hardware[key] ?? 0;
}

// ─── Phase 1: category quantity calculators ───────────────────────────────────

/**
 * Kitchen — running feet along the wall (not room area).
 *
 * Haryana contractor thumb rules per running foot:
 *   Plywood 18mm : 10.5 sqft  (base carcass + wall cabinet carcass + shutters)
 *   Laminate     :  6.5 sqft  (exposed faces: fronts + visible sides)
 *   Hinges       :  2.5 pairs
 *   Handles      :  1.5 pcs
 *   Drawer channels: 0.4 sets (~1 per 2.5 ft)
 *   Edge band    :  8 rft
 */
function kitchenQty(runFt: number): Quantities {
  return {
    plywoodSheets: sheets(runFt * 10.5),
    laminateSheets: sheets(runFt * 6.5),
    mdfSheets: 0,
    hinges: Math.ceil(runFt * 2.5),
    handles: Math.ceil(runFt * 1.5),
    drawerChannels: Math.ceil(runFt * 0.4),
    slidingTracks: 0,
    edgeBand: Math.ceil(runFt * 8),
    basisNote: `${runFt} running feet of kitchen`,
  };
}

/**
 * Wardrobe — face area (width × height).
 *
 * Per sqft of face:
 *   Plywood 18mm : 2.0 sqft  (sides, top, bottom, back, shelves, shutters)
 *   Laminate     : 1.5 sqft  (exposed faces)
 *   Hinged: 0.12 hinge pairs + 0.08 handles per sqft
 *   Sliding: 1 track set per 5 sqft face
 *   Edge band: 0.6 rft per sqft
 */
function wardrobeQty(w: number, h: number, sliding: boolean): Quantities {
  const face = w * h;
  return {
    plywoodSheets: sheets(face * 2.0),
    laminateSheets: sheets(face * 1.5),
    mdfSheets: 0,
    hinges: sliding ? 0 : Math.ceil(face * 0.12),
    handles: sliding ? 0 : Math.ceil(face * 0.08),
    drawerChannels: 0,
    slidingTracks: sliding ? Math.ceil(face / 5) : 0,
    edgeBand: Math.ceil(face * 0.6),
    basisNote: `${w} × ${h} ft wardrobe (${Math.round(face)} sqft)`,
  };
}

/**
 * TV unit / feature wall — face area (width × height).
 *
 * Per sqft:
 *   MDF 12mm (back panel): 1.2 sqft
 *   Plywood 18mm (cabinets): 1.2 sqft
 *   Laminate: 1.2 sqft
 *   Hinges: 0.06 pairs
 *   Handles: 0.05 pcs
 *   Edge band: 0.4 rft
 */
function tvUnitQty(w: number, h: number): Quantities {
  const face = w * h;
  return {
    plywoodSheets: sheets(face * 1.2),
    laminateSheets: sheets(face * 1.2),
    mdfSheets: sheets(face * 1.2),
    hinges: Math.ceil(face * 0.06),
    handles: Math.ceil(face * 0.05),
    drawerChannels: 0,
    slidingTracks: 0,
    edgeBand: Math.ceil(face * 0.4),
    basisNote: `${w} × ${h} ft TV unit`,
  };
}

/**
 * Study table — face area (width × height includes shelf height).
 *
 * Per sqft:
 *   Plywood 18mm: 1.5 sqft (tabletop + sides + shelf)
 *   Laminate: 1.2 sqft
 *   Drawer channels: 0.3 sets (min 1)
 *   Handles: 0.3 pcs
 *   Edge band: perimeter
 */
function studyQty(w: number, h: number): Quantities {
  const face = w * h;
  return {
    plywoodSheets: sheets(face * 1.5),
    laminateSheets: sheets(face * 1.2),
    mdfSheets: 0,
    hinges: 0,
    handles: Math.ceil(face * 0.3),
    drawerChannels: Math.max(1, Math.ceil(face * 0.3)),
    slidingTracks: 0,
    edgeBand: Math.ceil((w + h) * 2),
    basisNote: `${w} × ${h} ft study unit`,
  };
}

/**
 * Bedroom — room width × ceiling height.
 *
 * Covers wardrobe along one wall (~45% of room width) + bed head panel.
 * Bed head panel = fixed 5 sqft plywood + 5 sqft laminate.
 */
function bedroomQty(roomW: number, ceilH: number): Quantities {
  const wW = Math.min(roomW * 0.45, 8);
  const face = wW * ceilH;
  const BED_PLY = 5; // sqft
  return {
    plywoodSheets: sheets(face * 2.0 + BED_PLY),
    laminateSheets: sheets(face * 1.5 + BED_PLY),
    mdfSheets: 0,
    hinges: Math.ceil(face * 0.12 + 4),
    handles: Math.ceil(face * 0.08 + 4),
    drawerChannels: Math.ceil(face * 0.05 + 2),
    slidingTracks: 0,
    edgeBand: Math.ceil((wW + ceilH) * 2),
    basisNote: `${roomW} ft room — wardrobe (${Math.round(wW)} ft wide) + bed head`,
  };
}

/**
 * Office — room width × ceiling height.
 *
 * Heavier plywood use than wardrobe (partitions, cable panels).
 * Per sqft:
 *   Plywood: 2.5 sqft
 *   Laminate: 1.8 sqft
 *   Hinges: 0.1 pairs
 *   Handles: 0.1 pcs
 *   Drawer channels: 0.08 sets
 *   Edge band: 0.5 rft
 */
function officeQty(w: number, h: number): Quantities {
  const face = w * h;
  return {
    plywoodSheets: sheets(face * 2.5),
    laminateSheets: sheets(face * 1.8),
    mdfSheets: 0,
    hinges: Math.ceil(face * 0.1),
    handles: Math.ceil(face * 0.1),
    drawerChannels: Math.ceil(face * 0.08),
    slidingTracks: 0,
    edgeBand: Math.ceil(face * 0.5),
    basisNote: `${w} × ${h} ft office`,
  };
}

function getQuantities(input: EstimateInput): Quantities | null {
  const { category, width, height, sliding = false } = input;
  if (!width || width <= 0) return null;

  switch (category) {
    case "kitchen":
      return kitchenQty(width);
    case "wardrobe":
      return wardrobeQty(width, height || 8, sliding);
    case "tv-unit":
      return tvUnitQty(width, height || 6);
    case "study":
      return studyQty(width, height || 5);
    case "bedroom":
      return bedroomQty(width, height || 10);
    case "office":
      return officeQty(width, height || 9);
    default:
      return null;
  }
}

// ─── Phase 2: apply DB prices ─────────────────────────────────────────────────

function buildLines(
  qty: Quantities,
  grade: GradeKey,
  pb: PriceBook,
): PricedLine[] {
  const gc = GRADE_CONFIG[grade];
  const lines: PricedLine[] = [];

  function add(name: string, q: number, unit: string, unitPrice: number) {
    if (q <= 0 || unitPrice <= 0) return;
    lines.push({
      name,
      qty: q,
      unit,
      unitPrice,
      total: Math.round(q * unitPrice),
    });
  }

  add(gc.plyName, qty.plywoodSheets, "sheets", plyPrice(grade, pb));
  add(gc.lamName, qty.laminateSheets, "sheets", lamPrice(grade, pb));
  add(gc.mdfName, qty.mdfSheets, "sheets", mdfPrice(pb));
  add("Hinges", qty.hinges, "pairs", hw(gc.hingeKey, pb));
  add("Handles", qty.handles, "pcs", hw(gc.handleKey, pb));
  add("Drawer channel sets", qty.drawerChannels, "sets", hw(gc.channelKey, pb));
  add("Sliding track sets", qty.slidingTracks, "sets", hw(gc.slidingKey, pb));
  add("PVC edge band", qty.edgeBand, "rft", hw(gc.edgeKey, pb));

  return lines;
}

// ─── Public API ───────────────────────────────────────────────────────────────

/** Build a priced estimate for one grade. Returns null if width is unset. */
export function buildEstimate(
  input: EstimateInput,
  grade: GradeKey,
  priceBook: PriceBook,
): EstimateResult | null {
  const qty = getQuantities(input);
  if (!qty) return null;

  const gc = GRADE_CONFIG[grade];
  const lines = buildLines(qty, grade, priceBook);
  const materialTotal = lines.reduce((s, l) => s + l.total, 0);
  const labor = Math.round(materialTotal * priceBook.rates.labor);

  return {
    grade,
    gradeLabel: gc.label,
    gradeDescription: gc.description,
    lines,
    materialTotal,
    labor,
    grandTotal: materialTotal + labor,
    basisNote: qty.basisNote,
  };
}

/**
 * Build all three grade estimates at once.
 * Used to render Budget / Medium / Premium tabs side-by-side.
 */
export function buildAllGrades(
  input: EstimateInput,
  priceBook: PriceBook,
): Record<GradeKey, EstimateResult | null> {
  return {
    BUDGET: buildEstimate(input, "BUDGET", priceBook),
    STANDARD: buildEstimate(input, "STANDARD", priceBook),
    PREMIUM: buildEstimate(input, "PREMIUM", priceBook),
  };
}

/** WhatsApp message pre-filled with full breakdown for the selected grade. */
export function buildWaMessage(
  input: EstimateInput,
  result: EstimateResult,
  categoryLabel: string,
): string {
  const fmt = (n: number) =>
    n >= 100_000
      ? `₹${(n / 100_000).toFixed(1)}L`
      : `₹${Math.round(n / 1_000)}K`;

  return [
    `Hi! I used your estimator for my ${categoryLabel.toLowerCase()}.`,
    ``,
    `*Size:* ${result.basisNote}`,
    `*Quality:* ${result.gradeLabel} — ${result.gradeDescription}`,
    ``,
    `*Materials needed:*`,
    ...result.lines.map((l) => `- ${l.name}: ${l.qty} ${l.unit}`),
    ``,
    `*Estimated total: ${fmt(result.grandTotal)}* (materials + labour)`,
    ``,
    `Can you share your current prices for these items?`,
  ].join("\n");
}

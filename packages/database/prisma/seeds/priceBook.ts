/**
 * packages/database/prisma/seeds/priceBook.ts
 *
 * Complete price book seed. Drop this file in place and call
 * seedPriceBook(prisma) from your main seed.ts.
 *
 * Three material tiers modelled:
 *
 *   SHEET category — 18mm BWR plywood (carcass + shutters)
 *     sheet.BUDGET.plywood   ₹65/sqft  — Commercial MR grade
 *     sheet.STANDARD.plywood ₹95/sqft  — BWR grade IS:303
 *     sheet.PREMIUM.plywood  ₹140/sqft — BWP / HDHMR
 *
 *   SURFACE category — thin panels (back panels + drawer boxes)
 *     sheet.BUDGET.surface   ₹38/sqft  — 9mm commercial / 6mm HDF
 *     sheet.STANDARD.surface ₹55/sqft  — 9mm BWR / 12mm commercial
 *     sheet.PREMIUM.surface  ₹75/sqft  — 9mm BWP / premium HDF
 *
 *   LAMINATE category — applied sqft (both faces counted in panelCalculations)
 *     hardware.LAMINATE_PER_SQFT_BUDGET   ₹38/sqft  — 0.8mm matte
 *     hardware.LAMINATE_PER_SQFT_STANDARD ₹52/sqft  — 1mm standard
 *     hardware.LAMINATE_PER_SQFT_PREMIUM  ₹145/sqft — veneer / acrylic
 *
 * Laminate is priced per applied sqft, not per sheet, because
 * panelCalculations.ts already returns the real laminated area
 * (both faces of every panel). No sheet-to-sqft conversion needed.
 */

import { PrismaClient } from "@prisma/client";

const entries = [
  // ── Estimator rates — directly used by the public estimator UI ────────────
  {
    key: "estimator.kitchen.BUDGET",
    category: "ESTIMATOR",
    label: "Kitchen — budget",
    value: 2200,
    unit: "per sqft",
    notes: "Used by the kitchen estimator for the budget tier.",
  },
  {
    key: "estimator.kitchen.STANDARD",
    category: "ESTIMATOR",
    label: "Kitchen — standard",
    value: 2800,
    unit: "per sqft",
    notes: "Used by the kitchen estimator for the standard tier.",
  },
  {
    key: "estimator.kitchen.PREMIUM",
    category: "ESTIMATOR",
    label: "Kitchen — premium",
    value: 3500,
    unit: "per sqft",
    notes: "Used by the kitchen estimator for the premium tier.",
  },
  {
    key: "estimator.wardrobe.BUDGET",
    category: "ESTIMATOR",
    label: "Wardrobe — budget",
    value: 600,
    unit: "per sqft",
    notes: "Used by the wardrobe estimator for the budget tier.",
  },
  {
    key: "estimator.wardrobe.STANDARD",
    category: "ESTIMATOR",
    label: "Wardrobe — standard",
    value: 1000,
    unit: "per sqft",
    notes: "Used by the wardrobe estimator for the standard tier.",
  },
  {
    key: "estimator.wardrobe.PREMIUM",
    category: "ESTIMATOR",
    label: "Wardrobe — premium",
    value: 1800,
    unit: "per sqft",
    notes: "Used by the wardrobe estimator for the premium tier.",
  },
  {
    key: "estimator.tv-unit.BUDGET",
    category: "ESTIMATOR",
    label: "TV unit — budget",
    value: 700,
    unit: "per sqft",
    notes: "Used by the TV unit estimator for the budget tier.",
  },
  {
    key: "estimator.tv-unit.STANDARD",
    category: "ESTIMATOR",
    label: "TV unit — standard",
    value: 1100,
    unit: "per sqft",
    notes: "Used by the TV unit estimator for the standard tier.",
  },
  {
    key: "estimator.tv-unit.PREMIUM",
    category: "ESTIMATOR",
    label: "TV unit — premium",
    value: 1800,
    unit: "per sqft",
    notes: "Used by the TV unit estimator for the premium tier.",
  },
  {
    key: "estimator.bedroom.BUDGET",
    category: "ESTIMATOR",
    label: "Bedroom — budget",
    value: 700,
    unit: "per sqft",
    notes: "Used by the bedroom estimator for the budget tier.",
  },
  {
    key: "estimator.bedroom.STANDARD",
    category: "ESTIMATOR",
    label: "Bedroom — standard",
    value: 1100,
    unit: "per sqft",
    notes: "Used by the bedroom estimator for the standard tier.",
  },
  {
    key: "estimator.bedroom.PREMIUM",
    category: "ESTIMATOR",
    label: "Bedroom — premium",
    value: 2000,
    unit: "per sqft",
    notes: "Used by the bedroom estimator for the premium tier.",
  },
  {
    key: "estimator.study.BUDGET",
    category: "ESTIMATOR",
    label: "Study — budget",
    value: 550,
    unit: "per sqft",
    notes: "Used by the study estimator for the budget tier.",
  },
  {
    key: "estimator.study.STANDARD",
    category: "ESTIMATOR",
    label: "Study — standard",
    value: 900,
    unit: "per sqft",
    notes: "Used by the study estimator for the standard tier.",
  },
  {
    key: "estimator.study.PREMIUM",
    category: "ESTIMATOR",
    label: "Study — premium",
    value: 1500,
    unit: "per sqft",
    notes: "Used by the study estimator for the premium tier.",
  },
  {
    key: "estimator.office.BUDGET",
    category: "ESTIMATOR",
    label: "Office — budget",
    value: 650,
    unit: "per sqft",
    notes: "Used by the office estimator for the budget tier.",
  },
  {
    key: "estimator.office.STANDARD",
    category: "ESTIMATOR",
    label: "Office — standard",
    value: 1050,
    unit: "per sqft",
    notes: "Used by the office estimator for the standard tier.",
  },
  {
    key: "estimator.office.PREMIUM",
    category: "ESTIMATOR",
    label: "Office — premium",
    value: 1800,
    unit: "per sqft",
    notes: "Used by the office estimator for the premium tier.",
  },

  // ── 18mm BWR plywood — carcass, shutters, shelf panels ────────────────────
  {
    key: "sheet.BUDGET.plywood",
    category: "SHEET",
    label: "18mm plywood — commercial MR grade",
    value: 65,
    unit: "per sqft",
    notes:
      "Commercial ply, MR grade. Used for carcass and shutters on budget projects.",
  },
  {
    key: "sheet.STANDARD.plywood",
    category: "SHEET",
    label: "18mm plywood — BWR grade",
    value: 95,
    unit: "per sqft",
    notes:
      "Boiling Water Resistant, IS:303. Standard for kitchens and wardrobes.",
  },
  {
    key: "sheet.PREMIUM.plywood",
    category: "SHEET",
    label: "18mm plywood — BWP / HDHMR",
    value: 140,
    unit: "per sqft",
    notes:
      "Boiling Water Proof or High Density HMR. Premium grade for wet areas.",
  },

  // ── 9mm / 12mm plywood — back panels and drawer boxes ─────────────────────
  // Tracked as "surface" in pricing.ts so they get a cheaper rate than main ply.
  {
    key: "sheet.BUDGET.surface",
    category: "SHEET",
    label: "9mm ply / 6mm HDF — back panels (budget)",
    value: 38,
    unit: "per sqft",
    notes:
      "9mm commercial ply or 6mm HDF for cabinet backs and drawer bottoms.",
  },
  {
    key: "sheet.STANDARD.surface",
    category: "SHEET",
    label: "9mm BWR ply / 12mm ply — back panels and drawer boxes (standard)",
    value: 55,
    unit: "per sqft",
    notes: "9mm BWR for backs; 12mm commercial ply for drawer boxes.",
  },
  {
    key: "sheet.PREMIUM.surface",
    category: "SHEET",
    label: "9mm BWP ply / premium HDF — back panels (premium)",
    value: 75,
    unit: "per sqft",
    notes: "9mm BWP for premium cabinet backs; HDF for visible back panels.",
  },

  // ── Laminate — priced per applied sqft ────────────────────────────────────
  // panelCalculations.ts returns laminateSqft as real applied area
  // (both faces counted). Price here is per sqft of that area.
  {
    key: "hardware.LAMINATE_PER_SQFT_BUDGET",
    category: "HARDWARE",
    label: "Laminate finish — budget grade (0.8mm matte)",
    value: 38,
    unit: "per sqft",
    notes: "0.8mm matte laminate. ≈ ₹1,200 per 8×4 sheet ÷ 32 sqft.",
  },
  {
    key: "hardware.LAMINATE_PER_SQFT_STANDARD",
    category: "HARDWARE",
    label: "Laminate finish — standard grade (1mm)",
    value: 52,
    unit: "per sqft",
    notes: "1mm standard laminate. ≈ ₹1,650 per 8×4 sheet ÷ 32 sqft.",
  },
  {
    key: "hardware.LAMINATE_PER_SQFT_PREMIUM",
    category: "HARDWARE",
    label: "Laminate finish — premium grade (veneer / acrylic)",
    value: 145,
    unit: "per sqft",
    notes: "Natural veneer or acrylic sheet. ≈ ₹4,600 per 8×4 sheet ÷ 32 sqft.",
  },

  // ── Edge banding ───────────────────────────────────────────────────────────
  {
    key: "hardware.EDGE_BAND",
    category: "HARDWARE",
    label: "PVC edge band (22mm)",
    value: 8,
    unit: "per rft",
    notes: "22mm pre-glued PVC edge band. Colour-matched to laminate.",
  },

  // ── Hinges ────────────────────────────────────────────────────────────────
  {
    key: "hardware.HINGE_SOFT_CLOSE",
    category: "HARDWARE",
    label: "Soft-close hinge",
    value: 180,
    unit: "per piece",
    notes: "Hydraulic soft-close hinge. Hettich / Hafele. 110° opening.",
  },
  {
    key: "hardware.HINGE_NORMAL",
    category: "HARDWARE",
    label: "Standard hinge",
    value: 80,
    unit: "per piece",
    notes: "Standard conceal hinge. Budget grade.",
  },

  // ── Handles ───────────────────────────────────────────────────────────────
  {
    key: "hardware.HANDLE",
    category: "HARDWARE",
    label: "Cabinet handle — standard",
    value: 150,
    unit: "per piece",
    notes: "Standard aluminium or SS pull handle.",
  },
  {
    key: "hardware.PROFILE_HANDLE",
    category: "HARDWARE",
    label: "Profile handle / J-pull",
    value: 350,
    unit: "per piece",
    notes:
      "Recessed J-pull or integrated profile grip. Premium / handleless look.",
  },

  // ── Drawer channels ───────────────────────────────────────────────────────
  {
    key: "hardware.TELESCOPIC_CHANNEL",
    category: "HARDWARE",
    label: "Telescopic drawer channel (full extension)",
    value: 450,
    unit: "per set",
    notes: "Full-extension ball-bearing drawer slides. 45kg load. Zinc plated.",
  },
  {
    key: "hardware.TANDEM_BOX",
    category: "HARDWARE",
    label: "Tandem box drawer system",
    value: 1800,
    unit: "per set",
    notes:
      "Hettich / Hafele tandem box with soft-close. Premium drawer system.",
  },

  // ── Wardrobe sliding hardware ─────────────────────────────────────────────
  {
    key: "hardware.SLIDING_TRACK_SET",
    category: "HARDWARE",
    label: "Sliding wardrobe track set",
    value: 3200,
    unit: "per set",
    notes:
      "Top and bottom track for one pair of sliding shutters. Per panel pair.",
  },
  {
    key: "hardware.SLIDING_ROLLER_SET",
    category: "HARDWARE",
    label: "Sliding roller set",
    value: 650,
    unit: "per set",
    notes: "Top and bottom rollers for one sliding shutter panel.",
  },
  {
    key: "hardware.SOFT_STOPPER",
    category: "HARDWARE",
    label: "Soft-close stopper for sliding shutters",
    value: 450,
    unit: "per set",
    notes: "Buffer and soft-close mechanism for sliding wardrobe shutters.",
  },

  // ── Other hardware ────────────────────────────────────────────────────────
  {
    key: "hardware.MAGNETIC_CATCH",
    category: "HARDWARE",
    label: "Magnetic catch",
    value: 70,
    unit: "per piece",
    notes: "Standard magnetic door catch for hinged shutters.",
  },
  {
    key: "hardware.LED_CHANNEL",
    category: "HARDWARE",
    label: "LED aluminium channel",
    value: 550,
    unit: "per piece",
    notes: "Aluminium LED channel with diffuser cover. Per 1m length.",
  },
  {
    key: "hardware.KITCHEN_BASKET",
    category: "HARDWARE",
    label: "SS kitchen pull-out basket",
    value: 1800,
    unit: "per piece",
    notes:
      "304 grade stainless steel. Pull-out basket for base kitchen cabinets.",
  },
  {
    key: "hardware.CABLE_GROMMET",
    category: "HARDWARE",
    label: "Cable grommet",
    value: 250,
    unit: "per piece",
    notes:
      "Round cable pass-through grommet. 60mm diameter. For desks and offices.",
  },
  {
    key: "hardware.METAL_FRAME",
    category: "HARDWARE",
    label: "Metal frame (workstation / table)",
    value: 520,
    unit: "per set",
    notes: "Powder-coated MS table leg set. Per workstation or table.",
  },
  {
    key: "hardware.PARTITION_PANEL",
    category: "HARDWARE",
    label: "Partition panel",
    value: 110,
    unit: "per sqft",
    notes: "Office partition panel including framing. Per sqft of panel area.",
  },
  {
    key: "hardware.MIRROR",
    category: "HARDWARE",
    label: "Mirror (dresser / wardrobe)",
    value: 2400,
    unit: "per piece",
    notes: "4mm float glass mirror. Approx 3ft × 2ft. Safety-backed.",
  },
  {
    key: "hardware.FABRIC_UPHOLSTERY",
    category: "HARDWARE",
    label: "Fabric upholstery (headboard / seating)",
    value: 130,
    unit: "per sqft",
    notes: "Includes foam padding and fabric. Per sqft of upholstered area.",
  },

  // ── Consumables ───────────────────────────────────────────────────────────
  {
    key: "hardware.SCREWS_AND_NAILS",
    category: "HARDWARE",
    label: "Screws, nails and fasteners (lot)",
    value: 1500,
    unit: "per lot",
    notes: "Full project supply of screws, nails, cam locks, and dowels.",
  },
  {
    key: "hardware.ADHESIVE",
    category: "HARDWARE",
    label: "Adhesive — Fevicol SH (lot)",
    value: 950,
    unit: "per lot",
    notes:
      "Full project supply of Fevicol SH and contact adhesive for laminates.",
  },

  // ── Rate percentages (stored as decimals: 0.26 = 26%) ────────────────────
  {
    key: "rate.labor",
    category: "RATE",
    label: "Labor rate",
    value: 0.26,
    unit: "percentage",
    notes:
      "Applied as % of material + hardware cost. Covers cutting, assembly, fitting.",
  },
  {
    key: "rate.installation",
    category: "RATE",
    label: "Installation rate",
    value: 0.08,
    unit: "percentage",
    notes: "On-site installation and fixing. Applied on base project cost.",
  },
  {
    key: "rate.transport",
    category: "RATE",
    label: "Transport rate",
    value: 0.04,
    unit: "percentage",
    notes: "Delivery and loading charges. Applied on base project cost.",
  },
  {
    key: "rate.dealer",
    category: "RATE",
    label: "Dealer margin",
    value: 0.06,
    unit: "percentage",
    notes: "Goel Traders margin on top of cost + labor + install + transport.",
  },
  {
    key: "rate.contractor",
    category: "RATE",
    label: "Contractor margin",
    value: 0.1,
    unit: "percentage",
    notes:
      "Additional margin for contractor-mode estimates (not shown to customers).",
  },
  {
    key: "rate.customer",
    category: "RATE",
    label: "Customer margin (quote range upper end)",
    value: 0.18,
    unit: "percentage",
    notes:
      "Applied on dealer total to produce the upper bound of the customer range.",
  },
] as const;

export async function seedPriceBook(prisma: PrismaClient) {
  console.log("Seeding price book...");

  for (const entry of entries) {
    await prisma.priceBookEntry.upsert({
      where: { key: entry.key },
      update: {
        label: entry.label,
        value: entry.value,
        unit: entry.unit,
        notes: entry.notes ?? null,
      },
      create: entry,
    });
  }

  console.log(`Seeded ${entries.length} price book entries.`);
}

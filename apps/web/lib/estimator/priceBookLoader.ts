import { prisma } from "@repo/database";
import { cache } from "react";
import { type PriceBook, type KitchenProduct, FALLBACK_PRICE_BOOK } from "./priceBook";
import type { CategorySlug, MaterialGrade } from "./types";

const GRADES: MaterialGrade[] = ["BUDGET", "STANDARD", "PREMIUM"];
const ESTIMATOR_CATEGORIES: CategorySlug[] = [
  "kitchen",
  "wardrobe",
  "tv-unit",
  "bedroom",
  "study",
  "office",
];

export const loadPriceBook = cache(async (): Promise<PriceBook> => {
  try {
    const [rows, products] = await Promise.all([
      prisma.priceBookEntry.findMany({ where: { active: true } }),
      prisma.product.findMany({
        where: { active: true, isDefault: true, category: { in: ["chimney", "hob"] } },
      }),
    ]);

    if (rows.length === 0) {
      console.warn("No price book entries found — using fallback prices.");
      return FALLBACK_PRICE_BOOK;
    }

    // Build a fast key→value map
    const byKey = new Map(rows.map((r) => [r.key, r.value]));

    const get = (key: string, fallback: number): number =>
      byKey.get(key) ?? fallback;

    // Build product lookup maps keyed by tier
    const chimneyProducts: Partial<Record<"BUDGET" | "STANDARD" | "PREMIUM", KitchenProduct>> = {};
    const hobProducts: Partial<Record<"BUDGET" | "STANDARD" | "PREMIUM", KitchenProduct>> = {};

    for (const p of products) {
      const prod: KitchenProduct = {
        id: p.id,
        name: p.name,
        brand: p.brand,
        price: p.price,
        tier: p.tier,
        category: p.category,
      };
      if (p.category === "chimney") {
        chimneyProducts[p.tier as "BUDGET" | "STANDARD" | "PREMIUM"] = prod;
      } else if (p.category === "hob") {
        hobProducts[p.tier as "BUDGET" | "STANDARD" | "PREMIUM"] = prod;
      }
    }

    const pb: PriceBook = {
      estimator: {} as PriceBook["estimator"],
      kitchen: {
        chimney: {
          // Prefer the default product price; fall back to PriceBookEntry key
          BUDGET:
            chimneyProducts.BUDGET?.price ??
            get("kitchen.chimney.BUDGET", 10000),
          STANDARD:
            chimneyProducts.STANDARD?.price ??
            get("kitchen.chimney.STANDARD", 18000),
          PREMIUM:
            chimneyProducts.PREMIUM?.price ??
            get("kitchen.chimney.PREMIUM", 30000),
        },
        hob: {
          BUDGET:
            hobProducts.BUDGET?.price ??
            get("kitchen.hob.BUDGET", 5000),
          STANDARD:
            hobProducts.STANDARD?.price ??
            get("kitchen.hob.STANDARD", 9000),
          PREMIUM:
            hobProducts.PREMIUM?.price ??
            get("kitchen.hob.PREMIUM", 16000),
        },
        chimneyProducts,
        hobProducts,
      },
      sheets: {} as PriceBook["sheets"],
      hardware: {},
      rates: {
        labor: get("rate.labor", FALLBACK_PRICE_BOOK.rates.labor),
        installation: get(
          "rate.installation",
          FALLBACK_PRICE_BOOK.rates.installation,
        ),
        transport: get("rate.transport", FALLBACK_PRICE_BOOK.rates.transport),
        dealer: get("rate.dealer", FALLBACK_PRICE_BOOK.rates.dealer),
        contractor: get(
          "rate.contractor",
          FALLBACK_PRICE_BOOK.rates.contractor,
        ),
        customer: get("rate.customer", FALLBACK_PRICE_BOOK.rates.customer),
      },
    };

    for (const category of ESTIMATOR_CATEGORIES) {
      pb.estimator[category] = {
        BUDGET: get(
          `estimator.${category}.BUDGET`,
          FALLBACK_PRICE_BOOK.estimator[category].BUDGET,
        ),
        STANDARD: get(
          `estimator.${category}.STANDARD`,
          FALLBACK_PRICE_BOOK.estimator[category].STANDARD,
        ),
        PREMIUM: get(
          `estimator.${category}.PREMIUM`,
          FALLBACK_PRICE_BOOK.estimator[category].PREMIUM,
        ),
      };
    }

    // Sheet prices
    for (const grade of GRADES) {
      pb.sheets[grade] = {
        plywood: get(
          `sheet.${grade}.plywood`,
          FALLBACK_PRICE_BOOK.sheets[grade].plywood,
        ),
        surface: get(
          `sheet.${grade}.surface`,
          FALLBACK_PRICE_BOOK.sheets[grade].surface,
        ),
      };
    }

    // Hardware prices — every row starting with "hardware."
    for (const [key, value] of byKey) {
      if (key.startsWith("hardware.")) {
        const hwKey = key.replace("hardware.", "");
        pb.hardware[hwKey] = value;
      }
    }

    return pb;
  } catch (error) {
    console.error("Failed to load price book:", error);
    return FALLBACK_PRICE_BOOK;
  }
});


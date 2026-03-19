import { prisma } from "@repo/database";
import { cache } from "react";
import { type PriceBook, FALLBACK_PRICE_BOOK } from "./priceBook";
import type { MaterialGrade } from "./types";

const GRADES: MaterialGrade[] = ["BUDGET", "STANDARD", "PREMIUM"];

export const loadPriceBook = cache(async (): Promise<PriceBook> => {
  try {
    const rows = await prisma.priceBookEntry.findMany({
      where: { active: true },
    });

    if (rows.length === 0) {
      console.warn("No price book entries found — using fallback prices.");
      return FALLBACK_PRICE_BOOK;
    }

    // Build a fast key→value map
    const byKey = new Map(rows.map((r) => [r.key, r.value]));

    const get = (key: string, fallback: number): number =>
      byKey.get(key) ?? fallback;

    const pb: PriceBook = {
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

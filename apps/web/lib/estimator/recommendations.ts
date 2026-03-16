// apps/web/lib/estimator/recommendations.ts

import type {
  EstimationResult,
  NextBestAction,
  ProductRecommendation,
} from "./types";
import type { ProductCatalog } from "./productCatalogLoader";

// ── buildProductRecommendations ───────────────────────────────────────────────
// Accepts a pre-loaded ProductCatalog (from the server component) instead of
// importing the stale static products array.

export function buildProductRecommendations(
  result: Pick<EstimationResult, "materials" | "summary" | "categoryLabel">,
  catalog: ProductCatalog,
): ProductRecommendation[] {
  const seen: Set<string> = new Set();
  const recommendations: ProductRecommendation[] = [];

  for (const material of result.materials) {
    // Find the first mapping rule whose pattern matches this material name
    const rule = catalog.mappings.find((m) => m.pattern.test(material.name));
    if (!rule) continue;

    // Walk the slug list — use the first slug that exists in the live catalog
    const product = rule.productSlugs
      .map((slug) => catalog.bySlug.get(slug))
      .find((p): p is NonNullable<typeof p> => p !== undefined);

    // Skip if no matching product exists in the DB, or already recommended
    if (!product || seen.has(product.slug)) continue;

    seen.add(product.slug);
    recommendations.push({
      materialName: material.name,
      productSlug: product.slug,
      productName: product.name,
      category: product.category,
      brand: product.brand,
      unit: product.unit,
      priceRange: product.priceRange,
      recommendedQty: material.purchaseQuantity,
      reason: rule.reason,
      confidence:
        material.category === "SHEET" || material.category === "HARDWARE"
          ? 0.92
          : 0.82,
      fallbackProductSlugs: rule.productSlugs.filter((s) => s !== product.slug),
    });

    // Cap at 6 recommendations per estimate
    if (recommendations.length >= 6) break;
  }

  return recommendations;
}

// ── decideNextBestAction ──────────────────────────────────────────────────────
// Unchanged — no dependency on the product catalog.

export function decideNextBestAction(params: {
  estimate: Pick<
    EstimationResult,
    "summary" | "productRecommendations" | "materials" | "categoryLabel"
  >;
}): NextBestAction {
  const { estimate } = params;
  const averageRange =
    (estimate.summary.totalCostMin + estimate.summary.totalCostMax) / 2;
  const highConfidence = estimate.productRecommendations.filter(
    (r) => r.confidence >= 0.9,
  ).length;
  const materialLines = estimate.materials.length;

  if (averageRange >= 180_000 || materialLines >= 10) {
    return {
      primary: "BOOK_SITE_VISIT",
      secondary: "REQUEST_QUOTE",
      tertiary: "VIEW_PRODUCT_BUNDLE",
      reason:
        "Higher-value and more complex projects usually convert better through consultation first.",
    };
  }

  if (highConfidence >= 3) {
    return {
      primary: "VIEW_PRODUCT_BUNDLE",
      secondary: "REQUEST_QUOTE",
      tertiary: "BOOK_SITE_VISIT",
      reason:
        "The estimate has strong Goel Traders product matches, so a product bundle is the most direct next step.",
    };
  }

  return {
    primary: "REQUEST_QUOTE",
    secondary: "BOOK_SITE_VISIT",
    tertiary: "SAVE_ESTIMATE",
    reason:
      "A guided quote request is the safest next action when the material plan needs human refinement.",
  };
}

import { products } from "@/lib/data/products";
import type { EstimationResult, NextBestAction, ProductRecommendation } from "./types";

type ProductMatcher = {
  matches: string[];
  fallback: string[];
  reason: string;
};

const PRODUCT_MAPPING_RULES: Array<{
  pattern: RegExp;
  matcher: ProductMatcher;
}> = [
  {
    pattern: /PLYWOOD|MDF/i,
    matcher: {
      matches: ["bwr-plywood-19mm", "marine-plywood-19mm"],
      fallback: ["marine-plywood-19mm"],
      reason: "Recommended board stock for carcass, shutters, and structural panels.",
    },
  },
  {
    pattern: /LAMINATE|ACRYLIC/i,
    matcher: {
      matches: ["high-gloss-laminate-1mm", "matte-laminate-08mm"],
      fallback: ["matte-laminate-08mm"],
      reason: "Surface finish options mapped to the visible finish layers in the estimate.",
    },
  },
  {
    pattern: /VENEER/i,
    matcher: {
      matches: ["teak-wood-veneer"],
      fallback: ["matte-laminate-08mm"],
      reason: "Premium natural veneer finish aligned to higher-end design selections.",
    },
  },
  {
    pattern: /HINGE/i,
    matcher: {
      matches: ["soft-close-hinges"],
      fallback: [],
      reason: "Soft-close hinge recommendation matched to shutter hardware demand.",
    },
  },
  {
    pattern: /CHANNEL/i,
    matcher: {
      matches: ["telescopic-drawer-channel"],
      fallback: [],
      reason: "Drawer movement hardware mapped from drawer modules.",
    },
  },
  {
    pattern: /EDGE/i,
    matcher: {
      matches: ["pvc-edge-band-22mm"],
      fallback: [],
      reason: "Edge band quantity mapped to exposed panel edges in the module plan.",
    },
  },
  {
    pattern: /ADHESIVE|GLUE/i,
    matcher: {
      matches: ["fevicol-sh-adhesive"],
      fallback: [],
      reason: "Adhesive recommendation for fabrication and laminate bonding.",
    },
  },
];

function parsePriceRangeMidpoint(priceRange: string): number {
  const normalized = priceRange.replace(/,/g, "");
  const values = normalized.match(/\d+(?:\.\d+)?/g)?.map(Number) ?? [];
  if (values.length === 0) {
    return 0;
  }
  if (values.length === 1) {
    return values[0] ?? 0;
  }
  return ((values[0] ?? 0) + (values[1] ?? 0)) / 2;
}

function getProductBySlug(slug: string) {
  return products.find((product) => product.slug === slug);
}

export function buildProductRecommendations(result: Pick<EstimationResult, "materials" | "summary" | "categoryLabel">): ProductRecommendation[] {
  const seen = new Set<string>();
  const recommendations: ProductRecommendation[] = [];

  for (const material of result.materials) {
    const rule = PRODUCT_MAPPING_RULES.find((entry) => entry.pattern.test(material.name));
    if (!rule) {
      continue;
    }

    const product = rule.matcher.matches
      .map(getProductBySlug)
      .filter((item): item is NonNullable<typeof item> => Boolean(item))
      .sort((left, right) => parsePriceRangeMidpoint(left.priceRange) - parsePriceRangeMidpoint(right.priceRange))[0];

    if (!product || seen.has(product.slug)) {
      continue;
    }

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
      reason: rule.matcher.reason,
      confidence: material.category === "SHEET" || material.category === "HARDWARE" ? 0.92 : 0.82,
      fallbackProductSlugs: rule.matcher.fallback,
    });
  }

  return recommendations.slice(0, 6);
}

export function decideNextBestAction(params: {
  estimate: Pick<EstimationResult, "summary" | "productRecommendations" | "materials" | "categoryLabel">;
}): NextBestAction {
  const { estimate } = params;
  const averageRange = (estimate.summary.totalCostMin + estimate.summary.totalCostMax) / 2;
  const highConfidenceRecommendations = estimate.productRecommendations.filter((item) => item.confidence >= 0.9).length;
  const materialLines = estimate.materials.length;

  if (averageRange >= 180000 || materialLines >= 10) {
    return {
      primary: "BOOK_SITE_VISIT",
      secondary: "REQUEST_QUOTE",
      tertiary: "VIEW_PRODUCT_BUNDLE",
      reason: "Higher-value and more complex projects usually convert better through consultation first.",
    };
  }

  if (highConfidenceRecommendations >= 3) {
    return {
      primary: "VIEW_PRODUCT_BUNDLE",
      secondary: "REQUEST_QUOTE",
      tertiary: "BOOK_SITE_VISIT",
      reason: "The estimate has strong Goel Traders product matches, so a product bundle is the most direct next step.",
    };
  }

  return {
    primary: "REQUEST_QUOTE",
    secondary: "BOOK_SITE_VISIT",
    tertiary: "SAVE_ESTIMATE",
    reason: "A guided quote request is the safest next action when the material plan needs human refinement.",
  };
}

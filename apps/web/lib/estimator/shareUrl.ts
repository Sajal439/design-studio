import type { EstimationResult } from "./types";

export type EstimateShareParams = {
  category: string;
  grade: string;
  layout: string;
  width: number;
  height: number;
  depth: number;
  costMin: number;
  costMax: number;
  designTitle: string;
};

export function buildShareParams(
  result: EstimationResult,
): EstimateShareParams {
  return {
    category: result.categoryLabel,
    grade: result.grade,
    layout: result.layout,
    width: result.dimensions.width,
    height: result.dimensions.height,
    depth: result.dimensions.depth,
    costMin: result.summary.totalCostMin,
    costMax: result.summary.totalCostMax,
    designTitle: result.designTitle,
  };
}

// Quote form URL — lands on /quote with fields pre-filled
export function buildQuoteUrl(result: EstimationResult): string {
  const p = buildShareParams(result);
  const params = new URLSearchParams({
    source: "estimator",
    projectType: p.category,
    message: buildEstimateSummary(p),
  });
  return `/quote?${params.toString()}`;
}

// WhatsApp deep-link — opens a pre-filled chat to the store number
export function buildWhatsAppUrl(
  result: EstimationResult,
  phoneNumber: string, // e.g. "919876543210" — country code, no +
): string {
  const text = encodeURIComponent(
    buildWhatsAppMessage(buildShareParams(result)),
  );
  return `https://wa.me/${phoneNumber}?text=${text}`;
}

// Shareable estimate URL — encodes key inputs in the hash so the page can
// restore state without a database or user account
export function buildShareableUrl(result: EstimationResult): string {
  const state = {
    categorySlug: result.categorySlug,
    designId: result.designId,
    layout: result.layout,
    grade: result.grade,
    finishType: result.finishType,
    doorType: result.doorType,
    w: result.dimensions.width,
    h: result.dimensions.height,
    d: result.dimensions.depth,
  };
  // Base64-encode so the URL stays clean in messaging apps
  const hash = btoa(JSON.stringify(state));
  return `${typeof window !== "undefined" ? window.location.origin : ""}/estimator#e=${hash}`;
}

// ── Message builders ────────────────────────────────────────────────────────

function formatCrore(n: number): string {
  if (n >= 10_000_000) return `₹${(n / 10_000_000).toFixed(2)} cr`;
  if (n >= 100_000) return `₹${(n / 100_000).toFixed(1)} L`;
  return `₹${n.toLocaleString("en-IN")}`;
}

function buildEstimateSummary(p: EstimateShareParams): string {
  return (
    `${p.designTitle} — ${p.category}, ${p.layout.replace(/_/g, " ")} layout, ` +
    `${p.width}×${p.height}×${p.depth} ft, ${p.grade.toLowerCase()} grade. ` +
    `Estimate: ${formatCrore(p.costMin)} – ${formatCrore(p.costMax)}.`
  );
}

function buildWhatsAppMessage(p: EstimateShareParams): string {
  return (
    `Hi, I used the material estimator on your website and got an estimate for my project.\n\n` +
    `*Project:* ${p.category}\n` +
    `*Design:* ${p.designTitle}\n` +
    `*Layout:* ${p.layout.replace(/_/g, " ")}\n` +
    `*Dimensions:* ${p.width} × ${p.height} × ${p.depth} ft\n` +
    `*Grade:* ${p.grade.toLowerCase()}\n` +
    `*Estimate:* ${formatCrore(p.costMin)} – ${formatCrore(p.costMax)}\n\n` +
    `Can you help me take this forward?`
  );
}

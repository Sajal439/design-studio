"use client";

/**
 * apps/web/components/marketing/quick-estimate-widget.tsx
 *
 * Compact version of SimpleEstimator for the design detail page sidebar.
 * Pre-locked to one category. Shows Budget / Medium / Premium tabs.
 * Receives priceBook as a prop from the server-rendered design detail page.
 *
 * Usage in designs/[slug]/page.tsx:
 *   const priceBook = await loadPriceBook();
 *   ...
 *   <QuickEstimateWidget
 *     designTitle="Modern L-Kitchen"
 *     categorySlug={design.category.slug}
 *     priceBook={priceBook}
 *   />
 */

import { useState, useMemo } from "react";
import { MessageCircle } from "lucide-react";
import { Input } from "@/components/ui/input";
import { siteConfig } from "@/lib/site-config";
import type { PriceBook } from "@/lib/estimator/priceBook";
import { buildAllGrades, buildWaMessage, CategorySlug, GradeKey } from "./estimator/estimator-engine";

const CATEGORY_CFG: Record<
    string,
    { widthLabel: string; widthPh: string; needsH: boolean; heightPh: string }
> = {
    kitchen: { widthLabel: "Running length (ft)", widthPh: "e.g. 10", needsH: false, heightPh: "8" },
    wardrobe: { widthLabel: "Width (ft)", widthPh: "e.g. 6", needsH: true, heightPh: "8" },
    "tv-unit": { widthLabel: "Width (ft)", widthPh: "e.g. 8", needsH: true, heightPh: "6" },
    bedroom: { widthLabel: "Room width (ft)", widthPh: "e.g. 12", needsH: true, heightPh: "10" },
    study: { widthLabel: "Width (ft)", widthPh: "e.g. 5", needsH: true, heightPh: "5" },
    office: { widthLabel: "Room width (ft)", widthPh: "e.g. 14", needsH: true, heightPh: "9" },
};

const GRADE_ORDER: GradeKey[] = ["BUDGET", "STANDARD", "PREMIUM"];
const GRADE_LABEL: Record<GradeKey, string> = {
    BUDGET: "Budget", STANDARD: "Medium", PREMIUM: "Premium",
};

function fmtINR(n: number): string {
    return n >= 100_000 ? `₹${(n / 100_000).toFixed(1)}L` : `₹${Math.round(n / 1_000)}K`;
}
function fmtFull(n: number): string {
    return `₹${n.toLocaleString("en-IN")}`;
}

interface Props {
    designTitle: string;
    categorySlug: string;
    priceBook: PriceBook;
}

export function QuickEstimateWidget({ designTitle, categorySlug, priceBook }: Props) {
    const cfg = CATEGORY_CFG[categorySlug];
    const [width, setWidth] = useState("");
    const [height, setHeight] = useState("");
    const [grade, setGrade] = useState<GradeKey>("STANDARD");

    const input = {
        category: categorySlug as CategorySlug,
        width: parseFloat(width) || 0,
        height: parseFloat(height) || 0,
    };

    const allGrades = useMemo(
        () => (input.width > 0 ? buildAllGrades(input, priceBook) : null),
        [categorySlug, input.width, input.height, priceBook]
    );

    const result = allGrades?.[grade] ?? null;

    const waMsg = result
        ? buildWaMessage(input, result, designTitle)
        : `Hi! I'm interested in "${designTitle}". Can you share the price?`;
    const waUrl = `https://wa.me/91${siteConfig.whatsapp}?text=${encodeURIComponent(waMsg)}`;

    if (!cfg) return null;

    return (
        <div className="rounded-xl border bg-muted/20 p-4 space-y-3">

            {/* Size inputs */}
            <div className={`grid gap-2 ${cfg.needsH ? "grid-cols-2" : "grid-cols-1"}`}>
                <div>
                    <label className="text-xs text-muted-foreground block mb-1">{cfg.widthLabel}</label>
                    <Input
                        type="number" placeholder={cfg.widthPh}
                        value={width} onChange={(e) => setWidth(e.target.value)}
                        min="1" max="100"
                    />
                </div>
                {cfg.needsH && (
                    <div>
                        <label className="text-xs text-muted-foreground block mb-1">Height (ft)</label>
                        <Input
                            type="number" placeholder={cfg.heightPh}
                            value={height} onChange={(e) => setHeight(e.target.value)}
                            min="1" max="20"
                        />
                    </div>
                )}
            </div>

            {allGrades ? (
                <>
                    {/* Grade tabs */}
                    <div className="flex rounded-md border overflow-hidden text-xs">
                        {GRADE_ORDER.map((g) => {
                            const r = allGrades[g];
                            return (
                                <button
                                    key={g}
                                    onClick={() => setGrade(g)}
                                    className={`flex-1 py-1.5 text-center transition-colors ${grade === g
                                        ? "bg-primary text-primary-foreground font-medium"
                                        : "hover:bg-muted text-muted-foreground"
                                        }`}
                                >
                                    <span className="block">{GRADE_LABEL[g]}</span>
                                    {r && (
                                        <span className="block font-semibold text-xs mt-0.5">
                                            {fmtINR(r.grandTotal)}
                                        </span>
                                    )}
                                </button>
                            );
                        })}
                    </div>

                    {/* Selected grade detail */}
                    {result && (
                        <div className="rounded-lg border bg-background p-3 space-y-2">
                            <div className="space-y-1">
                                {result.lines.slice(0, 4).map((l) => (
                                    <div key={l.name} className="flex justify-between text-xs">
                                        <span className="text-muted-foreground truncate mr-2">
                                            {l.name} × {l.qty} {l.unit}
                                        </span>
                                        <span className="shrink-0 font-medium">{fmtFull(l.total)}</span>
                                    </div>
                                ))}
                                {result.lines.length > 4 && (
                                    <p className="text-xs text-muted-foreground">
                                        + {result.lines.length - 4} more items
                                    </p>
                                )}
                            </div>
                            <div className="flex justify-between text-xs border-t pt-2">
                                <span className="text-muted-foreground">Labour</span>
                                <span>{fmtFull(result.labor)}</span>
                            </div>
                            <div className="flex justify-between text-sm font-semibold border-t pt-2">
                                <span>Total</span>
                                <span className="text-primary">{fmtINR(result.grandTotal)}</span>
                            </div>
                        </div>
                    )}
                </>
            ) : (
                <p className="text-xs text-muted-foreground text-center py-2">
                    Enter size above to see Budget / Medium / Premium costs
                </p>
            )}

            <a
                href={waUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex w-full items-center justify-center gap-2 rounded-lg bg-[#25D366] px-4 py-2.5 text-sm font-medium text-white hover:bg-[#22c55e] active:scale-[0.98] transition-all"
            >
                <MessageCircle className="h-4 w-4" />
                {result ? "Send estimate to WhatsApp" : "Ask on WhatsApp"}
            </a>
        </div>
    );
}
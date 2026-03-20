"use client";

/**
 * apps/web/components/marketing/quick-estimate-widget.tsx
 *
 * Compact sidebar estimator for design detail pages (/designs/[slug]).
 * - Light theme matching the existing site
 * - Width + Height inputs (not single size)
 * - Kitchen: separate lower + upper cabinet inputs
 * - All pricing logic from flat-rate-engine.ts
 */

import { useState, useMemo } from "react";
import { MessageCircle } from "lucide-react";
import { Input } from "@/components/ui/input";
import { siteConfig } from "@/lib/site-config";
import type { PriceBook } from "@/lib/estimator/priceBook";
import {
    getCategoryOrFallback,
    isKitchenCategory,
    calculateDimension,
    calculateKitchen,
    calculateAllDimensionTiers,
    calculateAllKitchenTiers,
    formatCompact,
    formatFull,
    buildWaUrl,
    buildFallbackWaUrl,
    type TierKey,
    type KitchenCategorySpec,
    type DimensionCategorySpec,
} from "@/lib/estimator/flat-rate-engine";

// ── Component ─────────────────────────────────────────────────────────────────

interface QuickEstimateWidgetProps {
    designTitle: string;
    categorySlug: string;
    priceBook?: PriceBook;
}

export function QuickEstimateWidget({
    designTitle,
    categorySlug,
}: QuickEstimateWidgetProps) {
    const cat = getCategoryOrFallback(categorySlug);
    const isKitchen = isKitchenCategory(cat);

    // Dimension state
    const [lowerRft, setLowerRft] = useState("");
    const [upperRft, setUpperRft] = useState("");
    const [width, setWidth] = useState("");
    const [height, setHeight] = useState("");
    const [activeTier, setActiveTier] = useState<TierKey>("STANDARD");

    const lower = parseFloat(lowerRft) || 0;
    const upper = parseFloat(upperRft) || 0;
    const w = parseFloat(width) || 0;
    const h = parseFloat(height) || 0;

    const hasAnyInput = isKitchen ? (lower > 0 || upper > 0) : (w > 0 && h > 0);

    // All tier results for tab labels
    const allResults = useMemo(() => {
        if (isKitchen) return calculateAllKitchenTiers(cat as KitchenCategorySpec, lower, upper);
        return calculateAllDimensionTiers(cat as DimensionCategorySpec, w, h);
    }, [cat, isKitchen, lower, upper, w, h]);

    const selectedTier = cat.tiers.find((t) => t.key === activeTier)!;
    const selectedResult = allResults[activeTier] ?? null;

    const waUrl = useMemo(() => {
        if (selectedResult) {
            return buildWaUrl(siteConfig.whatsapp, selectedResult, { designTitle });
        }
        return buildFallbackWaUrl(siteConfig.whatsapp, cat, designTitle);
    }, [selectedResult, cat, designTitle]);

    return (
        <div className="rounded-xl border bg-background overflow-hidden">

            {/* Header */}
            <div className="px-4 py-3 border-b bg-muted/30">
                <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Material estimate
                </p>
            </div>

            <div className="p-4 space-y-4">

                {/* Inputs */}
                {isKitchen ? (
                    /* Kitchen: two rft inputs */
                    <div className="space-y-3">
                        <div>
                            <label className="text-xs text-muted-foreground block mb-1">
                                Lower cabinets (base units)
                            </label>
                            <div className="relative">
                                <Input
                                    type="number"
                                    placeholder="e.g. 10"
                                    value={lowerRft}
                                    onChange={(e) => setLowerRft(e.target.value)}
                                    className="pr-10 h-8 text-sm"
                                    min="0" max="50"
                                />
                                <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground font-medium">
                                    rft
                                </span>
                            </div>
                        </div>
                        <div>
                            <label className="text-xs text-muted-foreground block mb-1">
                                Upper cabinets (wall units)
                            </label>
                            <div className="relative">
                                <Input
                                    type="number"
                                    placeholder="e.g. 8"
                                    value={upperRft}
                                    onChange={(e) => setUpperRft(e.target.value)}
                                    className="pr-10 h-8 text-sm"
                                    min="0" max="50"
                                />
                                <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground font-medium">
                                    rft
                                </span>
                            </div>
                        </div>
                    </div>
                ) : (
                    /* All others: width × height */
                    <div className="space-y-2">
                        <div className="grid grid-cols-2 gap-2">
                            <div>
                                <label className="text-xs text-muted-foreground block mb-1">
                                    {(cat as DimensionCategorySpec).widthLabel}
                                </label>
                                <div className="relative">
                                    <Input
                                        type="number"
                                        placeholder={(cat as DimensionCategorySpec).widthPlaceholder}
                                        value={width}
                                        onChange={(e) => setWidth(e.target.value)}
                                        className="pr-8 h-8 text-sm"
                                        min="1" max="100"
                                    />
                                    <span className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">
                                        ft
                                    </span>
                                </div>
                            </div>
                            <div>
                                <label className="text-xs text-muted-foreground block mb-1">
                                    {(cat as DimensionCategorySpec).heightLabel}
                                </label>
                                <div className="relative">
                                    <Input
                                        type="number"
                                        placeholder={(cat as DimensionCategorySpec).heightPlaceholder}
                                        value={height}
                                        onChange={(e) => setHeight(e.target.value)}
                                        className="pr-8 h-8 text-sm"
                                        min="1" max="20"
                                    />
                                    <span className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">
                                        ft
                                    </span>
                                </div>
                            </div>
                        </div>
                        {w > 0 && h > 0 && (
                            <p className="text-xs text-muted-foreground text-right">
                                = <span className="font-medium text-foreground">{w * h} sqft</span>
                            </p>
                        )}
                    </div>
                )}

                {/* Tier tabs */}
                <div className="flex rounded-lg border overflow-hidden text-xs">
                    {cat.tiers.map((tier) => {
                        const tierResult = allResults[tier.key];
                        const isActive = activeTier === tier.key;
                        return (
                            <button
                                key={tier.key}
                                onClick={() => setActiveTier(tier.key)}
                                className={`flex-1 py-2 px-1 text-center transition-colors border-r last:border-r-0 ${isActive
                                        ? "bg-primary text-primary-foreground font-medium"
                                        : "hover:bg-muted text-muted-foreground bg-background"
                                    }`}
                            >
                                <span className="block leading-tight">{tier.label}</span>
                                {tierResult ? (
                                    <span className="block font-semibold mt-0.5 leading-tight">
                                        {formatCompact(tierResult.total)}
                                    </span>
                                ) : (
                                    <span className="block opacity-30 mt-0.5">—</span>
                                )}
                            </button>
                        );
                    })}
                </div>

                {/* Selected tier detail */}
                {hasAnyInput && selectedResult ? (
                    <div className="rounded-lg border bg-muted/20 p-3 space-y-2">
                        {/* Total row */}
                        <div className="flex justify-between items-center">
                            <span className="text-xs text-muted-foreground">Estimated Cost</span>
                            <span className="text-base font-bold text-primary">
                                {formatCompact(selectedResult.total)}
                            </span>
                        </div>
                        
                        {selectedResult.kind === "kitchen" && (
                            <p className="text-[10px] text-muted-foreground tracking-tight">
                                Based on standard dimensions
                            </p>
                        )}

                        {/* Material summary */}
                        <p className="text-xs text-muted-foreground border-t pt-2">
                            {selectedTier.materials[0]}
                        </p>
                        <p className="text-[11px] text-muted-foreground/60">
                            Materials only · Labour billed separately
                        </p>
                    </div>
                ) : (
                    <div className="rounded-lg border bg-muted/10 px-3 py-3 text-center">
                        <p className="text-xs text-muted-foreground">
                            {isKitchen
                                ? "Enter lower and/or upper cabinet lengths above"
                                : "Enter width and height above to see estimates"}
                        </p>
                    </div>
                )}

                {/* WhatsApp CTA */}
                <a
                    href={waUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex w-full items-center justify-center gap-2 rounded-lg bg-[#25D366] px-4 py-2.5 text-sm font-semibold text-white hover:bg-[#22c55e] active:scale-[0.98] transition-all"
                >
                    <MessageCircle className="h-4 w-4" />
                    {hasAnyInput ? "Send estimate to WhatsApp" : "Ask price on WhatsApp"}
                </a>
            </div>

            <style>{`
        input[type=number]::-webkit-inner-spin-button,
        input[type=number]::-webkit-outer-spin-button { -webkit-appearance: none; margin: 0; }
        input[type=number] { -moz-appearance: textfield; }
      `}</style>
        </div>
    );
}
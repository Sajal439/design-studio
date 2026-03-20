"use client";

/**
 * apps/web/components/marketing/simple-estimator.tsx
 *
 * Full-page estimator for /estimator route.
 * - Light theme matching the existing site (bg-background, shadcn tokens)
 * - Width + Height inputs for all categories (not a single "size")
 * - Kitchen: separate lower cabinet + upper cabinet running-feet inputs
 * - All pricing logic from flat-rate-engine.ts — no hardcoded rates here
 */

import { useState, useEffect, useRef } from "react";
import { MessageCircle, Phone, Check, ChevronRight } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { siteConfig } from "@/lib/site-config";
import type { PriceBook } from "@/lib/estimator/priceBook";
import {
    CATEGORIES,
    isKitchenCategory,
    isKitchenInput,
    type CategorySpec,
    type KitchenCategorySpec,
    type DimensionCategorySpec,
    type TierKey,
    type KitchenTierSpec,
    type DimensionTierSpec,
    type KitchenEstimateResult,
    type DimensionEstimateResult,
    calculateDimension,
    calculateKitchen,
    calculateAllDimensionTiers,
    calculateAllKitchenTiers,
    formatCompact,
    formatFull,
    buildWaUrl,
    buildFallbackWaUrl,
} from "@/lib/estimator/flat-rate-engine";

// ── Dimension state helpers ───────────────────────────────────────────────────

interface KitchenDims { lowerRft: string; upperRft: string }
interface StdDims { width: string; height: string }

function emptyKitchen(): KitchenDims { return { lowerRft: "", upperRft: "" }; }
function emptyStd(): StdDims { return { width: "", height: "" }; }

// ── Tier badge colours (light-mode) ──────────────────────────────────────────

const TIER_ACCENT: Record<TierKey, { ring: string; badge: string; badgeText: string }> = {
    BUDGET: { ring: "ring-zinc-400", badge: "bg-zinc-100 text-zinc-600", badgeText: "" },
    STANDARD: { ring: "ring-amber-500", badge: "bg-amber-50 text-amber-700", badgeText: "" },
    PREMIUM: { ring: "ring-blue-500", badge: "bg-blue-50 text-blue-700", badgeText: "" },
};

// ── Tier card ─────────────────────────────────────────────────────────────────

function TierCard({
    tier,
    result,
    selected,
    onSelect,
    waUrl,
    visible,
    delay,
}: {
    tier: DimensionTierSpec | KitchenTierSpec;
    result: DimensionEstimateResult | KitchenEstimateResult | null;
    selected: boolean;
    onSelect: () => void;
    waUrl: string;
    visible: boolean;
    delay: number;
}) {
    const accent = TIER_ACCENT[tier.key];
    const hasResult = result !== null;
    const isKitchenResult = result?.kind === "kitchen";

    return (
        <div
            onClick={onSelect}
            className={`
        relative rounded-xl border bg-background cursor-pointer
        transition-all duration-200 flex flex-col overflow-hidden
        hover:shadow-md
        ${selected
                    ? `ring-2 ${accent.ring} shadow-sm`
                    : "hover:border-border/80"
                }
      `}
            style={{
                opacity: visible ? 1 : 0,
                transform: visible ? "translateY(0)" : "translateY(10px)",
                transition: `opacity 0.28s ease ${delay}ms, transform 0.28s ease ${delay}ms`,
            }}
        >
            {/* Selected check */}
            {selected && (
                <div className={`absolute top-3 right-3 h-5 w-5 rounded-full flex items-center justify-center
          ${tier.key === "BUDGET" ? "bg-zinc-500" : tier.key === "STANDARD" ? "bg-amber-500" : "bg-blue-500"}`}
                >
                    <Check size={11} color="white" strokeWidth={3} />
                </div>
            )}

            <div className="p-4 flex-1 space-y-3">
                {/* Header */}
                <div>
                    <div className="flex items-center gap-2 mb-0.5">
                        <p className="font-semibold text-base text-foreground">{tier.label}</p>
                        {tier.badge && (
                            <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${accent.badge}`}>
                                {tier.badge}
                            </span>
                        )}
                    </div>
                </div>

                {/* Total */}
                {hasResult ? (
                    <div className={`rounded-lg px-3 py-2.5 ${tier.key === "BUDGET" ? "bg-zinc-50 border border-zinc-200" :
                            tier.key === "STANDARD" ? "bg-amber-50 border border-amber-200" :
                                "bg-blue-50 border border-blue-200"
                        }`}>
                        <p className="text-xs text-muted-foreground mb-0.5">Estimated Cost</p>
                        <p className="text-2xl font-bold text-foreground leading-none">
                            {formatCompact(result!.total)}
                        </p>
                        {isKitchenResult && (
                            <p className="text-[10px] text-muted-foreground mt-1.5 opacity-80 tracking-tight">
                                Based on standard kitchen dimensions
                            </p>
                        )}
                    </div>
                ) : (
                    <div className="rounded-lg bg-muted/40 border border-border px-3 py-2.5 h-[60px] flex items-center">
                        <p className="text-xs text-muted-foreground">Enter dimensions to see total</p>
                    </div>
                )}

                {/* Materials */}
                <div className="space-y-1.5">
                    {tier.materials.map((m, i) => (
                        <div key={i} className="flex gap-2 items-start">
                            <div className={`w-1 h-1 rounded-full mt-2 shrink-0 ${tier.key === "BUDGET" ? "bg-zinc-400" :
                                    tier.key === "STANDARD" ? "bg-amber-500" : "bg-blue-500"
                                }`} />
                            <p className="text-xs text-muted-foreground leading-relaxed">{m}</p>
                        </div>
                    ))}
                </div>
            </div>

            {/* WA CTA — appears when selected + has result */}
            <div
                className="px-4 pb-4"
                style={{
                    opacity: selected && hasResult ? 1 : 0,
                    transform: selected && hasResult ? "translateY(0)" : "translateY(4px)",
                    transition: "opacity 0.2s ease, transform 0.2s ease",
                    pointerEvents: selected && hasResult ? "auto" : "none",
                    height: selected && hasResult ? "auto" : 0,
                    overflow: "hidden",
                }}
            >
                <a
                    href={waUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={(e) => e.stopPropagation()}
                    className="flex w-full items-center justify-center gap-2 rounded-lg bg-[#25D366] px-4 py-3 text-sm font-bold text-white hover:bg-[#22c55e] active:scale-[0.98] transition-all"
                >
                    <MessageCircle size={15} />
                    Send estimate to WhatsApp
                    <ChevronRight size={13} />
                </a>
            </div>
        </div>
    );
}

// ── Kitchen inputs ─────────────────────────────────────────────────────────────

function KitchenInputs({
    cat,
    dims,
    onChange,
}: {
    cat: KitchenCategorySpec;
    dims: KitchenDims;
    onChange: (d: KitchenDims) => void;
}) {
    return (
        <div className="space-y-4">
            {/* Lower input */}
            <div>
                <label className="text-sm font-medium text-foreground block mb-1.5">
                    {cat.lowerLabel}
                </label>
                <div className="relative">
                    <Input
                        type="number"
                        placeholder={cat.lowerPlaceholder}
                        value={dims.lowerRft}
                        onChange={(e) => onChange({ ...dims, lowerRft: e.target.value })}
                        className="pr-10"
                        min="0" max="50"
                    />
                    <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-xs font-medium text-muted-foreground">
                        rft
                    </span>
                </div>
                <p className="text-[11px] text-muted-foreground mt-1">{cat.lowerHint}</p>
            </div>

            {/* Upper input */}
            <div>
                <label className="text-sm font-medium text-foreground block mb-1.5">
                    {cat.upperLabel}
                </label>
                <div className="relative">
                    <Input
                        type="number"
                        placeholder={cat.upperPlaceholder}
                        value={dims.upperRft}
                        onChange={(e) => onChange({ ...dims, upperRft: e.target.value })}
                        className="pr-10"
                        min="0" max="50"
                    />
                    <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-xs font-medium text-muted-foreground">
                        rft
                    </span>
                </div>
                <p className="text-[11px] text-muted-foreground mt-1">{cat.upperHint}</p>
            </div>
        </div>
    );
}

// ── Standard dimension inputs ─────────────────────────────────────────────────

function DimensionInputs({
    cat,
    dims,
    onChange,
}: {
    cat: DimensionCategorySpec;
    dims: StdDims;
    onChange: (d: StdDims) => void;
}) {
    const sqft = (parseFloat(dims.width) || 0) * (parseFloat(dims.height) || 0);

    return (
        <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
                <div>
                    <label className="text-sm font-medium text-foreground block mb-1.5">
                        {cat.widthLabel}
                    </label>
                    <div className="relative">
                        <Input
                            type="number"
                            placeholder={cat.widthPlaceholder}
                            value={dims.width}
                            onChange={(e) => onChange({ ...dims, width: e.target.value })}
                            className="pr-8"
                            min="1" max="100"
                        />
                        <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-xs font-medium text-muted-foreground">
                            ft
                        </span>
                    </div>
                </div>
                <div>
                    <label className="text-sm font-medium text-foreground block mb-1.5">
                        {cat.heightLabel}
                    </label>
                    <div className="relative">
                        <Input
                            type="number"
                            placeholder={cat.heightPlaceholder}
                            value={dims.height}
                            onChange={(e) => onChange({ ...dims, height: e.target.value })}
                            className="pr-8"
                            min="1" max="20"
                        />
                        <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-xs font-medium text-muted-foreground">
                            ft
                        </span>
                    </div>
                </div>
            </div>

            {/* Sqft calc hint */}
            <div className="flex items-center justify-between text-xs text-muted-foreground px-1">
                <span>{cat.hint}</span>
                {sqft > 0 && (
                    <span className="font-semibold text-foreground tabular-nums">
                        = {sqft} sqft
                    </span>
                )}
            </div>
        </div>
    );
}

// ── Main component ────────────────────────────────────────────────────────────

export function SimpleEstimator({
    priceBook: _priceBook,
    defaultCategory = "kitchen",
}: {
    priceBook?: PriceBook;
    defaultCategory?: string;
}) {
    const initCat = CATEGORIES.find((c) => c.slug === defaultCategory) ?? CATEGORIES[0]!;
    const [activeCat, setActiveCat] = useState<CategorySpec>(initCat);
    const [kitchenDims, setKitchenDims] = useState<KitchenDims>(emptyKitchen());
    const [stdDims, setStdDims] = useState<StdDims>(emptyStd());
    const [selectedTier, setSelectedTier] = useState<TierKey>("STANDARD");
    const [cardsVisible, setCardsVisible] = useState(false);

    useEffect(() => {
        const t = setTimeout(() => setCardsVisible(true), 100);
        return () => clearTimeout(t);
    }, []);

    function switchCategory(cat: CategorySpec) {
        if (cat.slug === activeCat.slug) return;
        setCardsVisible(false);
        setKitchenDims(emptyKitchen());
        setStdDims(emptyStd());
        setActiveCat(cat);
        setTimeout(() => setCardsVisible(true), 80);
    }

    // Compute results for all tiers
    const isKitchen = isKitchenCategory(activeCat);

    const lowerRft = parseFloat(kitchenDims.lowerRft) || 0;
    const upperRft = parseFloat(kitchenDims.upperRft) || 0;
    const width = parseFloat(stdDims.width) || 0;
    const height = parseFloat(stdDims.height) || 0;

    const allResults = isKitchen
        ? calculateAllKitchenTiers(activeCat as KitchenCategorySpec, lowerRft, upperRft)
        : calculateAllDimensionTiers(activeCat as DimensionCategorySpec, width, height);

    const hasAnyResult = Object.values(allResults).some((r) => r !== null);

    return (
        <div className="space-y-6">

            {/* ── Category pills ── */}
            <div>
                <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground mb-3">
                    What are you building?
                </p>
                <div className="flex flex-wrap gap-2">
                    {CATEGORIES.map((c) => {
                        const isActive = activeCat.slug === c.slug;
                        return (
                            <button
                                key={c.slug}
                                onClick={() => switchCategory(c)}
                                className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-sm font-medium transition-colors ${isActive
                                        ? "border-primary bg-primary text-primary-foreground"
                                        : "border-border bg-background text-muted-foreground hover:border-primary/40 hover:text-foreground"
                                    }`}
                            >
                                <span>{c.icon}</span>
                                {c.label}
                            </button>
                        );
                    })}
                </div>
            </div>

            {/* ── Dimension inputs ── */}
            <div className="rounded-xl border bg-muted/10 p-5">
                <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground mb-4">
                    {isKitchen ? "Cabinet dimensions" : "Furniture dimensions"}
                </p>

                {isKitchen ? (
                    <KitchenInputs
                        cat={activeCat as KitchenCategorySpec}
                        dims={kitchenDims}
                        onChange={setKitchenDims}
                    />
                ) : (
                    <DimensionInputs
                        cat={activeCat as DimensionCategorySpec}
                        dims={stdDims}
                        onChange={setStdDims}
                    />
                )}
            </div>

            {/* ── Tier cards ── */}
            <div>
                <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground mb-3">
                    {hasAnyResult ? "Choose quality tier — tap to select" : "Quality tiers"}
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    {activeCat.tiers.map((tier, i) => {
                        const result = allResults[tier.key] ?? null;
                        const waUrl = result
                            ? buildWaUrl(siteConfig.whatsapp, result)
                            : buildFallbackWaUrl(siteConfig.whatsapp, activeCat);

                        return (
                            <TierCard
                                key={tier.key}
                                tier={tier}
                                result={result}
                                selected={selectedTier === tier.key}
                                onSelect={() => setSelectedTier(tier.key)}
                                waUrl={waUrl}
                                visible={cardsVisible}
                                delay={i * 60}
                            />
                        );
                    })}
                </div>
            </div>

            {/* ── Footer note ── */}
            <div className="rounded-xl border bg-muted/20 px-5 py-4 text-sm text-muted-foreground space-y-1.5">
                <p className="font-medium text-foreground">How this works</p>
                <p>
                    Estimates covers both material cost and labour.
                    Exact prices depend on current stock and are confirmed
                    by our team on WhatsApp.
                </p>
                <p className="flex items-center gap-2 mt-1">
                    <a
                        href={`tel:${siteConfig.phone}`}
                        className="inline-flex items-center gap-1.5 text-sm font-medium text-foreground hover:underline"
                    >
                        <Phone className="h-3.5 w-3.5" />
                        {siteConfig.phone}
                    </a>
                    <span className="text-border">·</span>
                    <span>Available Mon–Sat, 9am–7pm</span>
                </p>
            </div>

            <style>{`
        input[type=number]::-webkit-inner-spin-button,
        input[type=number]::-webkit-outer-spin-button { -webkit-appearance: none; margin: 0; }
        input[type=number] { -moz-appearance: textfield; }
      `}</style>
        </div>
    );
}
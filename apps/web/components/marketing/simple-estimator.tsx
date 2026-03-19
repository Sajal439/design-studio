"use client";

/**
 * apps/web/components/marketing/simple-estimator.tsx
 *
 * Client component — receives priceBook as a serialized prop from the
 * server page (which loads it via loadPriceBook()).
 *
 * User flow:
 *   1. Pick category (kitchen, wardrobe, etc.)
 *   2. Enter size (1–2 fields)
 *   3. See Budget / Medium / Premium tabs — switch instantly
 *   4. Each tab shows material list + quantities + prices + total
 *   5. WhatsApp button pre-fills the selected grade's full breakdown
 */

import { useState, useMemo } from "react";
import { MessageCircle, Phone } from "lucide-react";
import { Input } from "@/components/ui/input";
import { siteConfig } from "@/lib/site-config";
import type { PriceBook } from "@/lib/estimator/priceBook";
import { buildAllGrades, buildWaMessage, CategorySlug, EstimateInput, GradeKey } from "./estimator/estimator-engine";

// ─── Category metadata ────────────────────────────────────────────────────────

const CATEGORIES: {
    slug: CategorySlug;
    label: string;
    icon: string;
    widthLabel: string;
    widthPlaceholder: string;
    needsHeight: boolean;
    heightLabel: string;
    heightPlaceholder: string;
    note: string;
}[] = [
        {
            slug: "kitchen", label: "Kitchen", icon: "🍳",
            widthLabel: "Running length (ft)", widthPlaceholder: "e.g. 10",
            needsHeight: false, heightLabel: "", heightPlaceholder: "",
            note: "L-shape: add both wall lengths together",
        },
        {
            slug: "wardrobe", label: "Wardrobe", icon: "👔",
            widthLabel: "Width (ft)", widthPlaceholder: "e.g. 6",
            needsHeight: true, heightLabel: "Height (ft)", heightPlaceholder: "8",
            note: "Toggle below for sliding shutters",
        },
        {
            slug: "tv-unit", label: "TV unit", icon: "📺",
            widthLabel: "Width (ft)", widthPlaceholder: "e.g. 8",
            needsHeight: true, heightLabel: "Height (ft)", heightPlaceholder: "6",
            note: "Includes back panel + cabinets + shelves",
        },
        {
            slug: "bedroom", label: "Bedroom", icon: "🛏",
            widthLabel: "Room width (ft)", widthPlaceholder: "e.g. 12",
            needsHeight: true, heightLabel: "Ceiling height (ft)", heightPlaceholder: "10",
            note: "Wardrobe along one wall + bed head panel",
        },
        {
            slug: "study", label: "Study", icon: "📚",
            widthLabel: "Width (ft)", widthPlaceholder: "e.g. 5",
            needsHeight: true, heightLabel: "Height incl. shelf (ft)", heightPlaceholder: "5",
            note: "Includes drawers + bookshelf above",
        },
        {
            slug: "office", label: "Office", icon: "💼",
            widthLabel: "Room width (ft)", widthPlaceholder: "e.g. 14",
            needsHeight: true, heightLabel: "Ceiling height (ft)", heightPlaceholder: "9",
            note: "Workstations + storage cabinets",
        },
    ];

const GRADE_ORDER: GradeKey[] = ["BUDGET", "STANDARD", "PREMIUM"];

const GRADE_COLORS: Record<GradeKey, string> = {
    BUDGET: "border-gray-300 bg-gray-50 text-gray-800 dark:border-gray-600 dark:bg-gray-900 dark:text-gray-200",
    STANDARD: "border-blue-300 bg-blue-50 text-blue-900 dark:border-blue-700 dark:bg-blue-950 dark:text-blue-100",
    PREMIUM: "border-amber-300 bg-amber-50 text-amber-900 dark:border-amber-700 dark:bg-amber-950 dark:text-amber-100",
};

const GRADE_ACTIVE: Record<GradeKey, string> = {
    BUDGET: "bg-gray-700 text-white dark:bg-gray-300 dark:text-gray-900",
    STANDARD: "bg-blue-600 text-white",
    PREMIUM: "bg-amber-500 text-white",
};

const GRADE_INACTIVE = "bg-transparent text-muted-foreground hover:text-foreground";

// ─── Helpers ──────────────────────────────────────────────────────────────────

function fmtINR(n: number): string {
    if (n >= 100_000) return `₹${(n / 100_000).toFixed(1)}L`;
    return `₹${Math.round(n / 1_000)}K`;
}

function fmtFull(n: number): string {
    return `₹${n.toLocaleString("en-IN")}`;
}

// ─── Component ────────────────────────────────────────────────────────────────

export function SimpleEstimator({
    priceBook,
    defaultCategory = "kitchen",
}: {
    priceBook: PriceBook;
    defaultCategory?: CategorySlug;
}) {
    const [slug, setSlug] = useState<CategorySlug>(defaultCategory);
    const [width, setWidth] = useState("");
    const [height, setHeight] = useState("");
    const [sliding, setSliding] = useState(false);
    const [grade, setGrade] = useState<GradeKey>("STANDARD");

    const cat = CATEGORIES.find((c) => c.slug === slug)!;

    const input: EstimateInput = {
        category: slug,
        width: parseFloat(width) || 0,
        height: parseFloat(height) || 0,
        sliding,
    };

    const allGrades = useMemo(
        () => (input.width > 0 ? buildAllGrades(input, priceBook) : null),
        [slug, input.width, input.height, sliding, priceBook]
    );

    const result = allGrades?.[grade] ?? null;

    const waMsg = result
        ? buildWaMessage(input, result, cat.label)
        : `Hi! I want to know prices for ${cat.label.toLowerCase()} materials.`;

    const waUrl = `https://wa.me/91${siteConfig.whatsapp}?text=${encodeURIComponent(waMsg)}`;

    return (
        <div className="space-y-6">

            {/* ── Category tabs ── */}
            <div>
                <p className="mb-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">
                    What are you building?
                </p>
                <div className="flex flex-wrap gap-2">
                    {CATEGORIES.map((c) => (
                        <button
                            key={c.slug}
                            onClick={() => {
                                setSlug(c.slug);
                                setWidth("");
                                setHeight("");
                                setSliding(false);
                            }}
                            className={`flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-sm transition-colors ${slug === c.slug
                                    ? "border-primary bg-primary text-primary-foreground"
                                    : "border-border hover:border-primary/40"
                                }`}
                        >
                            <span style={{ fontSize: 14 }}>{c.icon}</span>
                            {c.label}
                        </button>
                    ))}
                </div>
            </div>

            {/* ── Size inputs ── */}
            <div className="rounded-xl border bg-muted/20 p-4 space-y-3">
                <div className="grid gap-3 sm:grid-cols-2">
                    <div>
                        <label className="block text-sm font-medium mb-1">
                            {cat.widthLabel}
                        </label>
                        <div className="relative">
                            <Input
                                type="number"
                                placeholder={cat.widthPlaceholder}
                                value={width}
                                onChange={(e) => setWidth(e.target.value)}
                                min="1"
                                max="100"
                                className="pr-8"
                            />
                            <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">
                                ft
                            </span>
                        </div>
                    </div>

                    {cat.needsHeight && (
                        <div>
                            <label className="block text-sm font-medium mb-1">
                                {cat.heightLabel}
                            </label>
                            <div className="relative">
                                <Input
                                    type="number"
                                    placeholder={cat.heightPlaceholder}
                                    value={height}
                                    onChange={(e) => setHeight(e.target.value)}
                                    min="1"
                                    max="20"
                                    className="pr-8"
                                />
                                <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">
                                    ft
                                </span>
                            </div>
                        </div>
                    )}
                </div>

                {slug === "wardrobe" && (
                    <label className="flex items-center gap-2 cursor-pointer text-sm">
                        <input
                            type="checkbox"
                            checked={sliding}
                            onChange={(e) => setSliding(e.target.checked)}
                            className="h-4 w-4 rounded border-input"
                        />
                        Sliding shutters instead of hinged
                    </label>
                )}

                {cat.note && (
                    <p className="text-xs text-muted-foreground">{cat.note}</p>
                )}
            </div>

            {/* ── Results ── */}
            {allGrades ? (
                <div className="space-y-4">

                    {/* Grade selector tabs */}
                    <div className="flex rounded-lg border overflow-hidden">
                        {GRADE_ORDER.map((g) => {
                            const r = allGrades[g];
                            return (
                                <button
                                    key={g}
                                    onClick={() => setGrade(g)}
                                    className={`flex-1 py-2.5 text-sm font-medium transition-colors ${grade === g ? GRADE_ACTIVE[g] : GRADE_INACTIVE
                                        }`}
                                >
                                    <span className="block text-xs opacity-80">
                                        {g === "BUDGET" ? "Budget" : g === "STANDARD" ? "Medium" : "Premium"}
                                    </span>
                                    {r ? (
                                        <span className="block font-semibold">
                                            {fmtINR(r.grandTotal)}
                                        </span>
                                    ) : (
                                        <span className="block text-xs opacity-50">—</span>
                                    )}
                                </button>
                            );
                        })}
                    </div>

                    {/* Detail card for selected grade */}
                    {result && (
                        <div className={`rounded-xl border-2 overflow-hidden ${GRADE_COLORS[grade]}`}>

                            {/* Header */}
                            <div className="px-4 py-3 border-b border-current border-opacity-20">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="font-semibold text-sm">{result.gradeLabel} grade</p>
                                        <p className="text-xs opacity-70 mt-0.5">{result.gradeDescription}</p>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-xl font-bold">{fmtINR(result.grandTotal)}</p>
                                        <p className="text-xs opacity-60">{result.basisNote}</p>
                                    </div>
                                </div>
                            </div>

                            {/* Material table */}
                            <div className="px-4 py-3 space-y-0">
                                <p className="text-xs font-medium uppercase tracking-wide opacity-60 mb-2">
                                    Materials
                                </p>
                                <div className="divide-y divide-current divide-opacity-10">
                                    {result.lines.map((l) => (
                                        <div key={l.name} className="flex justify-between py-2 text-sm">
                                            <div>
                                                <span className="font-medium">{l.name}</span>
                                                <span className="opacity-60 ml-1.5">
                                                    × {l.qty} {l.unit}
                                                </span>
                                            </div>
                                            <div className="text-right ml-4 shrink-0">
                                                <span className="opacity-50 text-xs">{fmtFull(l.unitPrice)}/{l.unit}</span>
                                                <span className="block font-medium">{fmtFull(l.total)}</span>
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                {/* Labour row */}
                                <div className="flex justify-between py-2 text-sm border-t border-current border-opacity-20 mt-1">
                                    <span className="opacity-70">
                                        Labour &amp; installation
                                        <span className="text-xs ml-1 opacity-50">
                                            ({Math.round(priceBook.rates.labor * 100)}% of material)
                                        </span>
                                    </span>
                                    <span className="font-medium">{fmtFull(result.labor)}</span>
                                </div>

                                {/* Total */}
                                <div className="flex justify-between py-2 font-semibold border-t-2 border-current border-opacity-20">
                                    <span>Total estimate</span>
                                    <span>{fmtINR(result.grandTotal)}</span>
                                </div>
                            </div>

                            {/* CTAs */}
                            <div className="px-4 pb-4 pt-1 space-y-2">
                                <a
                                    href={waUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex w-full items-center justify-center gap-2 rounded-lg bg-[#25D366] px-4 py-2.5 text-sm font-medium text-white hover:bg-[#22c55e] active:scale-[0.98] transition-all"
                                >
                                    <MessageCircle className="h-4 w-4" />
                                    Send this estimate to WhatsApp
                                </a>
                                <a
                                    href={`tel:${siteConfig.phone}`}
                                    className="flex w-full items-center justify-center gap-2 rounded-lg bg-white/50 dark:bg-black/20 px-4 py-2 text-sm font-medium hover:bg-white/70 transition-colors"
                                >
                                    <Phone className="h-4 w-4" />
                                    Call {siteConfig.phone}
                                </a>
                                <p className="text-center text-xs opacity-60">
                                    Prices updated by admin · Contact us for exact quote
                                </p>
                            </div>
                        </div>
                    )}
                </div>
            ) : (
                /* No size entered yet */
                <div className="rounded-xl border bg-muted/20 px-5 py-8 text-center space-y-3">
                    <p className="text-sm text-muted-foreground">
                        Enter your {cat.widthLabel.toLowerCase()} to see Budget, Medium
                        and Premium estimates side by side.
                    </p>
                    <a
                        href={waUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 rounded-lg bg-[#25D366] px-5 py-2.5 text-sm font-medium text-white hover:bg-[#22c55e] transition-colors"
                    >
                        <MessageCircle className="h-4 w-4" />
                        Ask on WhatsApp instead
                    </a>
                </div>
            )}
        </div>
    );
}
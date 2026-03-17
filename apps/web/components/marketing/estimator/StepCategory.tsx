"use client";

/**
 * apps/web/components/marketing/estimator/StepCategory.tsx
 */

import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { CategoryData } from "./useEstimatorState";

const CATEGORY_META: Record<string, {
    icon: string; eyebrow: string;
    accent: string; copy: string;
}> = {
    kitchen: { icon: "K", eyebrow: "Running length led", accent: "from-[rgba(194,123,56,0.18)] via-[rgba(255,248,238,0.92)] to-[rgba(255,255,255,0.98)]", copy: "Base cabinets, wall units, corners, and tall storage." },
    wardrobe: { icon: "W", eyebrow: "Section based", accent: "from-[rgba(36,79,60,0.18)] via-[rgba(247,252,249,0.94)] to-[rgba(255,255,255,0.98)]", copy: "Sliding, hinged, and walk-in layouts with hardware logic." },
    "tv-unit": { icon: "T", eyebrow: "Feature wall", accent: "from-[rgba(48,61,96,0.18)] via-[rgba(247,249,255,0.94)] to-[rgba(255,255,255,0.98)]", copy: "Back panels, floating cabinets, shelves, and lighting add-ons." },
    bedroom: { icon: "B", eyebrow: "Package estimate", accent: "from-[rgba(120,73,44,0.17)] via-[rgba(253,248,244,0.94)] to-[rgba(255,255,255,0.98)]", copy: "Bed, side tables, wardrobe, dresser, and loft storage in one flow." },
    study: { icon: "S", eyebrow: "Compact joinery", accent: "from-[rgba(82,79,39,0.18)] via-[rgba(252,251,243,0.94)] to-[rgba(255,255,255,0.98)]", copy: "Table tops, drawer pedestals, shelving, and cable management." },
    office: { icon: "O", eyebrow: "Commercial planning", accent: "from-[rgba(46,74,92,0.18)] via-[rgba(246,250,252,0.94)] to-[rgba(255,255,255,0.98)]", copy: "Workstations, storage, meeting tables, and partitions." },
};

function getCategoryMeta(slug?: string) {
    return CATEGORY_META[slug ?? ""] ?? {
        icon: "I", eyebrow: "Interior estimator",
        accent: "from-[rgba(0,0,0,0.08)] via-white to-white",
        copy: "Layout-driven material planning.",
    };
}

interface Props {
    categories: CategoryData[];
    selectedCategory: CategoryData | null;
    onSelect: (cat: CategoryData) => void;
}

export function StepCategory({ categories, selectedCategory, onSelect }: Props) {
    return (
        <div className="space-y-8">
            <div className="max-w-2xl space-y-2">
                <p className="text-sm font-semibold uppercase tracking-[0.18em] text-muted-foreground">Step 1</p>
                <h3 className="text-3xl font-semibold tracking-[-0.03em]">Choose what you are estimating.</h3>
                <p className="text-muted-foreground">
                    Each category carries its own module logic, layout defaults, and hardware assumptions.
                </p>
            </div>
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                {categories.map((cat) => {
                    const meta = getCategoryMeta(cat.slug);
                    const active = selectedCategory?.slug === cat.slug;
                    return (
                        <Card
                            key={cat.slug}
                            className={cn(
                                "cursor-pointer border-0 bg-[linear-gradient(135deg,var(--tw-gradient-stops))] ring-1 ring-foreground/10 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl",
                                meta.accent,
                                active && "ring-2 ring-primary shadow-xl",
                            )}
                            onClick={() => onSelect(cat)}
                        >
                            <CardContent className="space-y-5 p-6">
                                <div className="flex items-start justify-between gap-4">
                                    <div className="space-y-2">
                                        <Badge className="rounded-full bg-background/90 text-foreground hover:bg-background">
                                            {meta.eyebrow}
                                        </Badge>
                                        <div>
                                            <h4 className="text-xl font-semibold">{cat.label}</h4>
                                            <p className="mt-1 text-sm leading-6 text-muted-foreground">{meta.copy}</p>
                                        </div>
                                    </div>
                                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-foreground/10 bg-background/80 text-lg font-semibold shadow-sm">
                                        {meta.icon}
                                    </div>
                                </div>
                                <div className="flex items-center justify-between text-sm">
                                    <span className="text-muted-foreground">
                                        {cat.designs.length} {cat.designs.length === 1 ? "reference" : "references"}
                                    </span>
                                    <span className="font-medium">Start this estimate</span>
                                </div>
                            </CardContent>
                        </Card>
                    );
                })}
            </div>
        </div>
    );
}
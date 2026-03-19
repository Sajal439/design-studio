"use client";

import { useState } from "react";
import { MessageCircle, Calculator } from "lucide-react";
import { Input } from "@/components/ui/input";
import { siteConfig } from "@/lib/site-config";

const RATES: Record<string, { min: number; max: number }> = {
    kitchen: { min: 2500, max: 4000 },
    wardrobe: { min: 1400, max: 2200 },
    "tv-unit": { min: 900, max: 1600 },
    bedroom: { min: 1800, max: 3000 },
    study: { min: 700, max: 1200 },
    office: { min: 1500, max: 2500 },
};

function fmt(n: number): string {
    return n >= 100_000
        ? `₹${(n / 100_000).toFixed(1)}L`
        : `₹${Math.round(n / 1000)}K`;
}

interface Props {
    designTitle: string;
    categorySlug: string;
}

export function QuickEstimateCta({ designTitle, categorySlug }: Props) {
    const [width, setWidth] = useState("");
    const [height, setHeight] = useState("");

    const rate = RATES[categorySlug] ?? { min: 1500, max: 2500 };
    const area = parseFloat(width) * parseFloat(height);
    const hasResult = area > 0;
    const costMin = Math.round(area * rate.min);
    const costMax = Math.round(area * rate.max);

    const waText = hasResult
        ? `Hi! I'm interested in ${designTitle}.\nRoom size: ${width} × ${height} ft\nRough estimate: ${fmt(costMin)} – ${fmt(costMax)}\nCan you share the exact price?`
        : `Hi! I'm interested in ${designTitle}. Can you share the price?`;

    const waUrl = `https://wa.me/91${siteConfig.whatsapp}?text=${encodeURIComponent(waText)}`;

    return (
        <div className="rounded-xl border bg-muted/30 p-4 space-y-3">
            <p className="text-sm font-medium flex items-center gap-2">
                <Calculator className="h-4 w-4 text-primary" />
                Quick estimate
            </p>

            <div className="grid grid-cols-2 gap-2">
                <div>
                    <label className="text-xs text-muted-foreground mb-1 block">Width (ft)</label>
                    <Input
                        type="number"
                        placeholder="12"
                        value={width}
                        onChange={(e) => setWidth(e.target.value)}
                        min="1"
                        max="100"
                    />
                </div>
                <div>
                    <label className="text-xs text-muted-foreground mb-1 block">Height (ft)</label>
                    <Input
                        type="number"
                        placeholder="10"
                        value={height}
                        onChange={(e) => setHeight(e.target.value)}
                        min="1"
                        max="100"
                    />
                </div>
            </div>

            {hasResult && (
                <div className="rounded-lg bg-primary/5 border border-primary/20 px-3 py-2 text-center">
                    <p className="text-xs text-muted-foreground">Rough estimate</p>
                    <p className="text-lg font-semibold text-primary">
                        {fmt(costMin)} – {fmt(costMax)}
                    </p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                        Final price varies · contact us for exact quote
                    </p>
                </div>
            )}

            <a
                href={waUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex w-full items-center justify-center gap-2 rounded-lg bg-[#25D366] px-4 py-2.5 text-sm font-medium text-white hover:bg-[#22c55e] active:bg-[#16a34a] transition-colors"
            >
                <MessageCircle className="h-4 w-4" />
                {hasResult ? "Send estimate to WhatsApp" : "Ask on WhatsApp"}
            </a>
        </div>
    );
}
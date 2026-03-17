import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Calculator, ArrowLeft, Check } from "lucide-react";
import { RoomPreview } from "../room-preview";
import type { LayoutType } from "@/lib/estimator/types";
import type { CategoryData } from "./useEstimatorState";

interface DimensionsProps {
    selectedCategory: CategoryData | null;
    layout: LayoutType | "";
    grade: string;
    finishType: string;
    doorType: string;
    width: string;
    height: string;
    depth: string;
    onWidthChange: (v: string) => void;
    onHeightChange: (v: string) => void;
    onDepthChange: (v: string) => void;
    onCalculate: () => void;
    onBack: () => void;
    canCalculate: boolean;
}

const GRADE_LABELS: Record<string, string> = {
    BUDGET: "Budget", STANDARD: "Standard", PREMIUM: "Premium",
};
const FINISH_LABELS: Record<string, string> = {
    LAMINATE: "Laminate", VENEER: "Veneer", ACRYLIC: "Acrylic",
};

export function StepDimensions({
    selectedCategory, layout, grade, finishType, doorType,
    width, height, depth,
    onWidthChange, onHeightChange, onDepthChange,
    onCalculate, onBack, canCalculate,
}: DimensionsProps) {
    return (
        <div className="grid gap-6 xl:grid-cols-[0.95fr_1.05fr]">
            <div className="space-y-6">
                <div>
                    <p className="text-sm font-semibold uppercase tracking-[0.18em] text-muted-foreground">Step 4</p>
                    <h3 className="mt-2 text-3xl font-semibold tracking-[-0.03em]">Enter the real project dimensions.</h3>
                    <p className="mt-2 max-w-xl text-muted-foreground">
                        Width, depth, and height drive module counts, cut areas, and sheet planning.
                    </p>
                </div>

                <div className="rounded-[1.75rem] border border-foreground/10 bg-background p-5">
                    <div className="grid gap-4 md:grid-cols-2">
                        {[
                            { label: "Total width / length", value: width, onChange: onWidthChange, placeholder: "e.g. 12" },
                            { label: layout !== "STRAIGHT" && layout !== "HINGED" && layout !== "SLIDING" ? "Return wall / total depth" : "Depth", value: depth, onChange: onDepthChange, placeholder: "e.g. 2" },
                        ].map(({ label, value, onChange, placeholder }) => (
                            <div key={label} className="space-y-2">
                                <label className="text-sm font-semibold">{label}</label>
                                <div className="relative">
                                    <Input
                                        type="number" placeholder={placeholder} value={value}
                                        onChange={(e) => onChange(e.target.value)}
                                        className="h-12 rounded-2xl border-foreground/10 bg-muted/20 pr-12"
                                    />
                                    <span className="absolute right-4 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">ft</span>
                                </div>
                            </div>
                        ))}
                        <div className="space-y-2 md:col-span-2">
                            <label className="text-sm font-semibold">Height</label>
                            <div className="relative">
                                <Input
                                    type="number" value={height}
                                    onChange={(e) => onHeightChange(e.target.value)}
                                    className="h-12 rounded-2xl border-foreground/10 bg-muted/20 pr-12"
                                />
                                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">ft</span>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="rounded-[1.75rem] border border-foreground/10 bg-[linear-gradient(135deg,rgba(248,244,235,0.75),rgba(255,255,255,0.98))] p-5">
                    <p className="text-sm font-semibold uppercase tracking-[0.18em] text-muted-foreground">Quick checklist</p>
                    <div className="mt-4 grid gap-3">
                        {[
                            "Use finished site measurements, not brochure sizes.",
                            "For corner layouts, enter the return dimension in the depth field.",
                            "Wardrobes usually read best with full shutter height included.",
                        ].map((line) => (
                            <div key={line} className="flex items-start gap-3 rounded-2xl bg-background/80 px-4 py-3">
                                <div className="mt-0.5 flex h-6 w-6 items-center justify-center rounded-full bg-primary/10 text-primary">
                                    <Check className="h-3.5 w-3.5" />
                                </div>
                                <p className="text-sm leading-6 text-muted-foreground">{line}</p>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="flex gap-3">
                    <Button variant="outline" onClick={onBack} className="flex-1">
                        <ArrowLeft className="mr-2 h-4 w-4" /> Back
                    </Button>
                    <Button onClick={onCalculate} disabled={!canCalculate} className="flex-[1.2]">
                        <Calculator className="mr-2 h-4 w-4" /> Generate estimate
                    </Button>
                </div>
            </div>

            <div className="space-y-6">
                <div className="rounded-[1.75rem] border border-foreground/10 bg-background p-5">
                    <RoomPreview
                        dimensions={{
                            width: parseFloat(width) || 0,
                            height: parseFloat(height) || 0,
                            depth: parseFloat(depth) || 0,
                        }}
                        layout={layout as LayoutType}
                        categoryLabel={selectedCategory?.label ?? "Interior"}
                    />
                </div>
                <div className="grid gap-4 md:grid-cols-5">
                    {[
                        { label: "Category", value: selectedCategory?.label ?? "Pending" },
                        { label: "Layout", value: layout ? layout.replace(/_/g, " ").toLowerCase() : "Pending" },
                        { label: "Grade", value: GRADE_LABELS[grade] ?? grade },
                        { label: "Finish", value: FINISH_LABELS[finishType] ?? finishType },
                        { label: "Door", value: doorType.toLowerCase() },
                    ].map(({ label, value }) => (
                        <Card key={label} className="border border-foreground/10 bg-muted/20 py-0 shadow-none">
                            <CardContent className="p-5">
                                <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">{label}</p>
                                <p className="mt-2 font-semibold">{value}</p>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            </div>
        </div>
    );
}
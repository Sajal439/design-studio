"use client";

/**
 * apps/web/components/marketing/estimator-form.tsx
 *
 * Replaces the previous 600-line monolith.
 * All state lives in useEstimatorState(). Each step renders only the
 * component needed for that step — React never evaluates step 5 JSX
 * while the user is on step 1.
 *
 * Step 3 (Layout) is kept inline because it shares a lot of local
 * constants (GRADE_META, FINISH_META, layout options) that are only
 * used there. Steps 1, 2, 4, 5 are separate components.
 */

import dynamic from "next/dynamic";
import { useMemo } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { cn } from "@/lib/utils";
import type { PriceBook } from "@/lib/estimator/priceBook";
import type { LoadedTemplate } from "@/lib/estimator/templateLoader";
import type { DoorType, FinishType, LayoutType, MaterialGrade } from "@/lib/estimator/types";
import {
  ArrowLeft, ArrowRight, Calculator, Check, Compass,
  DoorOpen, DraftingCompass, Landmark, Layers3,
  PackageCheck, Palette, PencilRuler, Sparkles,
} from "lucide-react";
import { CategoryData, useEstimatorState } from "./useEstimatorState";
import { StepCategory } from "./StepCategory";
import { StepReference } from "./StepReference";
import { StepDimensions } from "./stepDimensions";

// ── Lazy-load the heavy result step — only needed on step 5 ───────────────────
const StepResult = dynamic(
  () => import("./StepResult").then((m) => ({ default: m.StepResult })),
  {
    loading: () => (
      <div className="animate-pulse space-y-4">
        <div className="h-64 rounded-[2rem] bg-muted" />
        <div className="h-32 rounded-xl bg-muted" />
        <div className="h-32 rounded-xl bg-muted" />
      </div>
    ),
  },
);

// ── Props ──────────────────────────────────────────────────────────────────────

interface EstimatorFormProps {
  categories: CategoryData[];
  moduleTemplates: Map<string, LoadedTemplate>;
  priceBook: PriceBook;
  productCatalog: {
    bySlug: Record<string, unknown>;
    mappings: { pattern: string; flags: string; productSlugs: string[]; reason: string }[];
  };
}

// ── Step metadata ──────────────────────────────────────────────────────────────

const STEP_META = [
  { id: 1, title: "Category", copy: "Choose the project type.", icon: Layers3 },
  { id: 2, title: "Reference", copy: "Pick a design direction.", icon: Sparkles },
  { id: 3, title: "Layout", copy: "Set geometry and grade.", icon: Compass },
  { id: 4, title: "Dimensions", copy: "Dial in the measurements.", icon: PencilRuler },
  { id: 5, title: "Estimate", copy: "Review BOM and pricing.", icon: PackageCheck },
];

// ── Layout options ─────────────────────────────────────────────────────────────

function getLayoutOptions(slug?: string): { value: LayoutType; label: string; note: string }[] {
  if (slug === "kitchen") {
    return [
      { value: "STRAIGHT", label: "Straight line", note: "Best for compact single-wall setups." },
      { value: "L_SHAPE", label: "L-shape", note: "Two working runs with a corner transition." },
      { value: "PARALLEL", label: "Parallel", note: "Facing counters for fast movement and prep." },
      { value: "U_SHAPE", label: "U-shape", note: "Maximum storage and work triangle efficiency." },
      { value: "ISLAND", label: "Island", note: "Adds a center prep module with extra storage." },
    ];
  }
  if (slug === "wardrobe") {
    return [
      { value: "HINGED", label: "Hinged", note: "Traditional shuttered wardrobe sections." },
      { value: "SLIDING", label: "Sliding", note: "Large front plane with track-based hardware." },
      { value: "WALK_IN", label: "Walk-in", note: "Open-format sections with hanging and shelving." },
    ];
  }
  return [
    { value: "STRAIGHT", label: "Straight", note: "Linear composition with standard access." },
    { value: "L_SHAPE", label: "Corner", note: "Wraps onto a second wall or return surface." },
  ];
}

function getDoorOptions(categorySlug?: string, layout?: LayoutType | ""): { value: DoorType; label: string; note: string }[] {
  if (categorySlug === "wardrobe") {
    if (layout === "SLIDING") return [{ value: "SLIDING", label: "Sliding", note: "Track-based shutters for wide wardrobes." }];
    if (layout === "WALK_IN") return [{ value: "OPEN", label: "Open", note: "Open-access shelving and hanging sections." }];
    return [{ value: "HINGED", label: "Hinged", note: "Traditional wardrobe shutters with hinges." }];
  }
  if (categorySlug === "kitchen") {
    return [
      { value: "HANDLELESS", label: "Handleless", note: "Minimal front elevation with profile grip logic." },
      { value: "HINGED", label: "Hinged", note: "Standard shuttered fronts with visible hardware." },
    ];
  }
  return [
    { value: "HINGED", label: "Hinged", note: "Closed modules with standard shutter access." },
    { value: "OPEN", label: "Open", note: "More shelf-led composition with fewer closed fronts." },
  ];
}

const GRADE_META: Record<MaterialGrade, { label: string; note: string; badge: string }> = {
  BUDGET: { label: "Budget", note: "Commercial ply and base hardware for value-first projects.", badge: "Efficient" },
  STANDARD: { label: "Standard", note: "Balanced BWR material mix with soft-close hardware.", badge: "Most chosen" },
  PREMIUM: { label: "Premium", note: "BWP/HDHMR style finish with higher-end fittings.", badge: "Upgrade" },
};

const FINISH_META: Record<FinishType, { label: string; note: string }> = {
  LAMINATE: { label: "Laminate", note: "Reliable everyday finish for most projects." },
  VENEER: { label: "Veneer", note: "Warmer premium surface with a natural wood feel." },
  ACRYLIC: { label: "Acrylic", note: "Higher gloss and sharper modern front faces." },
};

// ── Component ──────────────────────────────────────────────────────────────────

export function EstimatorForm(props: EstimatorFormProps) {
  const s = useEstimatorState(
    props.categories,
    props.moduleTemplates,
    props.priceBook,
    props.productCatalog,
  );

  const layoutOptions = useMemo(
    () => getLayoutOptions(s.selectedCategory?.slug),
    [s.selectedCategory?.slug],
  );
  const doorOptions = useMemo(
    () => getDoorOptions(s.selectedCategory?.slug, s.layout),
    [s.selectedCategory?.slug, s.layout],
  );

  const summaryChips = [
    s.selectedCategory ? s.selectedCategory.label : "Pick a category",
    s.selectedDesign ? s.selectedDesign.title : "Reference pending",
    s.layout ? s.layout.replace(/_/g, " ").toLowerCase() : "Layout pending",
    GRADE_META[s.grade].label,
    FINISH_META[s.finishType].label,
  ];

  return (
    <div className="space-y-8">
      <div className="overflow-hidden rounded-[2rem] border border-foreground/10 bg-background shadow-[0_22px_70px_rgba(15,23,42,0.06)]">

        {/* ── Progress header ─────────────────────────────────────────────── */}
        <div className="border-b border-foreground/10 bg-[linear-gradient(180deg,rgba(248,246,241,0.92),rgba(255,255,255,0.96))] px-5 py-5 md:px-8">
          <div className="flex flex-col gap-5">
            <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
              <div className="space-y-2">
                <Badge variant="outline" className="rounded-full px-3 py-1">Guided workflow</Badge>
                <div>
                  <h2 className="text-2xl font-semibold tracking-[-0.03em] md:text-3xl">
                    Build a cleaner estimate in five quick steps.
                  </h2>
                  <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground md:text-base">
                    Choose the interior type, match a reference, set the layout, enter
                    dimensions, and review a polished material and cost sheet.
                  </p>
                </div>
              </div>
              <div className="rounded-[1.5rem] border border-foreground/10 bg-white/80 p-4 text-sm shadow-sm backdrop-blur md:min-w-[280px]">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                    <DraftingCompass className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="font-semibold">
                      {s.selectedCategory?.label ?? "Interior estimator"}
                    </p>
                    <p className="text-muted-foreground text-xs">
                      {s.selectedCategory?.slug
                        ? getLayoutOptions(s.selectedCategory.slug).length + " layout options"
                        : "Layout-driven planning"}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Step pills */}
            <div className="grid gap-3 lg:grid-cols-[1.2fr_0.8fr]">
              <div className="grid gap-3 md:grid-cols-5">
                {STEP_META.map((item) => {
                  const Icon = item.icon;
                  const current = s.step === item.id;
                  const complete = s.step > item.id;
                  return (
                    <div
                      key={item.id}
                      className={cn(
                        "rounded-[1.25rem] border px-4 py-4 transition-all",
                        complete && "border-primary/30 bg-primary/5",
                        current && "border-foreground/15 bg-foreground text-background shadow-lg",
                        !complete && !current && "border-foreground/10 bg-background/70",
                      )}
                    >
                      <div className="mb-3 flex items-center justify-between">
                        <div className={cn("flex h-9 w-9 items-center justify-center rounded-xl", current ? "bg-background/10 text-background" : "bg-primary/10 text-primary")}>
                          {complete ? <Check className="h-4 w-4" /> : <Icon className="h-4 w-4" />}
                        </div>
                        <span className={cn("text-xs font-medium", current ? "text-background/75" : "text-muted-foreground")}>
                          0{item.id}
                        </span>
                      </div>
                      <p className="font-semibold">{item.title}</p>
                      <p className={cn("mt-1 text-xs leading-5", current ? "text-background/75" : "text-muted-foreground")}>
                        {item.copy}
                      </p>
                    </div>
                  );
                })}
              </div>

              {/* Current setup chips */}
              <div className="rounded-[1.5rem] border border-foreground/10 bg-background/80 p-4">
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">Current setup</p>
                <div className="mt-3 flex flex-wrap gap-2">
                  {summaryChips.map((chip) => (
                    <span key={chip} className="rounded-full border border-foreground/10 bg-muted/40 px-3 py-1.5 text-xs text-foreground/80">
                      {chip}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ── Step content ────────────────────────────────────────────────── */}
        <div className="px-5 py-6 md:px-8 md:py-8">

          {s.step === 1 && (
            <StepCategory
              categories={s.categories}
              selectedCategory={s.selectedCategory}
              onSelect={s.handleCategorySelect}
            />
          )}

          {s.step === 2 && s.selectedCategory && (
            <StepReference
              selectedCategory={s.selectedCategory}
              onSelect={s.handleDesignSelect}
              onBack={() => s.setStep(1)}
            />
          )}

          {/* Step 3 — layout, grade, finish, door (kept inline — lots of local data) */}
          {s.step === 3 && (
            <div className="grid gap-6 xl:grid-cols-[1.05fr_0.95fr]">
              {/* Layout selector */}
              <div className="space-y-6">
                <div>
                  <p className="text-sm font-semibold uppercase tracking-[0.18em] text-muted-foreground">Step 3</p>
                  <h3 className="mt-2 text-3xl font-semibold tracking-[-0.03em]">Define layout and material mood.</h3>
                </div>
                <div className="rounded-[1.75rem] border border-foreground/10 bg-background p-5">
                  <div className="mb-4 flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                      <Landmark className="h-4 w-4" />
                    </div>
                    <div>
                      <p className="font-semibold">Layout shape</p>
                      <p className="text-sm text-muted-foreground">Choose the room-side arrangement first.</p>
                    </div>
                  </div>
                  <Select value={s.layout} onValueChange={s.handleLayoutChange}>
                    <SelectTrigger className="h-12 rounded-2xl border-foreground/10 bg-muted/20">
                      <SelectValue placeholder="Select the layout type" />
                    </SelectTrigger>
                    <SelectContent>
                      {layoutOptions.map((opt) => (
                        <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <div className="mt-4 grid gap-3">
                    {layoutOptions.map((opt) => (
                      <div
                        key={opt.value}
                        className={cn(
                          "rounded-2xl border px-4 py-3 transition-all",
                          s.layout === opt.value ? "border-primary/40 bg-primary/5" : "border-foreground/10 bg-background",
                        )}
                      >
                        <div className="flex items-center justify-between gap-3">
                          <p className="font-medium">{opt.label}</p>
                          {s.layout === opt.value && <Check className="h-4 w-4 text-primary" />}
                        </div>
                        <p className="mt-1 text-sm text-muted-foreground">{opt.note}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Grade + finish + door */}
              <div className="space-y-6">
                {/* Grade */}
                <div className="rounded-[1.75rem] border border-foreground/10 bg-[linear-gradient(135deg,rgba(248,244,235,0.9),rgba(255,255,255,0.98))] p-5">
                  <div className="mb-4 flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-foreground text-background">
                      <Palette className="h-4 w-4" />
                    </div>
                    <div>
                      <p className="font-semibold">Material grade</p>
                      <p className="text-sm text-muted-foreground">Match the estimate to the project quality level.</p>
                    </div>
                  </div>
                  <Select value={s.grade} onValueChange={(v) => s.setGrade(v as MaterialGrade)}>
                    <SelectTrigger className="h-12 rounded-2xl border-foreground/10 bg-background/80">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.entries(GRADE_META).map(([v, m]) => (
                        <SelectItem key={v} value={v}>{m.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <div className="mt-4 grid gap-3">
                    {Object.entries(GRADE_META).map(([v, m]) => (
                      <div
                        key={v}
                        className={cn(
                          "rounded-2xl border px-4 py-3 transition-all",
                          s.grade === v ? "border-foreground/15 bg-foreground text-background" : "border-foreground/10 bg-background/80",
                        )}
                      >
                        <div className="flex items-center justify-between gap-3">
                          <p className="font-medium">{m.label}</p>
                          <Badge className={cn("rounded-full", s.grade === v ? "bg-background/10 text-background hover:bg-background/10" : "bg-primary/10 text-primary hover:bg-primary/10")}>
                            {m.badge}
                          </Badge>
                        </div>
                        <p className={cn("mt-1 text-sm", s.grade === v ? "text-background/75" : "text-muted-foreground")}>
                          {m.note}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Finish + door */}
                <div className="rounded-[1.75rem] border border-foreground/10 bg-background p-5">
                  <div className="mb-4 flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                      <DoorOpen className="h-4 w-4" />
                    </div>
                    <div>
                      <p className="font-semibold">Finish and door system</p>
                    </div>
                  </div>
                  <div className="grid gap-4">
                    <div className="space-y-2">
                      <label className="text-sm font-semibold">Finish type</label>
                      <Select value={s.finishType} onValueChange={(v) => s.setFinishType(v as FinishType)}>
                        <SelectTrigger className="h-12 rounded-2xl border-foreground/10 bg-muted/20"><SelectValue /></SelectTrigger>
                        <SelectContent>
                          {Object.entries(FINISH_META).map(([v, m]) => (
                            <SelectItem key={v} value={v}>{m.label}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <p className="text-sm text-muted-foreground">{FINISH_META[s.finishType].note}</p>
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-semibold">Door type</label>
                      <Select value={s.doorType} onValueChange={(v) => s.setDoorType(v as DoorType)}>
                        <SelectTrigger className="h-12 rounded-2xl border-foreground/10 bg-muted/20"><SelectValue /></SelectTrigger>
                        <SelectContent>
                          {doorOptions.map((opt) => (
                            <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <p className="text-sm text-muted-foreground">
                        {doorOptions.find((o) => o.value === s.doorType)?.note ?? ""}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="flex gap-3">
                  <Button variant="outline" onClick={() => s.setStep(2)} className="flex-1">
                    <ArrowLeft className="mr-2 h-4 w-4" /> Back
                  </Button>
                  <Button onClick={() => s.setStep(4)} disabled={!s.layout} className="flex-1">
                    Continue <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          )}

          {s.step === 4 && (
            <StepDimensions
              selectedCategory={s.selectedCategory}
              layout={s.layout}
              grade={s.grade}
              finishType={s.finishType}
              doorType={s.doorType}
              width={s.width}
              height={s.height}
              depth={s.depth}
              onWidthChange={s.setWidth}
              onHeightChange={s.setHeight}
              onDepthChange={s.setDepth}
              onCalculate={s.handleCalculate}
              onBack={() => s.setStep(3)}
              canCalculate={s.canCalculate}
            />
          )}

          {s.step === 5 && s.result && (
            <StepResult
              result={s.result}
              onReset={s.handleReset}
              onEditDimensions={() => s.setStep(4)}
            />
          )}
        </div>
      </div>
    </div>
  );
}
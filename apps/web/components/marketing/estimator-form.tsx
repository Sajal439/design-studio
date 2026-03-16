"use client";

import { useMemo, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { generateEstimate } from "@/lib/estimator/calculator";
import { CategorySlug, DoorType, FinishType, LayoutType, MaterialGrade, MaterialScaling, EstimationResult } from "@/lib/estimator/types";
import { EstimateResultDisplay } from "./estimate-result";
import { EstimateSaveForm } from "./estimate-save-form";
import { RoomPreview } from "./room-preview";
import { LoadedTemplate } from "@/lib/estimator/templateLoader";
import {
  ArrowLeft,
  ArrowRight,
  Calculator,
  Check,
  Compass,
  DraftingCompass,
  DoorOpen,
  Landmark,
  Layers3,
  PackageCheck,
  Palette,
  PencilRuler,
  Sparkles,
} from "lucide-react";

export interface DesignInput {
  id: string;
  title: string;
  slug: string;
  roomSize: string;
  style: string;
  estimatedCost: string;
  materials: {
    material: {
      name: string;
      baseQty: number;
      unit: string;
      scaling: unknown;
    };
  }[];
}

interface CategoryData {
  id: string;
  slug: string;
  label: string;
  designs: DesignInput[];
}

const CATEGORY_META: Record<string, { icon: string; eyebrow: string; accent: string; copy: string }> = {
  kitchen: {
    icon: "K",
    eyebrow: "Running length led",
    accent: "from-[rgba(194,123,56,0.18)] via-[rgba(255,248,238,0.92)] to-[rgba(255,255,255,0.98)]",
    copy: "Base cabinets, wall units, corners, and tall storage.",
  },
  wardrobe: {
    icon: "W",
    eyebrow: "Section based",
    accent: "from-[rgba(36,79,60,0.18)] via-[rgba(247,252,249,0.94)] to-[rgba(255,255,255,0.98)]",
    copy: "Sliding, hinged, and walk-in layouts with hardware logic.",
  },
  "tv-unit": {
    icon: "T",
    eyebrow: "Feature wall",
    accent: "from-[rgba(48,61,96,0.18)] via-[rgba(247,249,255,0.94)] to-[rgba(255,255,255,0.98)]",
    copy: "Back panels, floating cabinets, shelves, and lighting add-ons.",
  },
  bedroom: {
    icon: "B",
    eyebrow: "Package estimate",
    accent: "from-[rgba(120,73,44,0.17)] via-[rgba(253,248,244,0.94)] to-[rgba(255,255,255,0.98)]",
    copy: "Bed, side tables, wardrobe, dresser, and loft storage in one flow.",
  },
  study: {
    icon: "S",
    eyebrow: "Compact joinery",
    accent: "from-[rgba(82,79,39,0.18)] via-[rgba(252,251,243,0.94)] to-[rgba(255,255,255,0.98)]",
    copy: "Table tops, drawer pedestals, shelving, and cable management.",
  },
  office: {
    icon: "O",
    eyebrow: "Commercial planning",
    accent: "from-[rgba(46,74,92,0.18)] via-[rgba(246,250,252,0.94)] to-[rgba(255,255,255,0.98)]",
    copy: "Workstations, storage, meeting tables, and partitions.",
  },
};

const STEP_META = [
  { id: 1, title: "Category", copy: "Choose the project type.", icon: Layers3 },
  { id: 2, title: "Reference", copy: "Pick a design direction.", icon: Sparkles },
  { id: 3, title: "Layout", copy: "Set geometry and grade.", icon: Compass },
  { id: 4, title: "Dimensions", copy: "Dial in the measurements.", icon: PencilRuler },
  { id: 5, title: "Estimate", copy: "Review BOM and pricing.", icon: PackageCheck },
];

const GRADE_META: Record<MaterialGrade, { label: string; note: string; badge: string }> = {
  BUDGET: {
    label: "Budget",
    note: "Commercial ply and base hardware for value-first projects.",
    badge: "Efficient",
  },
  STANDARD: {
    label: "Standard",
    note: "Balanced BWR material mix with soft-close hardware.",
    badge: "Most chosen",
  },
  PREMIUM: {
    label: "Premium",
    note: "BWP/HDHMR style finish with higher-end fittings and detailing.",
    badge: "Upgrade",
  },
};

const FINISH_META: Record<FinishType, { label: string; note: string }> = {
  LAMINATE: { label: "Laminate", note: "Reliable everyday finish for most projects." },
  VENEER: { label: "Veneer", note: "Warmer premium surface with a natural wood feel." },
  ACRYLIC: { label: "Acrylic", note: "Higher gloss and sharper modern front faces." },
};

function getCategoryMeta(slug?: string) {
  return (
    CATEGORY_META[slug ?? ""] ?? {
      icon: "I",
      eyebrow: "Interior estimator",
      accent: "from-[rgba(0,0,0,0.08)] via-white to-white",
      copy: "Layout-driven material planning for interior work.",
    }
  );
}

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

function formatLayoutLabel(layout: string) {
  return layout.replace(/_/g, " ").toLowerCase();
}

function getDoorOptions(categorySlug?: string, layout?: LayoutType | ""): { value: DoorType; label: string; note: string }[] {
  if (categorySlug === "wardrobe") {
    if (layout === "SLIDING") {
      return [{ value: "SLIDING", label: "Sliding", note: "Track-based shutters for wide wardrobes." }];
    }

    if (layout === "WALK_IN") {
      return [{ value: "OPEN", label: "Open", note: "Open-access shelving and hanging sections." }];
    }

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

export function EstimatorForm({
  categories,
  moduleTemplates,
}: {
  categories: CategoryData[];
  moduleTemplates: Map<string, LoadedTemplate>;
}) {
  const [step, setStep] = useState(1);
  const [selectedCategory, setSelectedCategory] = useState<CategoryData | null>(null);
  const [selectedDesign, setSelectedDesign] = useState<DesignInput | null>(null);
  const [layout, setLayout] = useState<LayoutType | "">("");
  const [grade, setGrade] = useState<MaterialGrade>("STANDARD");
  const [finishType, setFinishType] = useState<FinishType>("LAMINATE");
  const [doorType, setDoorType] = useState<DoorType>("HINGED");
  const [width, setWidth] = useState("");
  const [height, setHeight] = useState("10");
  const [depth, setDepth] = useState("");
  const [result, setResult] = useState<EstimationResult | null>(null);

  const selectedMeta = getCategoryMeta(selectedCategory?.slug);
  const layoutOptions = useMemo(() => getLayoutOptions(selectedCategory?.slug), [selectedCategory?.slug]);
  const doorOptions = useMemo(() => getDoorOptions(selectedCategory?.slug, layout), [selectedCategory?.slug, layout]);
  const totalSteps = STEP_META.length;

  function handleCategorySelect(cat: CategoryData) {
    setSelectedCategory(cat);
    setSelectedDesign(null);
    setLayout("");
    setResult(null);
    setWidth("");
    setFinishType("LAMINATE");
    if (cat.slug === "kitchen") {
      setDepth("2");
      setHeight("8");
      setDoorType("HANDLELESS");
    } else if (cat.slug === "wardrobe") {
      setDepth("2");
      setHeight("10");
      setDoorType("HINGED");
    } else {
      setDepth("1.5");
      setHeight("8");
      setDoorType("HINGED");
    }
    setStep(2);
  }

  function handleDesignSelect(design: DesignInput) {
    setSelectedDesign(design);
    setStep(3);
  }

  function handleLayoutChange(value: LayoutType) {
    setLayout(value);

    if (selectedCategory?.slug === "wardrobe") {
      if (value === "SLIDING") {
        setDoorType("SLIDING");
      } else if (value === "WALK_IN") {
        setDoorType("OPEN");
      } else {
        setDoorType("HINGED");
      }
    }
  }

  function handleCalculate() {
    if (!selectedCategory || !selectedDesign || !width || !height || !depth || !layout || !grade) return;

    const rawMaterialsList = selectedDesign.materials.map((m) => ({
      name: m.material.name,
      baseQty: m.material.baseQty,
      unit: m.material.unit,
      scaling: ((m.material.scaling as MaterialScaling) || "AREA") as MaterialScaling,
    }));

    setResult(
      generateEstimate({
        categoryId: selectedCategory.id,
        categorySlug: selectedCategory.slug as CategorySlug,
        categoryLabel: selectedCategory.label,
        designId: selectedDesign.id,
        designTitle: selectedDesign.title,
        layout: layout as LayoutType,
        grade,
        finishType,
        doorType,
        dimensions: {
          width: parseFloat(width),
          height: parseFloat(height),
          depth: parseFloat(depth),
        },
        baseMaterialsList: rawMaterialsList,
      }, moduleTemplates)
    );
    setStep(totalSteps);
  }

  function handleReset() {
    setStep(1);
    setSelectedCategory(null);
    setSelectedDesign(null);
    setWidth("");
    setHeight("10");
    setDepth("");
    setLayout("");
    setGrade("STANDARD");
    setFinishType("LAMINATE");
    setDoorType("HINGED");
    setResult(null);
  }

  const summaryChips = [
    selectedCategory ? selectedCategory.label : "Pick a category",
    selectedDesign ? selectedDesign.title : "Reference design pending",
    layout ? formatLayoutLabel(layout) : "Layout pending",
    GRADE_META[grade].label,
    FINISH_META[finishType].label,
  ];

  return (
    <div className="space-y-8">
      <div className="overflow-hidden rounded-[2rem] border border-foreground/10 bg-background shadow-[0_22px_70px_rgba(15,23,42,0.06)]">
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
                    Choose the interior type, match a reference, set the layout, enter dimensions,
                    and review a polished material and cost sheet.
                  </p>
                </div>
              </div>
              <div className="rounded-[1.5rem] border border-foreground/10 bg-white/80 p-4 text-sm shadow-sm backdrop-blur md:min-w-[280px]">
                <div className="flex items-center gap-3">
                  <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                    <DraftingCompass className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="font-semibold">{selectedMeta.eyebrow}</p>
                    <p className="text-muted-foreground">{selectedMeta.copy}</p>
                  </div>
                </div>
              </div>
            </div>
            <div className="grid gap-3 lg:grid-cols-[1.2fr_0.8fr]">
              <div className="grid gap-3 md:grid-cols-5">
                {STEP_META.map((item) => {
                  const Icon = item.icon;
                  const current = step === item.id;
                  const complete = step > item.id;
                  return (
                    <div
                      key={item.id}
                      className={cn(
                        "rounded-[1.25rem] border px-4 py-4 transition-all",
                        complete && "border-primary/30 bg-primary/5",
                        current && "border-foreground/15 bg-foreground text-background shadow-lg",
                        !complete && !current && "border-foreground/10 bg-background/70"
                      )}
                    >
                      <div className="mb-3 flex items-center justify-between">
                        <div className={cn("flex h-9 w-9 items-center justify-center rounded-xl", current ? "bg-background/10 text-background" : "bg-primary/10 text-primary")}>
                          {complete ? <Check className="h-4 w-4" /> : <Icon className="h-4 w-4" />}
                        </div>
                        <span className={cn("text-xs font-medium", current ? "text-background/75" : "text-muted-foreground")}>0{item.id}</span>
                      </div>
                      <p className="font-semibold">{item.title}</p>
                      <p className={cn("mt-1 text-xs leading-5", current ? "text-background/75" : "text-muted-foreground")}>{item.copy}</p>
                    </div>
                  );
                })}
              </div>
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

        <div className="px-5 py-6 md:px-8 md:py-8">
          {step === 1 && (
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
                        active && "ring-2 ring-primary shadow-xl"
                      )}
                      onClick={() => handleCategorySelect(cat)}
                    >
                      <CardContent className="space-y-5 p-6">
                        <div className="flex items-start justify-between gap-4">
                          <div className="space-y-2">
                            <Badge className="rounded-full bg-background/90 text-foreground hover:bg-background">{meta.eyebrow}</Badge>
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
          )}

          {step === 2 && selectedCategory && (
            <div className="grid gap-6 xl:grid-cols-[0.9fr_1.1fr]">
              <div className="rounded-[1.75rem] border border-foreground/10 bg-[linear-gradient(135deg,rgba(255,251,245,0.95),rgba(255,255,255,0.96))] p-6">
                <Badge className="rounded-full bg-foreground text-background hover:bg-foreground">Selected category</Badge>
                <h3 className="mt-4 text-3xl font-semibold tracking-[-0.03em]">{selectedCategory.label}</h3>
                <p className="mt-3 max-w-md text-sm leading-6 text-muted-foreground">{selectedMeta.copy}</p>
                <div className="mt-6 space-y-3">
                  {[
                    "Reference designs help tune finish and accessory assumptions.",
                    "You can still edit layout and dimensions in the next steps.",
                    "The final estimate will show the BOM, price range, and planning summary.",
                  ].map((line) => (
                    <div key={line} className="flex items-start gap-3 rounded-2xl border border-foreground/10 bg-background/75 p-3">
                      <div className="mt-0.5 flex h-6 w-6 items-center justify-center rounded-full bg-primary/10 text-primary">
                        <Check className="h-3.5 w-3.5" />
                      </div>
                      <p className="text-sm leading-6 text-muted-foreground">{line}</p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <p className="text-sm font-semibold uppercase tracking-[0.18em] text-muted-foreground">Step 2</p>
                  <h3 className="mt-2 text-3xl font-semibold tracking-[-0.03em]">Pick the closest design reference.</h3>
                </div>
                <div className="grid gap-4">
                  {selectedCategory.designs.map((design) => (
                    <Card
                      key={design.slug}
                      className="cursor-pointer border border-foreground/10 bg-background transition-all hover:-translate-y-0.5 hover:shadow-lg"
                      onClick={() => handleDesignSelect(design)}
                    >
                      <CardContent className="flex flex-col gap-5 p-5 md:flex-row md:items-center md:justify-between">
                        <div className="space-y-2">
                          <div className="flex flex-wrap gap-2">
                            <Badge variant="outline" className="rounded-full">{design.style}</Badge>
                            <Badge variant="secondary" className="rounded-full">{design.roomSize}</Badge>
                          </div>
                          <div>
                            <p className="text-lg font-semibold">{design.title}</p>
                            <p className="mt-1 text-sm text-muted-foreground">Typical budget: {design.estimatedCost}</p>
                          </div>
                        </div>
                        <Button variant="outline" className="rounded-full px-4">
                          Use this reference <ArrowRight className="ml-2 h-4 w-4" />
                        </Button>
                      </CardContent>
                    </Card>
                  ))}
                </div>
                <Button variant="ghost" onClick={() => setStep(1)} className="w-full justify-start">
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Back to categories
                </Button>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="grid gap-6 xl:grid-cols-[1.05fr_0.95fr]">
              <div className="space-y-6">
                <div>
                  <p className="text-sm font-semibold uppercase tracking-[0.18em] text-muted-foreground">Step 3</p>
                  <h3 className="mt-2 text-3xl font-semibold tracking-[-0.03em]">Define layout and material mood.</h3>
                  <p className="mt-2 max-w-xl text-muted-foreground">
                    This step changes how the engine counts modules, corners, shutters, and hardware.
                  </p>
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
                  <Select value={layout} onValueChange={handleLayoutChange}>
                    <SelectTrigger className="h-12 rounded-2xl border-foreground/10 bg-muted/20">
                      <SelectValue placeholder="Select the layout type" />
                    </SelectTrigger>
                    <SelectContent>
                      {layoutOptions.map((option) => (
                        <SelectItem key={option.value} value={option.value}>{option.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <div className="mt-4 grid gap-3">
                    {layoutOptions.map((option) => (
                      <div
                        key={option.value}
                        className={cn(
                          "rounded-2xl border px-4 py-3 transition-all",
                          layout === option.value ? "border-primary/40 bg-primary/5" : "border-foreground/10 bg-background"
                        )}
                      >
                        <div className="flex items-center justify-between gap-3">
                          <p className="font-medium">{option.label}</p>
                          {layout === option.value ? <Check className="h-4 w-4 text-primary" /> : null}
                        </div>
                        <p className="mt-1 text-sm text-muted-foreground">{option.note}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="space-y-6">
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
                  <Select value={grade} onValueChange={(value: MaterialGrade) => setGrade(value)}>
                    <SelectTrigger className="h-12 rounded-2xl border-foreground/10 bg-background/80">
                      <SelectValue placeholder="Select quality grade" />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.entries(GRADE_META).map(([value, meta]) => (
                        <SelectItem key={value} value={value}>{meta.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <div className="mt-4 grid gap-3">
                    {Object.entries(GRADE_META).map(([value, meta]) => (
                      <div
                        key={value}
                        className={cn(
                          "rounded-2xl border px-4 py-3 transition-all",
                          grade === value ? "border-foreground/15 bg-foreground text-background" : "border-foreground/10 bg-background/80"
                        )}
                      >
                        <div className="flex items-center justify-between gap-3">
                          <p className="font-medium">{meta.label}</p>
                          <Badge className={cn("rounded-full", grade === value ? "bg-background/10 text-background hover:bg-background/10" : "bg-primary/10 text-primary hover:bg-primary/10")}>
                            {meta.badge}
                          </Badge>
                        </div>
                        <p className={cn("mt-1 text-sm", grade === value ? "text-background/75" : "text-muted-foreground")}>
                          {meta.note}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="rounded-[1.75rem] border border-foreground/10 bg-background p-5">
                  <div className="mb-4 flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                      <DoorOpen className="h-4 w-4" />
                    </div>
                    <div>
                      <p className="font-semibold">Finish and door system</p>
                      <p className="text-sm text-muted-foreground">Match the room input engine from the architecture doc.</p>
                    </div>
                  </div>
                  <div className="grid gap-4">
                    <div className="space-y-2">
                      <label className="text-sm font-semibold">Finish type</label>
                      <Select value={finishType} onValueChange={(value: FinishType) => setFinishType(value)}>
                        <SelectTrigger className="h-12 rounded-2xl border-foreground/10 bg-muted/20">
                          <SelectValue placeholder="Select finish type" />
                        </SelectTrigger>
                        <SelectContent>
                          {Object.entries(FINISH_META).map(([value, meta]) => (
                            <SelectItem key={value} value={value}>{meta.label}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <p className="text-sm text-muted-foreground">{FINISH_META[finishType].note}</p>
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-semibold">Door type</label>
                      <Select value={doorType} onValueChange={(value: DoorType) => setDoorType(value)}>
                        <SelectTrigger className="h-12 rounded-2xl border-foreground/10 bg-muted/20">
                          <SelectValue placeholder="Select door type" />
                        </SelectTrigger>
                        <SelectContent>
                          {doorOptions.map((option) => (
                            <SelectItem key={option.value} value={option.value}>{option.label}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <p className="text-sm text-muted-foreground">
                        {doorOptions.find((option) => option.value === doorType)?.note ?? "Door strategy selected for this project."}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="flex gap-3">
                  <Button variant="outline" onClick={() => setStep(2)} className="flex-1">
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Back
                  </Button>
                  <Button onClick={() => setStep(4)} disabled={!layout} className="flex-1">
                    Continue
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          )}

          {step === 4 && (
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
                    <div className="space-y-2">
                      <label className="text-sm font-semibold">Total width / length</label>
                      <div className="relative">
                        <Input
                          type="number"
                          placeholder="e.g. 12"
                          value={width}
                          onChange={(event) => setWidth(event.target.value)}
                          className="h-12 rounded-2xl border-foreground/10 bg-muted/20 pr-12"
                        />
                        <span className="absolute right-4 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">ft</span>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-semibold">
                        {layout !== "STRAIGHT" && layout !== "HINGED" && layout !== "SLIDING" ? "Return wall / total depth" : "Depth"}
                      </label>
                      <div className="relative">
                        <Input
                          type="number"
                          placeholder="e.g. 2"
                          value={depth}
                          onChange={(event) => setDepth(event.target.value)}
                          className="h-12 rounded-2xl border-foreground/10 bg-muted/20 pr-12"
                        />
                        <span className="absolute right-4 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">ft</span>
                      </div>
                    </div>

                    <div className="space-y-2 md:col-span-2">
                      <label className="text-sm font-semibold">Height</label>
                      <div className="relative">
                        <Input
                          type="number"
                          value={height}
                          onChange={(event) => setHeight(event.target.value)}
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
                  <Button variant="outline" onClick={() => setStep(3)} className="flex-1">
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Back
                  </Button>
                  <Button onClick={handleCalculate} disabled={!width || !height || !depth} className="flex-[1.2]">
                    <Calculator className="mr-2 h-4 w-4" />
                    Generate estimate
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
                  <Card className="border border-foreground/10 bg-muted/20 py-0 shadow-none">
                    <CardContent className="p-5">
                      <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">Category</p>
                      <p className="mt-2 font-semibold">{selectedCategory?.label ?? "Pending"}</p>
                    </CardContent>
                  </Card>
                  <Card className="border border-foreground/10 bg-muted/20 py-0 shadow-none">
                    <CardContent className="p-5">
                      <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">Layout</p>
                      <p className="mt-2 font-semibold">{layout ? formatLayoutLabel(layout) : "Pending"}</p>
                    </CardContent>
                  </Card>
                  <Card className="border border-foreground/10 bg-muted/20 py-0 shadow-none">
                    <CardContent className="p-5">
                      <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">Grade</p>
                      <p className="mt-2 font-semibold">{GRADE_META[grade].label}</p>
                    </CardContent>
                  </Card>
                  <Card className="border border-foreground/10 bg-muted/20 py-0 shadow-none">
                    <CardContent className="p-5">
                      <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">Finish</p>
                      <p className="mt-2 font-semibold">{FINISH_META[finishType].label}</p>
                    </CardContent>
                  </Card>
                  <Card className="border border-foreground/10 bg-muted/20 py-0 shadow-none">
                    <CardContent className="p-5">
                      <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">Door</p>
                      <p className="mt-2 font-semibold">{doorType.toLowerCase()}</p>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </div>
          )}

          {step === 5 && result && (
            <div className="space-y-8">
              <div className="flex flex-col gap-3 rounded-[1.5rem] border border-foreground/10 bg-[linear-gradient(135deg,rgba(247,244,237,0.9),rgba(255,255,255,0.98))] p-4 md:flex-row md:items-center md:justify-between">
                <div>
                  <p className="text-sm font-semibold uppercase tracking-[0.18em] text-muted-foreground">Estimate complete</p>
                  <h3 className="mt-1 text-2xl font-semibold tracking-[-0.03em]">Your material estimator report is ready.</h3>
                </div>
                <div className="flex gap-3">
                  <Button variant="ghost" onClick={handleReset}>
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Start over
                  </Button>
                  <Button variant="outline" onClick={() => setStep(4)}>Edit dimensions</Button>
                </div>
              </div>

              <EstimateResultDisplay result={result} />
              <EstimateSaveForm result={result} />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

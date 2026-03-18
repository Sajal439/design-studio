"use client";

/**
 * apps/web/components/marketing/estimator/useEstimatorState.ts
 *
 * All state and handlers extracted from the monolithic EstimatorForm.
 * Each step component receives only the slice of state it needs.
 */

import { useEffect, useMemo, useState } from "react";
import { generateEstimate } from "@/lib/estimator/calculator";
import {
  saveEstimatorState,
  loadEstimatorState,
  clearEstimatorState,
} from "@/lib/estimator/savedState";
import type { PriceBook } from "@/lib/estimator/priceBook";
import type { LoadedTemplate } from "@/lib/estimator/templateLoader";
import type { ProductCatalog } from "@/lib/estimator/productCatalogLoader";
import type {
  CategorySlug,
  DoorType,
  EstimationResult,
  FinishType,
  LayoutType,
  MaterialGrade,
  MaterialScaling,
} from "@/lib/estimator/types";

// ── Types ──────────────────────────────────────────────────────────────────────

export interface DesignOption {
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

export interface CategoryData {
  id: string;
  slug: string;
  label: string;
  designs: DesignOption[];
}

export type EstimatorStep = 1 | 2 | 3 | 4 | 5;

// ── Hook ───────────────────────────────────────────────────────────────────────

export function useEstimatorState(
  categories: CategoryData[],
  moduleTemplates: Map<string, LoadedTemplate>,
  priceBook: PriceBook,
  productCatalog: {
    bySlug: Record<string, unknown>;
    mappings: {
      pattern: string;
      flags: string;
      productSlugs: string[];
      reason: string;
    }[];
  },
) {
  const [step, setStep] = useState<EstimatorStep>(1);
  const [selectedCategory, setSelectedCategory] = useState<CategoryData | null>(
    null,
  );
  const [selectedDesign, setSelectedDesign] = useState<DesignOption | null>(
    null,
  );
  const [layout, setLayoutRaw] = useState<LayoutType | "">("");
  const [grade, setGrade] = useState<MaterialGrade>("STANDARD");
  const [finishType, setFinishType] = useState<FinishType>("LAMINATE");
  const [doorType, setDoorType] = useState<DoorType>("HINGED");
  const [width, setWidth] = useState("");
  const [height, setHeight] = useState("10");
  const [depth, setDepth] = useState("");
  const [result, setResult] = useState<EstimationResult | null>(null);
  const [hasSavedState, setHasSavedState] = useState(false);

  // Restore saved state on mount — shows resume banner in the form
  useEffect(() => {
    const saved = loadEstimatorState();
    if (!saved) return;
    const cat = categories.find((c) => c.slug === saved.categorySlug);
    if (!cat) return;
    const design = cat.designs.find((d) => d.id === saved.designId);
    if (!design) return;

    setSelectedCategory(cat);
    setSelectedDesign(design);
    setLayoutRaw(saved.layout);
    setGrade(saved.grade);
    setFinishType(saved.finishType);
    setDoorType(saved.doorType);
    setWidth(String(saved.width));
    setHeight(String(saved.height));
    setDepth(String(saved.depth));
    setHasSavedState(true);
    // Stay on step 1 — user explicitly resumes via banner
  }, []);

  // ── Derived ────────────────────────────────────────────────────────────────

  const canCalculate = Boolean(
    selectedCategory &&
    selectedDesign &&
    width &&
    height &&
    depth &&
    layout &&
    grade,
  );

  // ── Handlers ───────────────────────────────────────────────────────────────

  function handleCategorySelect(cat: CategoryData) {
    setSelectedCategory(cat);
    setSelectedDesign(null);
    setLayoutRaw("");
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

  function handleDesignSelect(design: DesignOption) {
    setSelectedDesign(design);
    setStep(3);
  }

  function handleLayoutChange(value: LayoutType) {
    setLayoutRaw(value);
    // Auto-set door type when wardrobe layout changes
    if (selectedCategory?.slug === "wardrobe") {
      if (value === "SLIDING") setDoorType("SLIDING");
      else if (value === "WALK_IN") setDoorType("OPEN");
      else setDoorType("HINGED");
    }
  }

  function handleCalculate() {
    if (!canCalculate || !selectedCategory || !selectedDesign) return;

    // Rehydrate serialised catalog
    const catalog: ProductCatalog = {
      bySlug: new Map(
        Object.entries(productCatalog.bySlug),
      ) as ProductCatalog["bySlug"],
      mappings: productCatalog.mappings.map((m) => ({
        pattern: new RegExp(m.pattern, m.flags),
        productSlugs: m.productSlugs,
        reason: m.reason,
      })),
    };

    const baseMaterialsList = selectedDesign.materials.map((m) => ({
      name: m.material.name,
      baseQty: m.material.baseQty,
      unit: m.material.unit,
      scaling: (m.material.scaling as MaterialScaling) || "AREA",
    }));

    const calcResult = generateEstimate({
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
        baseMaterialsList,
        priceBook,
        templateMap: moduleTemplates,
        productCatalog: catalog,
      });
    setResult(calcResult);

    // Persist so user can resume if they navigate away
    saveEstimatorState({
      categorySlug: selectedCategory.slug as CategorySlug,
      designId: selectedDesign.id,
      layout: layout as LayoutType,
      grade,
      finishType,
      doorType,
      width: parseFloat(width),
      height: parseFloat(height),
      depth: parseFloat(depth),
    });
    setHasSavedState(false); // dismiss resume banner after calc
    setStep(5);
  }

  function handleReset() {
    setStep(1);
    setSelectedCategory(null);
    setSelectedDesign(null);
    setWidth("");
    setHeight("10");
    setDepth("");
    setLayoutRaw("");
    setGrade("STANDARD");
    setFinishType("LAMINATE");
    setDoorType("HINGED");
    setResult(null);
    setHasSavedState(false);
    clearEstimatorState();
  }

  return {
    // State
    step,
    selectedCategory,
    selectedDesign,
    layout,
    grade,
    finishType,
    doorType,
    width,
    height,
    depth,
    result,
    canCalculate,
    hasSavedState,
    // Setters
    setStep,
    setGrade,
    setFinishType,
    setDoorType,
    setWidth,
    setHeight,
    setDepth,
    setHasSavedState,
    // Handlers
    handleCategorySelect,
    handleDesignSelect,
    handleLayoutChange,
    handleCalculate,
    handleReset,
    // Data
    categories,
  };
}

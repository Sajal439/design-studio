"use client";

import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ArrowRight, ArrowLeft, Ruler, Calculator } from "lucide-react";
import { EstimatorResults } from "./estimator-results";
import { estimateMaterials, type DesignInput, type EstimatorResult } from "@/lib/estimator";

interface CategoryData {
  slug: string;
  label: string;
  designs: DesignInput[];
}

const CATEGORY_ICONS: Record<string, string> = {
  kitchen: "🍳",
  wardrobe: "👔",
  "tv-unit": "📺",
  bedroom: "🛏️",
  study: "📚",
  office: "💼",
};

export function EstimatorForm({ categories }: { categories: CategoryData[] }) {
  const [step, setStep] = useState(1);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedDesign, setSelectedDesign] = useState<DesignInput | null>(null);
  const [width, setWidth] = useState("");
  const [depth, setDepth] = useState("");
  const [result, setResult] = useState<EstimatorResult | null>(null);

  const currentCategory = categories.find((c) => c.slug === selectedCategory);

  function handleCategorySelect(slug: string) {
    setSelectedCategory(slug);
    const cat = categories.find((c) => c.slug === slug);
    if (cat && cat.designs.length === 1) {
      setSelectedDesign(cat.designs[0]);
      setStep(2);
    } else if (cat && cat.designs.length > 0) {
      setSelectedDesign(null); // Force user to pick a reference design
      setStep(2);
    }
  }

  function handleCalculate() {
    if (!selectedDesign || !width || !depth) return;
    const estimate = estimateMaterials(selectedDesign, parseFloat(width), parseFloat(depth));
    setResult(estimate);
    setStep(3);
  }

  function handleReset() {
    setStep(1);
    setSelectedCategory(null);
    setSelectedDesign(null);
    setWidth("");
    setDepth("");
    setResult(null);
  }

  return (
    <div>
      {/* Progress Indicator */}
      <div className="mb-8 flex items-center justify-center gap-2">
        {[1, 2, 3].map((s) => (
          <div key={s} className="flex items-center gap-2">
            <div
              className={`flex h-10 w-10 items-center justify-center rounded-full text-sm font-bold transition-all ${
                step >= s
                  ? "bg-primary text-primary-foreground shadow-lg scale-110"
                  : "bg-muted text-muted-foreground"
              }`}
            >
              {s}
            </div>
            {s < 3 && (
              <div
                className={`h-0.5 w-12 transition-all ${
                  step > s ? "bg-primary" : "bg-muted"
                }`}
              />
            )}
          </div>
        ))}
      </div>

      {/* Step Labels */}
      <div className="mb-8 flex justify-center gap-8 text-xs text-muted-foreground">
        <span className={step >= 1 ? "text-primary font-medium" : ""}>Select Category</span>
        <span className={step >= 2 ? "text-primary font-medium" : ""}>Enter Dimensions</span>
        <span className={step >= 3 ? "text-primary font-medium" : ""}>View Results</span>
      </div>

      {/* Step 1: Category Selection */}
      {step === 1 && (
        <div className="animate-in fade-in slide-in-from-right-4 duration-300">
          <h2 className="mb-2 text-center text-2xl font-bold">What are you designing?</h2>
          <p className="mb-8 text-center text-muted-foreground">
            Select the type of interior you want to estimate materials for.
          </p>
          <div className="mx-auto grid max-w-3xl grid-cols-2 gap-4 md:grid-cols-3">
            {categories.map((cat) => (
              <Card
                key={cat.slug}
                className={`group cursor-pointer transition-all hover:shadow-lg hover:-translate-y-1 ${
                  selectedCategory === cat.slug
                    ? "border-primary ring-2 ring-primary/20"
                    : "hover:border-primary/50"
                }`}
                onClick={() => handleCategorySelect(cat.slug)}
              >
                <CardContent className="flex flex-col items-center p-6 text-center">
                  <span className="mb-3 text-5xl transition-transform group-hover:scale-110">
                    {CATEGORY_ICONS[cat.slug] || "🏠"}
                  </span>
                  <h3 className="mb-1 font-semibold">{cat.label}</h3>
                  <Badge variant="secondary" className="text-xs">
                    {cat.designs.length} {cat.designs.length === 1 ? "design" : "designs"}
                  </Badge>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Step 2: Dimensions Input */}
      {step === 2 && (
        <div className="animate-in fade-in slide-in-from-right-4 duration-300">
          <h2 className="mb-2 text-center text-2xl font-bold">Enter Your Room Dimensions</h2>
          <p className="mb-8 text-center text-muted-foreground">
            We&apos;ll scale the materials to fit your room size.
          </p>

          <div className="mx-auto max-w-xl space-y-6">
            {/* Design selector (if multiple designs in category) */}
            {currentCategory && currentCategory.designs.length > 1 && (
              <div className="mb-8">
                <label className="mb-3 block text-base font-semibold">1. Select Reference Design</label>
                <div className="grid gap-3">
                  {currentCategory.designs.map((d) => (
                    <Card
                      key={d.slug}
                      className={`cursor-pointer transition-all ${
                        selectedDesign?.slug === d.slug
                          ? "border-primary ring-2 ring-primary/20"
                          : "hover:border-primary/50"
                      }`}
                      onClick={() => setSelectedDesign(d)}
                    >
                      <CardContent className="flex items-center justify-between p-4">
                        <div>
                          <p className="font-medium">{d.title}</p>
                          <p className="text-sm text-muted-foreground">
                            Reference: {d.roomSize} · {d.style}
                          </p>
                        </div>
                        <Badge variant="outline">{d.estimatedCost}</Badge>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            )}

            {/* Selected design info and Inputs */}
            {selectedDesign && (
              <div className="space-y-6 animate-in fade-in slide-in-from-top-4 duration-300">
                <Card className="border-primary/20 bg-primary/5">
                  <CardContent className="flex items-center gap-3 p-4">
                    <Ruler className="h-5 w-5 text-primary" />
                    <div>
                      <p className="text-sm font-medium">Reference design: {selectedDesign.title}</p>
                      <p className="text-xs text-muted-foreground">
                        Original room size: {selectedDesign.roomSize} · {selectedDesign.materials.length} materials
                      </p>
                    </div>
                  </CardContent>
                </Card>

                {/* Dimension Inputs */}
                <div className="rounded-xl border bg-card p-6">
                  <h3 className="mb-4 font-semibold">
                    {currentCategory && currentCategory.designs.length > 1 ? "2. Your Room Size" : "Your Room Size"}
                  </h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="mb-1.5 block text-sm text-muted-foreground">Width</label>
                  <div className="relative">
                    <Input
                      type="number"
                      placeholder="e.g. 12"
                      value={width}
                      onChange={(e) => setWidth(e.target.value)}
                      min="1"
                      max="100"
                      className="pr-10 text-lg"
                    />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">
                      ft
                    </span>
                  </div>
                </div>
                <div>
                  <label className="mb-1.5 block text-sm text-muted-foreground">Depth</label>
                  <div className="relative">
                    <Input
                      type="number"
                      placeholder="e.g. 10"
                      value={depth}
                      onChange={(e) => setDepth(e.target.value)}
                      min="1"
                      max="100"
                      className="pr-10 text-lg"
                    />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">
                      ft
                    </span>
                  </div>
                </div>
              </div>

              {/* Live Area Preview */}
              {width && depth && (
                <div className="mt-4 rounded-lg bg-muted/50 p-4 text-center">
                  <p className="text-sm text-muted-foreground">Your room area</p>
                  <p className="text-3xl font-bold text-primary">
                    {(parseFloat(width) * parseFloat(depth)).toFixed(0)} sq ft
                  </p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    {((parseFloat(width) * parseFloat(depth)) /
                      (parseFloat(selectedDesign.roomSize.match(/[\d.]+/g)?.[0] || "10") *
                        parseFloat(selectedDesign.roomSize.match(/[\d.]+/g)?.[1] || "8")) *
                      100
                    ).toFixed(0)}
                    % of reference size
                  </p>
                </div>
              )}
            </div>
          </div>
        )}

            {/* Navigation */}
            <div className="flex gap-3">
              <Button variant="outline" onClick={() => setStep(1)} className="flex-1">
                <ArrowLeft className="mr-2 h-4 w-4" /> Back
              </Button>
              <Button
                onClick={handleCalculate}
                disabled={!width || !depth || !selectedDesign}
                className="flex-1"
              >
                <Calculator className="mr-2 h-4 w-4" /> Calculate Estimate
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Step 3: Results */}
      {step === 3 && result && (
        <div className="animate-in fade-in slide-in-from-right-4 duration-300">
          <EstimatorResults result={result} onReset={handleReset} onBack={() => setStep(2)} />
        </div>
      )}
    </div>
  );
}

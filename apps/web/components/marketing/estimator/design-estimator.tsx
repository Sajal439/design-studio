"use client";

import { useState } from "react";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { Calculator, Ruler, ArrowRight } from "lucide-react";
import { estimateMaterials, formatCurrency, type DesignInput, type EstimatorResult } from "@/lib/estimator";
import { ErrorBoundary } from "@/components/error-boundary";

interface DesignEstimatorProps {
  design: DesignInput;
}

export function DesignEstimator({ design }: DesignEstimatorProps) {
  const [width, setWidth] = useState("");
  const [depth, setDepth] = useState("");
  const [result, setResult] = useState<EstimatorResult | null>(null);

  function handleCalculate() {
    if (!width || !depth) return;
    const estimate = estimateMaterials(design, parseFloat(width), parseFloat(depth));
    setResult(estimate);
  }

  return (
    <ErrorBoundary fallbackTitle="Estimator error">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calculator className="h-5 w-5" />
            Estimate for Your Room
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Enter your room dimensions and we&apos;ll scale the materials accordingly.
          </p>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="mb-1 block text-xs text-muted-foreground">Width</label>
              <div className="relative">
                <Input
                  type="number"
                  placeholder="12"
                  value={width}
                  onChange={(e) => {
                    setWidth(e.target.value);
                    setResult(null);
                  }}
                  min="1"
                  max="100"
                  className="pr-8"
                />
                <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">
                  ft
                </span>
              </div>
            </div>
            <div>
              <label className="mb-1 block text-xs text-muted-foreground">Depth</label>
              <div className="relative">
                <Input
                  type="number"
                  placeholder="10"
                  value={depth}
                  onChange={(e) => {
                    setDepth(e.target.value);
                    setResult(null);
                  }}
                  min="1"
                  max="100"
                  className="pr-8"
                />
                <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">
                  ft
                </span>
              </div>
            </div>
          </div>

          <Button
            onClick={handleCalculate}
            disabled={!width || !depth}
            className="w-full"
            size="sm"
          >
            <Ruler className="mr-2 h-4 w-4" />
            Calculate
          </Button>

          {result && (
            <div className="animate-in fade-in slide-in-from-bottom-2 space-y-3">
              <Separator />

              <div className="rounded-lg bg-primary/5 p-3 text-center">
                <p className="text-xs text-muted-foreground">Estimated Cost</p>
                <p className="text-xl font-bold text-primary">
                  {formatCurrency(result.totalCostMin)} – {formatCurrency(result.totalCostMax)}
                </p>
                <p className="text-xs text-muted-foreground">
                  Scale: {result.scaleFactor}x ({result.userArea} sq ft)
                </p>
              </div>

              <div className="space-y-2">
                {result.materials.map((mat, i) => (
                  <div key={`${mat.name}-${i}`} className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">{mat.name}</span>
                    <span className="font-medium">
                      {mat.quantity} {mat.unit}
                    </span>
                  </div>
                ))}
              </div>

              <Button variant="outline" size="sm" className="w-full" asChild>
                <Link href="/estimator">
                  Full Estimator <ArrowRight className="ml-2 h-3 w-3" />
                </Link>
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </ErrorBoundary>
  );
}

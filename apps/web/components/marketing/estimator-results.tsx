"use client";

import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { ShoppingBag, Phone, RotateCcw, ArrowLeft, TrendingUp, Package } from "lucide-react";
import { type EstimatorResult, formatCurrency } from "@/lib/estimator";

interface EstimatorResultsProps {
  result: EstimatorResult;
  onReset: () => void;
  onBack: () => void;
}

export function EstimatorResults({ result, onReset, onBack }: EstimatorResultsProps) {
  const quoteParams = new URLSearchParams({
    design: result.designSlug,
    source: "estimator",
  });

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div className="text-center">
        <h2 className="mb-2 text-2xl font-bold">Your Material Estimate</h2>
        <p className="text-muted-foreground">
          Based on <strong>{result.designTitle}</strong> scaled to your{" "}
          <strong>{result.userArea} sq ft</strong> room
        </p>
      </div>

      {/* Cost Summary Card */}
      <Card className="overflow-hidden border-primary/20">
        <div className="bg-gradient-to-r from-primary to-primary/80 p-6 text-primary-foreground">
          <p className="mb-1 text-sm opacity-80">Estimated Total Cost</p>
          <p className="text-4xl font-bold">
            {formatCurrency(result.totalCostMin)} – {formatCurrency(result.totalCostMax)}
          </p>
          <div className="mt-3 flex items-center gap-4 text-sm opacity-80">
            <span className="flex items-center gap-1">
              <TrendingUp className="h-4 w-4" />
              Scale: {result.scaleFactor}x
            </span>
            <span>
              Reference: {result.referenceArea} sq ft → Your: {result.userArea} sq ft
            </span>
          </div>
        </div>
      </Card>

      {/* Material Breakdown */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Package className="h-5 w-5" />
            Material Breakdown
            <Badge variant="secondary" className="ml-auto">
              {result.materials.length} items
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {result.materials.map((mat, i) => (
              <div key={`${mat.name}-${i}`}>
                <div className="flex items-center justify-between py-2">
                  <div>
                    <p className="font-medium">{mat.name}</p>
                    <p className="text-sm text-muted-foreground">
                      {mat.quantity} {mat.unit} × {formatCurrency(mat.unitPrice)}/{mat.unit.replace(/s$/, "")}
                    </p>
                  </div>
                  <p className="text-lg font-semibold">{formatCurrency(mat.estimatedCost)}</p>
                </div>
                {i < result.materials.length - 1 && <Separator />}
              </div>
            ))}
          </div>

          <Separator className="my-4" />

          {/* Totals Row */}
          <div className="flex items-center justify-between rounded-lg bg-muted/50 px-4 py-3">
            <span className="font-semibold">Estimated Total</span>
            <span className="text-lg font-bold text-primary">
              {formatCurrency(result.totalCostMin)} – {formatCurrency(result.totalCostMax)}
            </span>
          </div>
        </CardContent>
      </Card>

      {/* Disclaimer */}
      <p className="text-center text-xs text-muted-foreground">
        * Prices are approximate and may vary based on brand choice, market conditions, and location.
        Contact us for an exact quote.
      </p>

      {/* CTAs */}
      <div className="grid gap-3 sm:grid-cols-2">
        <Button size="lg" asChild>
          <Link href={`/quote?${quoteParams.toString()}`}>
            <ShoppingBag className="mr-2 h-4 w-4" />
            Request Exact Quote
          </Link>
        </Button>
        <Button size="lg" variant="outline" asChild>
          <Link href="/consultation">
            <Phone className="mr-2 h-4 w-4" />
            Book Consultation
          </Link>
        </Button>
      </div>

      {/* Navigation */}
      <div className="flex justify-center gap-3">
        <Button variant="ghost" onClick={onBack}>
          <ArrowLeft className="mr-2 h-4 w-4" /> Adjust Dimensions
        </Button>
        <Button variant="ghost" onClick={onReset}>
          <RotateCcw className="mr-2 h-4 w-4" /> Start Over
        </Button>
      </div>
    </div>
  );
}

"use client";

import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { X, TrendingUp, TrendingDown, Minus } from "lucide-react";
import type { MaterialGrade } from "@/lib/estimator/types";

const GRADE_LABELS: Record<MaterialGrade, string> = {
  BUDGET: "Budget",
  STANDARD: "Standard",
  PREMIUM: "Premium",
};

const GRADE_DESC: Record<MaterialGrade, string> = {
  BUDGET: "Best price, BWR plywood, standard laminate",
  STANDARD: "Best value, MR/BWR mix, textured laminate",
  PREMIUM: "Best finish, marine ply, acrylic/veneer finish",
};

const GRADE_COLORS: Record<MaterialGrade, string> = {
  BUDGET: "border-slate-200 bg-slate-50",
  STANDARD: "border-blue-200 bg-blue-50",
  PREMIUM: "border-amber-200 bg-amber-50",
};

const BADGE_COLORS: Record<MaterialGrade, string> = {
  BUDGET: "bg-slate-100 text-slate-700",
  STANDARD: "bg-blue-100 text-blue-700",
  PREMIUM: "bg-amber-100 text-amber-700",
};

interface GradeCompareData {
  grade: MaterialGrade;
  costMin: number;
  costMax: number;
}

interface CompareGradesModalProps {
  /** Called with the chosen grade when user clicks "Use this grade" */
  onSelectGrade: (grade: MaterialGrade) => void;
  /** Base estimates for the 3 grades — passed from the parent after 3 simultaneous calculations */
  grades: GradeCompareData[];
  currentGrade: MaterialGrade;
  onClose: () => void;
}

function fmt(n: number) {
  if (n >= 10_000_000) return `₹${(n / 10_000_000).toFixed(2)} Cr`;
  if (n >= 100_000) return `₹${(n / 100_000).toFixed(1)} L`;
  return `₹${n.toLocaleString("en-IN")}`;
}

export function CompareGradesModal({
  grades,
  currentGrade,
  onSelectGrade,
  onClose,
}: CompareGradesModalProps) {
  const baselineMin = grades.find((g) => g.grade === "BUDGET")?.costMin ?? 0;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-2xl rounded-2xl bg-background shadow-2xl ring-1 ring-border animate-in zoom-in-95 duration-200">
        <div className="flex items-center justify-between border-b p-5">
          <div>
            <h2 className="text-lg font-bold">Compare Material Grades</h2>
            <p className="mt-0.5 text-sm text-muted-foreground">Same design, different material quality tiers</p>
          </div>
          <button onClick={onClose} className="rounded-full p-1.5 text-muted-foreground hover:text-foreground">
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="grid gap-4 p-5 md:grid-cols-3">
          {grades.map((g) => {
            const diffPct = baselineMin > 0
              ? Math.round(((g.costMin - baselineMin) / baselineMin) * 100)
              : 0;
            const isActive = g.grade === currentGrade;

            return (
              <div
                key={g.grade}
                className={`relative rounded-xl border-2 p-4 transition-all ${GRADE_COLORS[g.grade]} ${isActive ? "ring-2 ring-primary ring-offset-1" : ""}`}
              >
                {isActive && (
                  <span className="absolute -top-2.5 left-3 rounded-full bg-primary px-2 py-0.5 text-[10px] font-semibold text-primary-foreground">
                    Current
                  </span>
                )}
                <Badge className={`mb-3 ${BADGE_COLORS[g.grade]}`}>{GRADE_LABELS[g.grade]}</Badge>
                <p className="text-2xl font-bold">
                  {fmt(g.costMin)}<span className="text-sm text-muted-foreground">+</span>
                </p>
                <p className="text-xs text-muted-foreground">up to {fmt(g.costMax)}</p>

                {diffPct > 0 ? (
                  <span className="mt-2 flex items-center gap-1 text-xs text-amber-700">
                    <TrendingUp className="h-3 w-3" /> +{diffPct}% vs Budget
                  </span>
                ) : diffPct < 0 ? (
                  <span className="mt-2 flex items-center gap-1 text-xs text-green-700">
                    <TrendingDown className="h-3 w-3" /> {diffPct}%
                  </span>
                ) : (
                  <span className="mt-2 flex items-center gap-1 text-xs text-muted-foreground">
                    <Minus className="h-3 w-3" /> Baseline
                  </span>
                )}

                <p className="mt-3 text-xs text-muted-foreground leading-relaxed">{GRADE_DESC[g.grade]}</p>

                <Button
                  size="sm"
                  className="mt-4 w-full"
                  variant={isActive ? "default" : "outline"}
                  onClick={() => { onSelectGrade(g.grade); onClose(); }}
                >
                  {isActive ? "Keep this grade" : "Use this grade"}
                </Button>
              </div>
            );
          })}
        </div>

        <div className="border-t px-5 py-3 text-center text-xs text-muted-foreground">
          Estimates are indicative and vary by site conditions, brand selection, and finishing details.
        </div>
      </div>
    </div>
  );
}

"use client";

/**
 * apps/web/components/marketing/estimator/StepResult.tsx
 *
 * Wraps EstimateResultDisplay + EstimateSaveForm.
 * Lazy-loaded so its JS is only parsed when the user reaches step 5.
 */

import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

import type { EstimationResult } from "@/lib/estimator/types";
import { EstimateResultDisplay } from "./estimate-result";
import { EstimateSaveForm } from "./estimate-save-form";

interface Props {
    result: EstimationResult;
    onReset: () => void;
    onEditDimensions: () => void;
}

export function StepResult({ result, onReset, onEditDimensions }: Props) {
    return (
        <div className="space-y-8">
            {/* Toolbar */}
            <div className="flex flex-col gap-3 rounded-[1.5rem] border border-foreground/10 bg-[linear-gradient(135deg,rgba(247,244,237,0.9),rgba(255,255,255,0.98))] p-4 md:flex-row md:items-center md:justify-between">
                <div>
                    <p className="text-sm font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                        Estimate complete
                    </p>
                    <h3 className="mt-1 text-2xl font-semibold tracking-[-0.03em]">
                        Your material estimator report is ready.
                    </h3>
                </div>
                <div className="flex gap-3">
                    <Button variant="ghost" onClick={onReset}>
                        <ArrowLeft className="mr-2 h-4 w-4" /> Start over
                    </Button>
                    <Button variant="outline" onClick={onEditDimensions}>
                        Edit dimensions
                    </Button>
                </div>
            </div>

            <EstimateResultDisplay result={result} />
            <EstimateSaveForm result={result} />
        </div>
    );
}
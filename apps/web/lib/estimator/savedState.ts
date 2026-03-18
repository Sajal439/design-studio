"use client";

import { useEffect, useRef } from "react";
import type {
  CategorySlug,
  DoorType,
  FinishType,
  LayoutType,
} from "@/lib/estimator/types";

export interface EstimatorSavedState {
  categorySlug: CategorySlug;
  designId: string;
  layout: LayoutType;
  grade: "BUDGET" | "STANDARD" | "PREMIUM";
  finishType: FinishType;
  doorType: DoorType;
  width: number;
  height: number;
  depth: number;
  savedAt: number; // timestamp
}

const KEY = "goel_estimator_state";
const MAX_AGE_MS = 7 * 24 * 60 * 60 * 1000; // 7 days

export function saveEstimatorState(state: Omit<EstimatorSavedState, "savedAt">) {
  try {
    const full: EstimatorSavedState = { ...state, savedAt: Date.now() };
    localStorage.setItem(KEY, JSON.stringify(full));
  } catch {
    // localStorage unavailable (SSR or private mode) — silently skip
  }
}

export function loadEstimatorState(): EstimatorSavedState | null {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return null;
    const parsed: EstimatorSavedState = JSON.parse(raw);
    if (Date.now() - parsed.savedAt > MAX_AGE_MS) {
      localStorage.removeItem(KEY);
      return null;
    }
    return parsed;
  } catch {
    return null;
  }
}

export function clearEstimatorState() {
  try {
    localStorage.removeItem(KEY);
  } catch { /* noop */ }
}

/**
 * Hook — returns previously saved state on first mount, or null.
 * Use this in the estimator form to offer "continue where you left off".
 */
export function useSavedEstimatorState(): EstimatorSavedState | null {
  const stateRef = useRef<EstimatorSavedState | null>(null);

  useEffect(() => {
    stateRef.current = loadEstimatorState();
  }, []);

  return stateRef.current;
}

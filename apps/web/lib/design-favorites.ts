"use client";

export type SavedDesign = {
  slug: string;
  title: string;
  imageUrl: string | null;
  categoryLabel?: string | null;
  estimatedCost?: string | null;
  savedAt: number;
};

const KEY = "goel_saved_designs";
export const SAVED_DESIGNS_EVENT = "goel-saved-designs-updated";

function isSavedDesign(value: unknown): value is SavedDesign {
  return (
    !!value &&
    typeof value === "object" &&
    "slug" in value &&
    typeof value.slug === "string" &&
    "title" in value &&
    typeof value.title === "string" &&
    "savedAt" in value &&
    typeof value.savedAt === "number"
  );
}

export function loadSavedDesigns(): SavedDesign[] {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return [];

    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];

    return parsed.filter(isSavedDesign);
  } catch {
    return [];
  }
}

function persistSavedDesigns(designs: SavedDesign[]) {
  try {
    localStorage.setItem(KEY, JSON.stringify(designs));
    window.dispatchEvent(new CustomEvent(SAVED_DESIGNS_EVENT));
  } catch {
    // localStorage may be unavailable in private browsing or SSR hydration windows
  }
}

export function isDesignSaved(slug: string) {
  return loadSavedDesigns().some((design) => design.slug === slug);
}

export function toggleSavedDesign(design: Omit<SavedDesign, "savedAt">) {
  const savedDesigns = loadSavedDesigns();
  const exists = savedDesigns.some((item) => item.slug === design.slug);

  if (exists) {
    persistSavedDesigns(savedDesigns.filter((item) => item.slug !== design.slug));
    return false;
  }

  persistSavedDesigns([{ ...design, savedAt: Date.now() }, ...savedDesigns]);
  return true;
}

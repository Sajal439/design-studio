"use client";

import { Heart } from "lucide-react";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  SAVED_DESIGNS_EVENT,
  isDesignSaved,
  toggleSavedDesign,
  type SavedDesign,
} from "@/lib/design-favorites";
import { cn } from "@/lib/utils";

type DesignSaveButtonProps = {
  design: Omit<SavedDesign, "savedAt">;
  variant?: "floating" | "inline";
  className?: string;
};

export function DesignSaveButton({
  design,
  variant = "floating",
  className,
}: DesignSaveButtonProps) {
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    const syncSavedState = () => {
      setSaved(isDesignSaved(design.slug));
    };

    syncSavedState();
    window.addEventListener("storage", syncSavedState);
    window.addEventListener(SAVED_DESIGNS_EVENT, syncSavedState);

    return () => {
      window.removeEventListener("storage", syncSavedState);
      window.removeEventListener(SAVED_DESIGNS_EVENT, syncSavedState);
    };
  }, [design.slug]);

  function handleClick(event: React.MouseEvent<HTMLButtonElement>) {
    event.preventDefault();
    event.stopPropagation();
    setSaved(toggleSavedDesign(design));
  }

  if (variant === "inline") {
    return (
      <Button
        type="button"
        variant={saved ? "default" : "outline"}
        size="sm"
        aria-pressed={saved}
        onClick={handleClick}
        className={cn("gap-2 rounded-full", className)}
      >
        <Heart className={cn("h-4 w-4", saved && "fill-current")} />
        {saved ? "Saved" : "Save Design"}
      </Button>
    );
  }

  return (
    <Button
      type="button"
      variant="secondary"
      size="icon-sm"
      aria-label={saved ? "Remove saved design" : "Save design"}
      aria-pressed={saved}
      onClick={handleClick}
      className={cn(
        "rounded-full border border-white/80 bg-white/90 text-slate-700 shadow-md backdrop-blur hover:bg-white",
        saved && "text-rose-500",
        className
      )}
    >
      <Heart className={cn("h-4 w-4", saved && "fill-current")} />
    </Button>
  );
}

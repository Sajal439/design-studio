"use client";

import { useState, useCallback } from "react";
import { Heart } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

interface SaveDesignButtonProps {
  designId: string;
  initialSaved?: boolean;
  /** If true renders a compact icon button; otherwise a full button with label */
  compact?: boolean;
  className?: string;
}

export function SaveDesignButton({
  designId,
  initialSaved = false,
  compact = true,
  className,
}: SaveDesignButtonProps) {
  const [saved, setSaved] = useState(initialSaved);
  const [loading, setLoading] = useState(false);

  const toggle = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/saved-designs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ designId }),
      });

      if (res.status === 401) {
        // Redirect to login, then back
        window.location.href = `/login?redirect=${encodeURIComponent(window.location.pathname)}`;
        return;
      }

      if (res.ok) {
        const data = (await res.json()) as { saved: boolean };
        setSaved(data.saved);
      }
    } finally {
      setLoading(false);
    }
  }, [designId]);

  if (compact) {
    return (
      <button
        onClick={toggle}
        disabled={loading}
        title={saved ? "Saved — click to remove" : "Save design"}
        aria-label={saved ? "Remove from saved" : "Save design"}
        className={cn(
          "flex h-9 w-9 items-center justify-center rounded-full border bg-background/80 shadow-sm backdrop-blur transition-all hover:scale-110 active:scale-95",
          loading && "opacity-60",
          className,
        )}
      >
        <Heart
          className={cn(
            "h-4 w-4 transition-colors",
            saved
              ? "fill-rose-500 stroke-rose-500"
              : "stroke-muted-foreground",
          )}
        />
      </button>
    );
  }

  return (
    <Button
      variant={saved ? "destructive" : "outline"}
      size="sm"
      onClick={toggle}
      disabled={loading}
      className={className}
    >
      <Heart
        className={cn(
          "mr-2 h-4 w-4",
          saved ? "fill-current" : "",
        )}
      />
      {saved ? "Saved" : "Save Design"}
    </Button>
  );
}

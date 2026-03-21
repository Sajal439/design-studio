"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { ArrowRight, Heart } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { DesignSaveButton } from "@/components/marketing/design-save-button";
import { SAVED_DESIGNS_EVENT, loadSavedDesigns } from "@/lib/design-favorites";
import { cn } from "@/lib/utils";

type DesignGalleryCategory = {
  id: string;
  slug: string;
  label: string;
};

type DesignGalleryItem = {
  id: string;
  slug: string;
  title: string;
  description: string | null;
  estimatedCost: string | null;
  imageUrl: string | null;
  category: {
    label: string;
    slug: string;
  };
};

type DesignGalleryClientProps = {
  activeCategory: string;
  categories: DesignGalleryCategory[];
  designs: DesignGalleryItem[];
};

export function DesignGalleryClient({
  activeCategory,
  categories,
  designs,
}: DesignGalleryClientProps) {
  const [savedSlugs, setSavedSlugs] = useState<string[]>([]);
  const [showSavedOnly, setShowSavedOnly] = useState(false);

  useEffect(() => {
    const syncSavedDesigns = () => {
      setSavedSlugs(loadSavedDesigns().map((design) => design.slug));
    };

    syncSavedDesigns();
    window.addEventListener("storage", syncSavedDesigns);
    window.addEventListener(SAVED_DESIGNS_EVENT, syncSavedDesigns);

    return () => {
      window.removeEventListener("storage", syncSavedDesigns);
      window.removeEventListener(SAVED_DESIGNS_EVENT, syncSavedDesigns);
    };
  }, []);

  const visibleDesigns = showSavedOnly
    ? designs.filter((design) => savedSlugs.includes(design.slug))
    : designs;

  return (
    <>
      <div className="mb-10">
        <div className="flex flex-wrap justify-center gap-2">
          <Link href="/designs">
            <Badge
              variant={activeCategory === "all" ? "default" : "outline"}
              className="cursor-pointer px-4 py-2 text-sm"
            >
              All
            </Badge>
          </Link>
          {categories.map((cat) => (
            <Link key={cat.id} href={`/designs?category=${cat.slug}`}>
              <Badge
                variant={activeCategory === cat.slug ? "default" : "outline"}
                className="cursor-pointer px-4 py-2 text-sm"
              >
                {cat.label}
              </Badge>
            </Link>
          ))}
          <button
            type="button"
            onClick={() => setShowSavedOnly((current) => !current)}
            className={cn(
              "inline-flex cursor-pointer items-center gap-2 rounded-full border px-4 py-2 text-sm font-medium transition-colors",
              showSavedOnly
                ? "border-primary bg-primary text-primary-foreground"
                : "border-border bg-background text-foreground hover:bg-muted"
            )}
          >
            <Heart className={cn("h-4 w-4", showSavedOnly && "fill-current")} />
            Saved
            <span className="rounded-full bg-black/8 px-1.5 py-0.5 text-[11px] leading-none">
              {savedSlugs.length}
            </span>
          </button>
        </div>
        <p className="mt-3 text-center text-xs text-muted-foreground">
          Saved designs stay on this device only.
        </p>
      </div>

      {visibleDesigns.length === 0 ? (
        <div className="rounded-2xl border border-dashed bg-muted/20 px-6 py-14 text-center">
          <p className="text-base font-medium text-foreground">
            {showSavedOnly
              ? "No saved designs yet on this device."
              : "No designs found for this filter."}
          </p>
          <p className="mt-2 text-sm text-muted-foreground">
            {showSavedOnly
              ? "Tap the heart on any design card to keep it here for quick access."
              : "Try another category to explore more options."}
          </p>
          {showSavedOnly ? (
            <button
              type="button"
              onClick={() => setShowSavedOnly(false)}
              className="mt-5 inline-flex rounded-full border border-border px-4 py-2 text-sm font-medium hover:bg-muted"
            >
              View All Designs
            </button>
          ) : null}
        </div>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {visibleDesigns.map((design, index) => (
            <Card key={design.id} className="group relative h-full overflow-hidden transition-all hover:-translate-y-1 hover:shadow-lg">
              <DesignSaveButton
                design={{
                  slug: design.slug,
                  title: design.title,
                  imageUrl: design.imageUrl,
                  categoryLabel: design.category.label,
                  estimatedCost: design.estimatedCost,
                }}
                className="absolute top-3 right-3 z-10"
              />
              <Link href={`/designs/${design.slug}`} className="block h-full">
                <div className="relative aspect-video bg-muted">
                  {design.imageUrl ? (
                    <Image
                      alt={design.title}
                      className="object-cover transition-transform duration-300 group-hover:scale-105"
                      fill
                      priority={index < 6}
                      sizes="(max-width: 1024px) 50vw, 33vw"
                      src={design.imageUrl}
                    />
                  ) : null}
                </div>
                <CardContent className="p-5">
                  <Badge variant="secondary" className="mb-2">
                    {design.category.label}
                  </Badge>
                  <h3 className="mb-1 text-lg font-semibold transition-colors group-hover:text-primary">
                    {design.title}
                  </h3>
                  <p className="mb-3 line-clamp-2 text-sm text-muted-foreground">
                    {design.description}
                  </p>
                  <div className="flex items-center justify-between text-sm">
                    <span className="font-medium">{design.estimatedCost}</span>
                    <span className="flex items-center gap-1 text-primary">
                      View Details <ArrowRight className="h-3 w-3" />
                    </span>
                  </div>
                </CardContent>
              </Link>
            </Card>
          ))}
        </div>
      )}
    </>
  );
}

"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { ArrowRight, BriefcaseBusiness, Heart } from "lucide-react";
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
  isRealWork: boolean;
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
  const [showOurWorkOnly, setShowOurWorkOnly] = useState(false);

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

  const visibleDesigns = designs.filter((design) => {
    if (showSavedOnly && !savedSlugs.includes(design.slug)) {
      return false;
    }

    if (showOurWorkOnly && !design.isRealWork) {
      return false;
    }

    return true;
  });

  const filterButtonClass = (active: boolean) =>
    cn(
      "inline-flex cursor-pointer items-center gap-2 rounded-full border px-4 py-2 text-sm font-medium transition-colors",
      active
        ? "border-primary bg-primary text-primary-foreground"
        : "border-border bg-background text-foreground hover:bg-muted"
    );

  return (
    <>
      <div className="mb-10">
        <div className="flex flex-wrap justify-center gap-2">
          <Link href="/designs" className={filterButtonClass(activeCategory === "all")}>
            <span>
              All
            </span>
          </Link>
          {categories.map((cat) => (
            <Link
              key={cat.id}
              href={`/designs?category=${cat.slug}`}
              className={filterButtonClass(activeCategory === cat.slug)}
            >
              <span>
                {cat.label}
              </span>
            </Link>
          ))}
          <button
            type="button"
            onClick={() => setShowSavedOnly((current) => !current)}
            className={filterButtonClass(showSavedOnly)}
          >
            <Heart className={cn("h-4 w-4", showSavedOnly && "fill-current")} />
            Saved
            <span className="rounded-full bg-black/8 px-1.5 py-0.5 text-[11px] leading-none">
              {savedSlugs.length}
            </span>
          </button>
          <button
            type="button"
            onClick={() => setShowOurWorkOnly((current) => !current)}
            className={filterButtonClass(showOurWorkOnly)}
          >
            <BriefcaseBusiness className="h-4 w-4" />
            Our Work
          </button>
        </div>
      </div>

      {visibleDesigns.length === 0 ? (
        <div className="rounded-2xl border border-dashed bg-muted/20 px-6 py-14 text-center">
          <p className="text-base font-medium text-foreground">
            {showSavedOnly
              ? "No saved designs yet on this device."
              : showOurWorkOnly
              ? "No real project designs found for this filter."
              : "No designs found for this filter."}
          </p>
          <p className="mt-2 text-sm text-muted-foreground">
            {showSavedOnly
              ? "Tap the heart on any design card to keep it here for quick access."
              : showOurWorkOnly
              ? "Turn off Our Work to browse all design inspirations as well."
              : "Try another category to explore more options."}
          </p>
          {showSavedOnly || showOurWorkOnly ? (
            <button
              type="button"
              onClick={() => {
                setShowSavedOnly(false);
                setShowOurWorkOnly(false);
              }}
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
                  <div className="mb-2 flex flex-wrap gap-2">
                    <Badge variant="secondary">
                      {design.category.label}
                    </Badge>
                    {design.isRealWork ? (
                      <Badge variant="outline" className="border-emerald-200 bg-emerald-50 text-emerald-700">
                        Our Work
                      </Badge>
                    ) : null}
                  </div>
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

/**
 * Brand logos marquee / trust strip.
 * Shows authorized brand names as text badges in a scrolling strip.
 * Replace text with actual <Image> tags once brand logo assets are available.
 */
export function BrandLogosBar() {
  const brands = [
    "Century Ply",
    "Greenply",
    "Merino",
    "Hettich",
    "Hafele",
    "Action TESA",
    "Durian",
    "Dorset",
    "Pergo",
    "Royale Touche",
  ];

  return (
    <section className="border-y bg-muted/30 py-6">
      <div className="container mx-auto px-4">
        <p className="mb-4 text-center text-xs font-semibold uppercase tracking-widest text-muted-foreground">
          Authorized Dealer · Trusted Brands
        </p>
        <div className="relative overflow-hidden">
          {/* Fade masks */}
          <div className="pointer-events-none absolute left-0 top-0 z-10 h-full w-16 bg-gradient-to-r from-muted/30 to-transparent" />
          <div className="pointer-events-none absolute right-0 top-0 z-10 h-full w-16 bg-gradient-to-l from-muted/30 to-transparent" />

          <div className="flex animate-marquee gap-8 whitespace-nowrap">
            {[...brands, ...brands].map((brand, i) => (
              <span
                key={`${brand}-${i}`}
                className="inline-flex items-center rounded-full border bg-background px-4 py-2 text-sm font-semibold text-foreground shadow-sm"
              >
                {brand}
              </span>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

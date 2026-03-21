import Image from "next/image";

const brands = [
  { name: "Action TESA", src: "/action%20tesa%20logo.png" },
  { name: "Advance Laminates", src: "/advance%20laminates.webp" },
  { name: "Dorset", src: "/dorset.png" },
  { name: "Hafele", src: "/hafele.webp" },
  { name: "Hettich", src: "/hettich.png" },
];

export function BrandLogosBar() {
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
              <div
                key={`${brand.name}-${i}`}
                className="inline-flex shrink-0 items-center justify-center rounded-2xl border border-slate-200/80 bg-white px-5 py-3 shadow-sm"
              >
                <div className="relative h-10 w-[120px] sm:w-[140px]">
                  <Image
                    src={brand.src}
                    alt={`${brand.name} logo`}
                    fill
                    sizes="140px"
                    className="object-contain"
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

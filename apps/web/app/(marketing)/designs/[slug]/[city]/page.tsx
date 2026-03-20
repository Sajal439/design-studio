import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import { ArrowRight, Calculator } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { prisma } from "@repo/database";
import { getFirstImageUrl } from "@/lib/utils";

// ── Supported city slugs ─────────────────────────────────────────────────────
const CITY_DATA: Record<string, { label: string; state: string }> = {
  karnal: { label: "Karnal", state: "Haryana" },
  panipat: { label: "Panipat", state: "Haryana" },
  kurukshetra: { label: "Kurukshetra", state: "Haryana" },
  ambala: { label: "Ambala", state: "Haryana" },
  kaithal: { label: "Kaithal", state: "Haryana" },
  rohtak: { label: "Rohtak", state: "Haryana" },
  sonipat: { label: "Sonipat", state: "Haryana" },
};

// ── Supported category slugs ─────────────────────────────────────────────────
const CATEGORY_DATA: Record<string, { label: string; plural: string; estimatorSlug: string }> = {
  kitchen: { label: "Kitchen", plural: "Modular Kitchens", estimatorSlug: "kitchen" },
  wardrobe: { label: "Wardrobe", plural: "Wardrobes", estimatorSlug: "wardrobe" },
  "tv-unit": { label: "TV Unit", plural: "TV Units", estimatorSlug: "tv-unit" },
  bedroom: { label: "Bedroom", plural: "Bedroom Interiors", estimatorSlug: "bedroom" },
  study: { label: "Study", plural: "Study Tables & Units", estimatorSlug: "study" },
  office: { label: "Office", plural: "Office Furniture", estimatorSlug: "office" },
};

// ── Params — note: "slug" matches the parent [slug] segment ─────────────────
interface PageParams {
  params: Promise<{ slug: string; city: string }>;
}

// ── Static path generation ───────────────────────────────────────────────────
export async function generateStaticParams() {
  const paths: { slug: string; city: string }[] = [];
  for (const slug of Object.keys(CATEGORY_DATA)) {
    for (const city of Object.keys(CITY_DATA)) {
      paths.push({ slug, city });
    }
  }
  return paths;
}

// ── SEO metadata ─────────────────────────────────────────────────────────────
export async function generateMetadata({ params }: PageParams): Promise<Metadata> {
  const { slug, city } = await params;
  const cat = CATEGORY_DATA[slug];
  const loc = CITY_DATA[city];
  if (!cat || !loc) return { title: "Not Found" };

  const title = `${cat.plural} in ${loc.label}, ${loc.state} | Goel Traders`;
  const description = `Browse ${cat.plural.toLowerCase()} designs and get instant material estimates for your home in ${loc.label}. Trusted by hundreds of families across ${loc.state} — free consultation available.`;

  return {
    title,
    description,
    openGraph: { title, description },
    keywords: [
      `${cat.label.toLowerCase()} interior ${loc.label}`,
      `modular ${cat.label.toLowerCase()} ${loc.label}`,
      `${cat.label.toLowerCase()} cost ${loc.label}`,
      `interior materials ${loc.label}`,
      `Goel Traders ${loc.label}`,
    ],
  };
}

// ── Page component ───────────────────────────────────────────────────────────
export default async function CategoryCityLandingPage({ params }: PageParams) {
  const { slug, city } = await params;
  const cat = CATEGORY_DATA[slug];
  const loc = CITY_DATA[city];
  if (!cat || !loc) notFound();

  // Load designs for this category
  const designs = await prisma.design.findMany({
    where: { category: { slug } },
    select: { slug: true, title: true, images: true, estimatedCost: true, style: true },
    take: 6,
  });

  return (
    <div>
      {/* ── Hero ── */}
      <section className="border-b bg-gradient-to-b from-muted/50 to-background py-12 md:py-20">
        <div className="container mx-auto px-4">
          <div className="mx-auto max-w-3xl text-center">
            <Badge className="mb-4">{loc.label}, {loc.state}</Badge>
            <h1 className="mb-5 text-4xl font-bold tracking-tight md:text-5xl">
              {cat.plural} in {loc.label}
            </h1>
            <p className="mb-8 text-lg text-muted-foreground">
              Browse {cat.plural.toLowerCase()} styles, get an instant material estimate,
              and connect with Goel Traders — {loc.label}&apos;s trusted interior materials dealer.
            </p>
            <div className="flex flex-col justify-center gap-3 sm:flex-row">
              <Button size="lg" asChild>
                <Link href={`/estimator?category=${cat.estimatorSlug}`}>
                  <Calculator className="mr-2 h-4 w-4" /> Get Free Estimate
                </Link>
              </Button>
              <Button size="lg" variant="outline" asChild>
                <Link href="/consultation">Book Free Consultation</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* ── Design gallery ── */}
      <section className="py-14">
        <div className="container mx-auto px-4">
          <h2 className="mb-8 text-2xl font-bold">
            {cat.plural} Designs — {loc.label}
          </h2>
          {designs.length === 0 ? (
            <div className="rounded-2xl border bg-muted/30 py-16 text-center">
              <p className="text-muted-foreground">
                Designs coming soon.{" "}
                <Link href="/designs" className="underline">View all designs →</Link>
              </p>
            </div>
          ) : (
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {designs.map((d) => (
                <Link
                  key={d.slug}
                  href={`/designs/${d.slug}`}
                  className="group rounded-2xl border bg-background overflow-hidden transition-all hover:-translate-y-1 hover:shadow-md"
                >
                  <div className="relative aspect-video overflow-hidden bg-muted">
                    {getFirstImageUrl(d.images) ? (
                      <Image
                        alt={d.title}
                        src={getFirstImageUrl(d.images)!}
                        fill
                        className="object-cover transition-transform group-hover:scale-105"
                        sizes="(max-width: 1024px) 50vw, 33vw"
                      />
                    ) : null}
                  </div>
                  <div className="p-4">
                    <Badge variant="outline" className="mb-2">{d.style}</Badge>
                    <h3 className="font-semibold">{d.title}</h3>
                    <p className="mt-1 text-sm text-muted-foreground">{d.estimatedCost}</p>
                  </div>
                </Link>
              ))}
            </div>
          )}
          {designs.length > 0 && (
            <div className="mt-8 text-center">
              <Button variant="outline" asChild>
                <Link href={`/designs?category=${slug}`}>
                  View all {cat.plural} <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </div>
          )}
        </div>
      </section>

      {/* ── Local trust section ── */}
      <section className="border-t bg-muted/20 py-12">
        <div className="container mx-auto px-4">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="mb-3 text-2xl font-bold">
              Why {loc.label} Families Choose Goel Traders
            </h2>
            <p className="mb-8 text-muted-foreground">
              Authorized dealer for Century Ply, Greenply, Merino, Hettich, and Hafele.
              Serving homes across {loc.state} with quality materials and expert guidance.
            </p>
            <div className="grid gap-4 sm:grid-cols-3 text-left">
              {[
                { title: "Instant Estimates", desc: "Get a material cost breakdown in minutes — no sign-up." },
                { title: "Free Consultation", desc: "Our experts come to your site, showroom, or on a video call." },
                { title: "Genuine Brands", desc: "Only authorized, tested materials from top manufacturers." },
              ].map((item) => (
                <Card key={item.title}>
                  <CardContent className="p-5">
                    <h3 className="mb-2 font-semibold">{item.title}</h3>
                    <p className="text-sm text-muted-foreground">{item.desc}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="py-12">
        <div className="container mx-auto px-4">
          <div className="rounded-2xl bg-primary p-8 text-center text-primary-foreground md:p-12">
            <h2 className="mb-3 text-2xl font-bold md:text-3xl">
              Ready to plan your {cat.label.toLowerCase()} in {loc.label}?
            </h2>
            <p className="mb-6 text-primary-foreground/80">
              Use our free estimator to get material quantities and costs, then request a quote.
            </p>
            <Button size="lg" variant="secondary" asChild>
              <Link href={`/estimator?category=${cat.estimatorSlug}`}>
                <Calculator className="mr-2 h-4 w-4" /> Start Free Estimate
              </Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}

import Link from "next/link";
import Image from "next/image";
import { prisma } from "@repo/database";
import {
  MessageCircle,
  MapPin,
  Star,
  ChevronRight,
  Calculator,
  CheckCircle2,
} from "lucide-react";
import { BrandLogosBar } from "@/components/marketing/brand-logos-bar";
import { LocationSection } from "@/components/marketing/location-section";
import { siteConfig } from "@/lib/site-config";
import { getFirstImageUrl } from "@/lib/utils";

// ── Constants ─────────────────────────────────────────────────────────────────

const WA_BASE = `https://wa.me/91${siteConfig.whatsapp}`;

function waUrl(text: string) {
  return `${WA_BASE}?text=${encodeURIComponent(text)}`;
}

const HERO_WA = waUrl(
  "Hi! I'm looking for interior materials. Can you share prices for my project?"
);

const DESIGN_CATEGORIES = [
  {
    title: "Kitchen",
    href: "/designs?category=kitchen",
    description: "Modular layouts, finishes, shutters, hardware, and smart storage ideas.",
    accent: "from-amber-200 via-orange-100 to-white",
  },
  {
    title: "Wardrobes",
    href: "/designs?category=wardrobe",
    description: "Sliding and hinged wardrobes designed for clean storage and daily ease.",
    accent: "from-stone-200 via-zinc-100 to-white",
  },
  {
    title: "Study Tables",
    href: "/designs?category=study",
    description: "Compact study corners and work-from-home setups with shelves and drawers.",
    accent: "from-sky-200 via-cyan-100 to-white",
  },
  {
    title: "Office Interiors",
    href: "/designs?category=office",
    description: "Professional cabin, workstation, and storage concepts for productive offices.",
    accent: "from-slate-300 via-slate-100 to-white",
  },
  {
    title: "Bedrooms",
    href: "/designs?category=bedroom",
    description: "Warm bedroom concepts with coordinated wardrobes, panels, and headboards.",
    accent: "from-rose-200 via-pink-100 to-white",
  },
] as const;



// ── Testimonials ──────────────────────────────────────────────────────────────

const TESTIMONIALS = [
  {
    name: "Rahul Sharma",
    avatar: "https://i.pravatar.cc/150?u=rahul",
    location: "Sector 6, Karnal",
    project: "Modular Kitchen",
    text: "Got material list + price in 20 minutes on WhatsApp. Century Ply + Merino laminate delivered same week.",
    rating: 5,
  },
  {
    name: "Priya Gupta",
    avatar: "https://i.pravatar.cc/150?u=priya",
    location: "Panipat",
    project: "Home Wardrobes",
    text: "Visited the showroom — huge stock, no middleman. Hettich soft-close hinges at better price than online.",
    rating: 5,
  },
  {
    name: "Sandeep Verma",
    avatar: "https://i.pravatar.cc/150?u=sandeep",
    location: "Kurukshetra",
    project: "Complete 3BHK",
    text: "They matched the carpenter's list item by item. Greenply BWR, all in stock. Smooth communication.",
    rating: 5,
  },
];

function getOptimizedCloudinaryUrl(url: string | null | undefined): string {
  if (!url) return "";
  // Check if it's already a Cloudinary upload URL without optimizations
  if (url.includes("/upload/") && !url.includes("f_auto,q_auto")) {
    return url.replace("/upload/", "/upload/f_auto,q_auto,w_800/");
  }
  return url;
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default async function Home() {
  const realWork = await prisma.design.findMany({
    where: { isRealWork: true },
    orderBy: { createdAt: "desc" },
  });
  const featuredRealWork = realWork[0];
  const additionalRealWork = realWork.slice(1, 4);

  return (
    <div className="bg-slate-50 font-sans selection:bg-primary/20">

      {/* ════════════════════════════════════════
          1. PREMIUM HERO SECTION
          ════════════════════════════════════════ */}
      <section className="relative overflow-hidden bg-[#FAFAFA] pt-32 pb-40 md:pt-40 md:pb-48">
        <div className="relative container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mx-auto text-center z-10 flex flex-col items-center">
            <div className="inline-flex items-center justify-center gap-2 rounded-full border border-slate-200/60 bg-white/40 backdrop-blur-xl px-4 py-1.5 text-xs font-semibold text-slate-600 mb-10 tracking-widest uppercase shadow-sm">
              <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
              Karnal's Premium Interior Materials
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-slate-900 mb-4 leading-tight">
              Plywood, Laminates & Hardware
            </h1>

            <p className="text-lg sm:text-xl text-slate-600 mb-6 max-w-2xl">
              All in one place — know your cost before you buy.
            </p>

            <p className="text-base text-slate-500 max-w-xl">
              Get instant estimates, genuine brands, and expert guidance for your project.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-14 w-full sm:w-auto">
              <a
                href={HERO_WA}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full sm:w-auto flex items-center justify-center gap-2 rounded-2xl bg-[#25D366] px-10 py-4 text-lg font-bold text-white hover:bg-[#20bd5a] hover:shadow-xl hover:shadow-[#25D366]/20 hover:-translate-y-1 transition-all duration-300"
              >
                <MessageCircle className="h-6 w-6" />
                Chat on WhatsApp
              </a>
              <Link
                href="/estimator"
                className="w-full sm:w-auto flex items-center justify-center gap-2 rounded-2xl bg-white border border-slate-200 px-10 py-4 text-lg font-bold text-slate-700 hover:bg-slate-50 hover:border-slate-300 transition-all duration-300 shadow-sm hover:-translate-y-1"
              >
                <Calculator className="h-5 w-5" />
                Get an Estimate
              </Link>
            </div>

            {/* Trust markers */}
            <div className="flex flex-wrap items-center justify-center gap-x-8 gap-y-4 text-sm text-slate-500 font-medium tracking-wide">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                <span>100% Genuine Brands</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                <span>End-to-End Delivery</span>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* ════════════════════════════════════════
          Brand logos Bar
          ════════════════════════════════════════ */}
      <div className="relative -mt-8 z-20 container mx-auto px-4">
        <BrandLogosBar />
      </div>

      {/* ════════════════════════════════════════
          2. DESIGN CATEGORIES
          ════════════════════════════════════════ */}
      <section className="py-24 bg-white border-b border-slate-100">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">

          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-16">
            <div className="max-w-2xl">
              <h2 className="text-3xl md:text-4xl font-bold text-slate-900 tracking-tight mb-4">
                Explore by Category
              </h2>
              <p className="text-lg text-slate-600 leading-relaxed">
                Start with the space you want to design, then browse matching ideas on the full designs page.
              </p>
            </div>
            <Link
              href="/designs"
              className="inline-flex items-center gap-1.5 text-sm font-semibold text-primary hover:text-primary/80 transition-colors shrink-0"
            >
              View Full Catalog <ChevronRight className="h-4 w-4" />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-5 gap-6">
            {DESIGN_CATEGORIES.map((category) => (
              <Link
                key={category.title}
                href={category.href}
                className="group relative overflow-hidden rounded-[2rem] border border-slate-200 bg-slate-50 p-8 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-slate-300 hover:shadow-xl hover:shadow-slate-200/60"
              >
                <div className={`absolute inset-0 bg-gradient-to-br ${category.accent} opacity-80 transition-opacity duration-300 group-hover:opacity-100`} />
                <div className="absolute -right-10 -top-10 h-32 w-32 rounded-full bg-white/60 blur-2xl" />
                <div className="relative z-10 flex h-full min-h-56 flex-col">
                  <h3 className="mb-3 text-2xl font-bold text-slate-900">
                    {category.title}
                  </h3>
                  <p className="max-w-xs text-sm leading-6 text-slate-600">
                    {category.description}
                  </p>

                  <div className="mt-auto flex items-center justify-between pt-8">
                    <span className="text-sm font-semibold text-slate-700">
                      View designs
                    </span>
                    <div className="flex h-10 w-10 items-center justify-center rounded-full border border-slate-300/80 bg-white text-slate-700 transition-all duration-300 group-hover:border-slate-900 group-hover:bg-slate-900 group-hover:text-white">
                      <ChevronRight className="h-5 w-5" />
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ════════════════════════════════════════
          3. OUR REAL WORK
          ════════════════════════════════════════ */}
      <section className="py-24 lg:py-32 bg-slate-50">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">

          <div className="mb-16 flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-2xl">
              <p className="mb-3 text-xs font-semibold uppercase tracking-[0.28em] text-slate-500">
                Proof of Delivery
              </p>
              <h2 className="text-3xl md:text-4xl font-bold text-slate-900 tracking-tight mb-4">
                Our Real Work
              </h2>
              <p className="text-lg text-slate-600 leading-relaxed">
                Actual projects delivered for homes and spaces across Haryana. Each one shows the kind of materials,
                finish quality, and execution support customers can expect from our showroom.
              </p>
            </div>
            <Link
              href="/designs"
              className="inline-flex items-center gap-2 text-sm font-semibold text-slate-700 transition-colors hover:text-slate-900"
            >
              Browse all designs <ChevronRight className="h-4 w-4" />
            </Link>
          </div>

          {featuredRealWork ? (
            <div className="grid gap-8 lg:grid-cols-[1.2fr_0.8fr]">
              <div className="group overflow-hidden rounded-[2.5rem] border border-slate-200 bg-white shadow-[0_30px_70px_-35px_rgba(15,23,42,0.35)] transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_35px_90px_-35px_rgba(15,23,42,0.45)]">
                <div className="grid lg:grid-cols-[1.15fr_0.85fr]">
                  <div className="relative min-h-[320px] overflow-hidden bg-slate-100">
                    <Link href={`/designs/${featuredRealWork.slug}`} className="absolute inset-0 z-0">
                      <span className="sr-only">View {featuredRealWork.title}</span>
                    </Link>
                    {getFirstImageUrl(featuredRealWork.images) ? (
                      <Image
                        src={getOptimizedCloudinaryUrl(getFirstImageUrl(featuredRealWork.images))}
                        alt={featuredRealWork.title}
                        fill
                        unoptimized
                        className="object-cover transition-transform duration-700 ease-in-out group-hover:scale-105"
                      />
                    ) : null}
                    <div className="absolute inset-x-0 bottom-0 h-28 bg-gradient-to-t from-slate-950/70 to-transparent" />
                    <div className="absolute left-5 top-5 flex flex-wrap gap-2">
                      <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/90 px-3 py-1 text-xs font-bold tracking-wide text-white shadow-sm">
                        <CheckCircle2 className="h-3.5 w-3.5" />
                        Real Project
                      </span>
                      {featuredRealWork.badge ? (
                        <span className="rounded-full bg-white/90 px-3 py-1 text-xs font-semibold text-slate-700 backdrop-blur-sm">
                          {featuredRealWork.badge}
                        </span>
                      ) : null}
                    </div>
                  </div>

                  <div className="flex flex-col p-8 md:p-10">
                    <p className="mb-3 text-xs font-semibold uppercase tracking-[0.24em] text-slate-500">
                      Featured Delivery
                    </p>
                    <h3 className="mb-3 text-2xl font-bold tracking-tight text-slate-900 md:text-3xl">
                      {featuredRealWork.title}
                    </h3>
                    {featuredRealWork.location ? (
                      <p className="mb-6 inline-flex items-center gap-2 text-sm font-medium text-slate-500">
                        <MapPin className="h-4 w-4 text-slate-400" />
                        {featuredRealWork.location}
                      </p>
                    ) : null}

                    <p className="mb-8 text-sm leading-7 text-slate-600">
                      {featuredRealWork.description}
                    </p>

                    <div className="grid gap-4 rounded-[1.75rem] border border-slate-200 bg-slate-50 p-5 sm:grid-cols-2">
                      <div>
                        <p className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-500">
                          Project Value
                        </p>
                        <p className="mt-2 text-lg font-bold text-slate-900">
                          {featuredRealWork.priceRange || "Custom Quote"}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-500">
                          What You Can See
                        </p>
                        <p className="mt-2 text-lg font-bold text-slate-900">
                          Photos, finishes, and material details
                        </p>
                      </div>
                    </div>

                    <div className="mt-auto flex flex-col gap-3 pt-8 sm:flex-row">
                      <Link
                        href={`/designs/${featuredRealWork.slug}`}
                        className="inline-flex items-center justify-center gap-2 rounded-2xl bg-slate-900 px-6 py-4 text-sm font-semibold text-white transition-colors hover:bg-slate-800"
                      >
                        View Project Details
                        <ChevronRight className="h-4 w-4" />
                      </Link>
                      <a
                        href={waUrl(featuredRealWork.waText || `Hi! I want pricing for a project like ${featuredRealWork.title}`)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center justify-center gap-2 rounded-2xl border border-slate-300 bg-white px-6 py-4 text-sm font-semibold text-slate-700 transition-colors hover:bg-slate-100"
                      >
                        <MessageCircle className="h-4 w-4 text-[#25D366]" />
                        Ask About Similar Work
                      </a>
                    </div>
                  </div>
                </div>
              </div>

              <div className="grid gap-6">
                {additionalRealWork.map((work) => (
                  <Link
                    key={work.id}
                    href={`/designs/${work.slug}`}
                    className="group overflow-hidden rounded-[2rem] border border-slate-200 bg-white shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-slate-200/60"
                  >
                    <div className="grid min-h-full grid-cols-[112px_1fr]">
                      <div className="relative h-full min-h-[170px] overflow-hidden bg-slate-100">
                        {getFirstImageUrl(work.images) ? (
                          <Image
                            src={getOptimizedCloudinaryUrl(getFirstImageUrl(work.images))}
                            alt={work.title}
                            fill
                            unoptimized
                            className="object-cover transition-transform duration-700 group-hover:scale-105"
                          />
                        ) : null}
                      </div>
                      <div className="flex flex-col p-5">
                        <div className="mb-3 flex flex-wrap items-center gap-2">
                          <span className="rounded-full bg-emerald-50 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.2em] text-emerald-700">
                            Real Work
                          </span>
                          {work.location ? (
                            <span className="text-xs font-medium text-slate-500">
                              {work.location}
                            </span>
                          ) : null}
                        </div>
                        <h3 className="mb-2 text-lg font-bold text-slate-900">
                          {work.title}
                        </h3>
                        <p className="line-clamp-3 text-sm leading-6 text-slate-600">
                          {work.description}
                        </p>

                        <div className="mt-auto flex items-center justify-between pt-5">
                          <div>
                            <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-slate-500">
                              Approx. Value
                            </p>
                            <p className="mt-1 text-sm font-bold text-slate-900">
                              {work.priceRange || "Custom Quote"}
                            </p>
                          </div>
                          <span className="inline-flex items-center gap-1 text-sm font-semibold text-slate-700">
                            View Details <ChevronRight className="h-4 w-4" />
                          </span>
                        </div>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          ) : (
            <div className="py-10 text-center text-slate-400">
              No portfolio projects uploaded yet. Visit /admin/marketing.
            </div>
          )}
        </div>
      </section>

      {/* ════════════════════════════════════════
          3. PREMIUM TRUST / TESTIMONIALS
          ════════════════════════════════════════ */}
      <section className="py-24 bg-white border-y border-slate-100 overflow-hidden">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 tracking-tight mb-4">
              Trusted by Haryana's homeowners
            </h2>
            <p className="text-lg text-slate-600">
              Don't just take our word for it. Hundreds of families have built their dream homes using our direct-supply model.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {TESTIMONIALS.map((t, idx) => (
              <div
                key={idx}
                className="relative rounded-[2rem] bg-slate-50 border border-slate-100 p-8 shadow-sm hover:shadow-xl hover:shadow-slate-200/50 transition-all duration-300"
              >
                <div className="flex gap-1 mb-6">
                  {Array.from({ length: t.rating }).map((_, i) => (
                    <Star
                      key={i}
                      className="h-5 w-5 fill-amber-400 text-amber-400"
                    />
                  ))}
                </div>

                <p className="text-slate-700 text-base leading-relaxed mb-8">
                  "{t.text}"
                </p>

                <div className="flex items-center gap-4 mt-auto">
                  <div className="relative h-12 w-12 rounded-full overflow-hidden border-2 border-white shadow-md">
                    <Image src={t.avatar} alt={t.name} fill className="object-cover" />
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-900 text-sm">{t.name}</h4>
                    <p className="text-xs font-medium text-slate-500">
                      {t.project} · {t.location}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ════════════════════════════════════════
          4. SHOWROOM LOCATION
          ════════════════════════════════════════ */}
      <LocationSection />

      {/* ════════════════════════════════════════
          5. MINIMAL POWERFUL CTA (Light Premium Theme)
          ════════════════════════════════════════ */}
      <section className="py-24 lg:py-32 bg-slate-50">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-5xl">
          <div className="relative rounded-[3rem] overflow-hidden bg-white border border-slate-100 p-10 md:p-20 text-center">

            <div className="absolute top-0 right-0 w-96 h-96 rounded-full blur-[128px] pointer-events-none" />
            <div className="absolute bottom-0 left-0 w-96 h-96 rounded-full blur-[128px] pointer-events-none" />

            <div className="relative z-10">
              <h2 className="text-3xl md:text-5xl font-extrabold text-slate-900 mb-6 tracking-tight">
                Get a transparent quote. <br className="hidden md:block" />
                <span className="text-slate-400">No hidden fees.</span>
              </h2>
              <p className="text-lg text-slate-500 mb-10 max-w-2xl mx-auto">
                Share your room layout or carpenter's material list.
                Our team will reply with exact availability and factory-direct pricing.
              </p>

              <div className="flex flex-col sm:flex-row justify-center gap-4">
                <a
                  href={waUrl("Hi! I want a material quote for my interior project. I have a list/design ready.")}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center gap-2 rounded-2xl bg-[#25D366] px-10 py-4 text-lg font-bold text-white hover:bg-[#20bd5a] hover:-translate-y-1 transition-all duration-300 shadow-[0_0_40px_-10px_rgba(37,211,102,0.3)]"
                >
                  <MessageCircle className="h-6 w-6" />
                  Message on WhatsApp
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

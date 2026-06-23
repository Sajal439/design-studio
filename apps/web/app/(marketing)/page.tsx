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
  ArrowRight,
  Phone,
  Sparkles,
} from "lucide-react";
import { BrandLogosBar } from "@/components/marketing/brand-logos-bar";
import { LocationSection } from "@/components/marketing/location-section";
import { siteConfig } from "@/lib/site-config";
import { getFirstImageUrl } from "@/lib/utils";
import { HeroCollage } from "@/components/marketing/hero-collage";

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
    location: "Sector 6, Karnal",
    project: "Modular Kitchen",
    text: "Got material list + price in 20 minutes on WhatsApp. All materials were in stock.",
    rating: 5,
  },
  {
    name: "Priya Gupta",
    location: "Panipat",
    project: "Home Wardrobes",
    text: "Visited the showroom — huge stock, no middleman. Hettich soft-close hinges at better price than online.",
    rating: 5,
  },
  {
    name: "Sandeep Verma",
    location: "Karnal",
    project: "Complete 3BHK",
    text: "They matched the carpenter's list item by item. All materials were in stock. Smooth communication.",
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
  const [heroDesigns, realWork] = await Promise.all([
    prisma.design.findMany({
      select: { images: true },
      orderBy: { createdAt: "desc" },
      take: 12,
    }),
    prisma.design.findMany({
      where: { isRealWork: true },
      orderBy: { createdAt: "desc" },
    }),
  ]);
  const heroImages = heroDesigns.map(d => getFirstImageUrl(d.images)).filter((url): url is string => Boolean(url));

  return (
    <div className="bg-slate-50 font-sans selection:bg-primary/20">

      {/* ════════════════════════════════════════
          1. PREMIUM HERO SECTION
          ════════════════════════════════════════ */}
      <section className="bg-white pt-12 pb-16 md:pt-24 md:pb-28">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-10 items-center">

            {/* Left — Text */}
            <div className="text-center lg:text-left">
              <p className="text-xs font-semibold uppercase tracking-[0.28em] text-slate-500 mb-4">
                Your Trusted Interior Materials Partner
              </p>
              <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-extrabold tracking-tight text-slate-900 leading-[1.05] mb-5">
                Modular Kitchen & Premium Interior Materials in Karnal
              </h1>
              <p className="text-base sm:text-lg text-slate-500 leading-relaxed mb-8 max-w-lg mx-auto lg:mx-0">
                Browse interior design inspirations, estimate materials, and get quotes — all from Goel Traders, your reliable local supplier.
              </p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center lg:justify-start">
                <Link
                  href="/designs"
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-slate-900 px-7 py-4 text-base font-semibold text-white hover:bg-slate-700 transition-all"
                >
                  Explore Designs <ArrowRight className="h-4 w-4" />
                </Link>
                <Link
                  href="/consultation"
                  className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-300 bg-white px-7 py-4 text-base font-semibold text-slate-700 hover:bg-slate-50 transition-all"
                >
                  Book Free Consultation
                </Link>
              </div>
            </div>

            {/* Right — Collage */}
            <HeroCollage images={heroImages} />

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
                Explore Interior Designs by Category
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
          ESTIMATOR PROMO SECTION
          ════════════════════════════════════════ */}
      <section className="py-20 lg:py-28 bg-slate-50">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-5xl">
          <div className="relative overflow-hidden rounded-[2.5rem] bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-10 md:p-16 text-center shadow-2xl">
            {/* Decorative blurred shapes */}
            <div className="absolute -top-20 -right-20 h-60 w-60 rounded-full bg-amber-500/20 blur-[80px] pointer-events-none" />
            <div className="absolute -bottom-20 -left-20 h-60 w-60 rounded-full bg-sky-500/20 blur-[80px] pointer-events-none" />

            <div className="relative z-10">
              <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-white/10 backdrop-blur-sm border border-white/10">
                <Calculator className="h-8 w-8 text-amber-400" />
              </div>

              <h2 className="text-3xl md:text-4xl lg:text-5xl font-extrabold text-white tracking-tight mb-5">
                Know your interior cost{" "}
                <br className="hidden md:block" />
                <span className="text-amber-400">in 2 minutes</span>
              </h2>
              <p className="text-base md:text-lg text-slate-300 leading-relaxed mb-10 max-w-2xl mx-auto">
                Enter your furniture dimensions and get an instant cost breakdown.
                Compare Budget, Medium, and Premium material options — same calculation method contractors use.
              </p>

              <div className="flex flex-wrap justify-center gap-4 mb-10">
                {[
                  "Instant estimate",
                  "No sign-up needed",
                  "3 price tiers",
                  "Real market prices",
                ].map((item) => (
                  <span
                    key={item}
                    className="inline-flex items-center gap-1.5 rounded-full bg-white/10 backdrop-blur-sm border border-white/10 px-4 py-2 text-sm font-medium text-slate-200"
                  >
                    <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                    {item}
                  </span>
                ))}
              </div>

              <Link
                href="/estimator"
                className="inline-flex items-center justify-center gap-2 rounded-2xl bg-white px-10 py-4 text-lg font-bold text-slate-900 hover:bg-slate-100 hover:-translate-y-1 transition-all duration-300 shadow-lg"
              >
                <Calculator className="h-5 w-5" />
                Get Free Estimate
                <ArrowRight className="h-5 w-5" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ════════════════════════════════════════
          3. OUR REAL WORK
          ════════════════════════════════════════ */}
      {realWork.length > 0 && (
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

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {realWork.slice(0, 6).map((work) => (
                  <Link
                    key={work.id}
                    href={`/designs/${work.slug}`}
                    className="group relative rounded-3xl overflow-hidden bg-slate-100 aspect-[4/3] block"
                  >
                    {getFirstImageUrl(work.images) && (
                      <Image
                        src={getOptimizedCloudinaryUrl(getFirstImageUrl(work.images))}
                        alt={work.title}
                        fill
                        unoptimized
                        className="object-cover transition-transform duration-700 group-hover:scale-105"
                      />
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950/75 via-slate-950/10 to-transparent" />
                    <div className="absolute bottom-0 left-0 right-0 p-5">
                      <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/90 px-2.5 py-0.5 text-[11px] font-bold text-white mb-2">
                        Real Work
                      </span>
                      <h3 className="text-base font-bold text-white leading-snug">
                        {work.title}
                      </h3>
                      {work.location && (
                        <p className="mt-1 text-xs text-white/60 flex items-center gap-1">
                          <MapPin className="h-3 w-3" />
                          {work.location}
                        </p>
                      )}
                      <p className="mt-1 text-xs font-semibold text-white/80">
                        {work.priceRange || "Custom Quote"}
                      </p>
                    </div>
                  </Link>
                ))}
              </div>

              {/* Bottom CTA */}
              <div className="mt-10 text-center">
                <a
                  href={waUrl("Hi! I saw your real work projects and want to discuss a similar project.")}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 rounded-2xl bg-[#25D366] px-8 py-4 text-sm font-bold text-white hover:bg-[#20bd5a] transition-all"
                >
                  <MessageCircle className="h-4 w-4" />
                  Ask About Similar Work
                </a>
              </div>
          </div>
        </section>
      )}

      {/* ════════════════════════════════════════
          3. PREMIUM TRUST / TESTIMONIALS
          ════════════════════════════════════════ */}
      < section className="py-24 bg-white border-y border-slate-100 overflow-hidden" >
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 tracking-tight mb-4">
              Trusted by Haryana's homeowners
            </h2>
            <p className="text-lg text-slate-600">
              Don't just take our word for it. Hundreds of families have built their dream homes using our premium range of materials.
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
      </section >

      {/* ════════════════════════════════════════
          CONTACT STRIP — All 3 Lead Channels
          ════════════════════════════════════════ */}
      <section className="py-16 bg-slate-50 border-y border-slate-100">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10">
            <p className="text-xs font-semibold uppercase tracking-[0.28em] text-slate-500 mb-3">
              Get in Touch
            </p>
            <h2 className="text-2xl md:text-3xl font-bold text-slate-900 tracking-tight">
              Ready to start your project?
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5 max-w-4xl mx-auto">
            {/* Phone */}
            <a
              href={`tel:${siteConfig.phone}`}
              className="group flex flex-col items-center gap-4 rounded-[2rem] border border-slate-200 bg-white p-8 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-slate-300 hover:shadow-xl hover:shadow-slate-200/60"
            >
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-50 text-blue-600 transition-colors group-hover:bg-blue-600 group-hover:text-white">
                <Phone className="h-6 w-6" />
              </div>
              <div className="text-center">
                <p className="text-lg font-bold text-slate-900">Call Us</p>
                <p className="text-sm text-slate-500 mt-1">{siteConfig.phone}</p>
                <p className="text-xs text-slate-400 mt-2">Talk to our expert now</p>
              </div>
            </a>

            {/* WhatsApp */}
            <a
              href={waUrl("Hi! I'm interested in interior materials for my project. Can you help?")}
              target="_blank"
              rel="noopener noreferrer"
              className="group flex flex-col items-center gap-4 rounded-[2rem] border border-slate-200 bg-white p-8 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-[#25D366]/40 hover:shadow-xl hover:shadow-green-200/40"
            >
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-green-50 text-[#25D366] transition-colors group-hover:bg-[#25D366] group-hover:text-white">
                <MessageCircle className="h-6 w-6" />
              </div>
              <div className="text-center">
                <p className="text-lg font-bold text-slate-900">WhatsApp</p>
                <p className="text-sm text-slate-500 mt-1">Quick reply guaranteed</p>
                <p className="text-xs text-slate-400 mt-2">Send photos & material lists</p>
              </div>
            </a>

            {/* Consultation */}
            <Link
              href="/consultation"
              className="group flex flex-col items-center gap-4 rounded-[2rem] border border-slate-200 bg-white p-8 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-primary/40 hover:shadow-xl hover:shadow-primary/10"
            >
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 text-primary transition-colors group-hover:bg-primary group-hover:text-white">
                <Sparkles className="h-6 w-6" />
              </div>
              <div className="text-center">
                <p className="text-lg font-bold text-slate-900">Book Consultation</p>
                <p className="text-sm text-slate-500 mt-1">Free expert guidance</p>
                <p className="text-xs text-slate-400 mt-2">Showroom, video, or site visit</p>
              </div>
            </Link>
          </div>
        </div>
      </section>

      {/* ════════════════════════════════════════
          4. SHOWROOM LOCATION
          ════════════════════════════════════════ */}
      < LocationSection />

      {/* ════════════════════════════════════════
          5. MINIMAL POWERFUL CTA (Light Premium Theme)
          ════════════════════════════════════════ */}
      < section className="py-24 lg:py-32 bg-slate-50" >
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-5xl">
          <div className="relative rounded-[3rem] overflow-hidden bg-white border border-slate-100 p-10 md:p-20 text-center">

            <div className="absolute top-0 right-0 w-96 h-96 rounded-full bg-emerald-100 blur-[128px] pointer-events-none" />
            <div className="absolute bottom-0 left-0 w-96 h-96 rounded-full bg-sky-100 blur-[128px] pointer-events-none" />

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
                <a
                  href={`tel:${siteConfig.phone}`}
                  className="inline-flex items-center justify-center gap-2 rounded-2xl border-2 border-slate-200 bg-white px-10 py-4 text-lg font-bold text-slate-700 hover:border-slate-900 hover:bg-slate-900 hover:text-white hover:-translate-y-1 transition-all duration-300"
                >
                  <Phone className="h-6 w-6" />
                  Call Now
                </a>
              </div>
              <div className="mt-5">
                <Link
                  href="/consultation"
                  className="inline-flex items-center gap-1.5 text-sm font-semibold text-primary hover:text-primary/80 transition-colors"
                >
                  Or book a free consultation <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section >
    </div >
  );
}

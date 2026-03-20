import Link from "next/link";
import Image from "next/image";
import { prisma } from "@repo/database";
import {
  MessageCircle,
  Phone,
  MapPin,
  Star,
  ChevronRight,
  Calculator,
  CheckCircle2,
  ShieldCheck,
  TrendingUp,
} from "lucide-react";
import { BrandLogosBar } from "@/components/marketing/brand-logos-bar";
import { siteConfig } from "@/lib/site-config";
import { cn } from "@/lib/utils"; // Assuming a standard shadcn/ui setup

// ── Constants ─────────────────────────────────────────────────────────────────

const WA_BASE = `https://wa.me/91${siteConfig.whatsapp}`;

function waUrl(text: string) {
  return `${WA_BASE}?text=${encodeURIComponent(text)}`;
}

const HERO_WA = waUrl(
  "Hi! I'm looking for interior materials. Can you share prices for my project?"
);



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
  const inspirations = await prisma.design.findMany({
    where: { isRealWork: false },
    take: 6,
  });

  const realWork = await prisma.design.findMany({
    where: { isRealWork: true },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="bg-slate-50 font-sans selection:bg-primary/20">

      {/* ════════════════════════════════════════
          1. PREMIUM HERO SECTION
          ════════════════════════════════════════ */}
      <section className="relative overflow-hidden bg-[#FAFAFA] pt-32 pb-40 md:pt-40 md:pb-48">
        
        {/* Layered Background Depth */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {/* Subtle textured blur image on the right */}
          <div className="absolute -top-32 -right-32 w-[600px] h-[600px] opacity-[0.15] mix-blend-multiply">
            <Image 
              src="https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&q=80&w=800"
              alt="Interior Texture Overlay"
              fill
              className="object-cover rounded-full blur-[80px]"
              unoptimized
            />
          </div>

          {/* Radial glow directly behind the headline */}
          <div className="absolute top-[20%] left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-emerald-100/40 blur-[100px] rounded-[100%]" />
          
          <div className="absolute inset-x-0 bottom-0 h-64 bg-gradient-to-t from-[#FAFAFA] via-[#FAFAFA]/80 to-transparent" />
        </div>

        <div className="relative container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mx-auto text-center z-10 flex flex-col items-center">
              
            <div className="inline-flex items-center justify-center gap-2 rounded-full border border-slate-200/60 bg-white/40 backdrop-blur-xl px-4 py-1.5 text-xs font-semibold text-slate-600 mb-10 tracking-widest uppercase shadow-sm">
              <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
              Karnal's Premium Interior Materials
            </div>

            <h1 className="text-5xl sm:text-6xl lg:text-[5.5rem] font-extrabold tracking-tighter text-slate-900 mb-8 leading-[1.05]">
              Premium interiors, <br className="hidden sm:block" />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-slate-900 via-slate-700 to-slate-500">sourced directly.</span>
            </h1>

            <p className="text-lg sm:text-xl text-slate-600 mb-12 max-w-xl mx-auto leading-relaxed font-medium">
              Authorized dealer for Century Ply, Merino, and Hettich. 
              Skip the middlemen and get your complete bill of materials delivered.
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
                 <span>Factory Direct Pricing</span>
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
          <div className="bg-white rounded-2xl shadow-xl shadow-slate-200/50 p-6 flex items-center justify-center border border-slate-100">
             <BrandLogosBar />
          </div>
      </div>

      {/* ════════════════════════════════════════
          2. DESIGN INSPIRATIONS 
          ════════════════════════════════════════ */}
      <section className="py-24 bg-white border-b border-slate-100">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-16">
            <div className="max-w-2xl">
              <h2 className="text-3xl md:text-4xl font-bold text-slate-900 tracking-tight mb-4">
                Design Inspirations
              </h2>
              <p className="text-lg text-slate-600 leading-relaxed">
                Explore popular styles and get instant pricing for your space. Premium materials sourced directly for your home.
              </p>
            </div>
            <Link
              href="/designs"
              className="inline-flex items-center gap-1.5 text-sm font-semibold text-primary hover:text-primary/80 transition-colors shrink-0"
            >
              View Full Catalog <ChevronRight className="h-4 w-4" />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {inspirations.map((design) => (
              <a
                href={waUrl(design.waText || `Hi! I want pricing for a ${design.title} interior.`)}
                target="_blank"
                rel="noopener noreferrer"
                key={design.id}
                className="group relative rounded-3xl overflow-hidden aspect-[4/5] bg-slate-900 shadow-lg hover:shadow-2xl transition-all duration-500 isolation-isolate block cursor-pointer"
              >
                {/* Background Image */}
                <div className="absolute inset-0 z-0 bg-slate-100">
                  {design.images?.[0] && (
                    <Image 
                      src={getOptimizedCloudinaryUrl(design.images[0])} 
                      alt={design.title}
                      fill
                      unoptimized
                      className="object-cover transition-transform duration-700 ease-in-out group-hover:scale-105 opacity-90 group-hover:opacity-100"
                    />
                  )}
                  {/* Subtle Gradient Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-900/40 to-transparent" />
                </div>

                {/* Content */}
                <div className="relative z-10 flex flex-col h-full p-8 md:p-10 justify-end">
                  <h3 className="text-2xl font-bold text-white mb-2">{design.title}</h3>
                  
                  <div className="flex items-center justify-between mt-auto">
                    <p className="text-sm font-medium text-emerald-300">
                      Explore options
                    </p>
                    <div className="h-10 w-10 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 flex items-center justify-center text-white group-hover:bg-white group-hover:text-slate-900 transition-colors">
                      <ChevronRight className="h-5 w-5" />
                    </div>
                  </div>
                </div>
              </a>
            ))}
            {inspirations.length === 0 && (
               <div className="col-span-full py-10 text-center text-slate-400">
                 No inspirations uploaded yet. Visit /admin/marketing.
               </div>
            )}
          </div>
        </div>
      </section>

      {/* ════════════════════════════════════════
          3. OUR REAL WORK
          ════════════════════════════════════════ */}
      <section className="py-24 lg:py-32 bg-slate-50">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="max-w-2xl mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 tracking-tight mb-4">
              Our Real Work
            </h2>
            <p className="text-lg text-slate-600 leading-relaxed">
              Real projects delivered across Haryana. We supply the exact bill of materials matching your contractor's specifications.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
            {realWork.map((work) => (
              <div key={work.id} className="bg-white rounded-[2rem] shadow-xl shadow-slate-200/40 border border-slate-100 overflow-hidden flex flex-col group transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl hover:shadow-slate-200/60">
                {/* Image Area */}
                <div className="relative aspect-[4/3] w-full overflow-hidden bg-slate-100">
                  {work.images?.[0] && (
                    <Image 
                      src={getOptimizedCloudinaryUrl(work.images[0])} 
                      alt={work.title} 
                      fill 
                      unoptimized
                      className="object-cover transition-transform duration-700 ease-in-out group-hover:scale-105" 
                    />
                  )}
                  {work.badge && (
                    <div className="absolute top-4 left-4 bg-emerald-500/90 backdrop-blur-md text-white px-3 py-1.5 rounded-full text-xs font-bold tracking-wide flex items-center gap-1.5 shadow-sm">
                       <CheckCircle2 className="h-3.5 w-3.5" />
                       {work.badge}
                    </div>
                  )}
                </div>

                {/* Content Area */}
                <div className="flex flex-col flex-1 p-8">
                  <div className="flex items-start justify-between gap-4 mb-4">
                     <div>
                       <h3 className="text-xl font-bold text-slate-900 mb-1">{work.title}</h3>
                       {work.location && (
                         <p className="text-sm font-medium text-slate-500 flex items-center gap-1">
                           <MapPin className="h-3.5 w-3.5 text-slate-400" />
                           {work.location}
                         </p>
                       )}
                     </div>
                  </div>

                  <p className="text-sm text-slate-600 mb-6 flex-1">
                     <span className="font-semibold text-slate-700 block mb-1">Materials Used:</span>
                     {work.description}
                  </p>

                  <div className="flex items-center justify-between pt-6 border-t border-slate-100">
                     <div className="text-sm">
                       <span className="text-slate-500 block mb-0.5 tracking-tight">Project Value Approx.</span>
                       <span className="font-bold text-slate-900">{work.priceRange}</span>
                     </div>
                     <a
                      href={waUrl(work.waText || `Hi! I want pricing for a project like ${work.title}`)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center justify-center h-10 w-10 rounded-full bg-[#25D366]/10 text-[#25D366] hover:bg-[#25D366] hover:text-white transition-colors"
                    >
                      <MessageCircle className="h-5 w-5" />
                    </a>
                  </div>
                </div>
              </div>
            ))}
            {realWork.length === 0 && (
               <div className="col-span-full py-10 text-center text-slate-400">
                 No portfolio projects uploaded yet. Visit /admin/marketing.
               </div>
            )}
          </div>
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
          4. MINIMAL POWERFUL CTA (Light Premium Theme)
          ════════════════════════════════════════ */}
      <section className="py-24 lg:py-32 bg-slate-50">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-5xl">
          <div className="relative rounded-[3rem] overflow-hidden bg-white border border-slate-100 p-10 md:p-20 text-center shadow-[0_20px_60px_-15px_rgba(0,0,0,0.05)]">
            
            {/* Background pattern */}
            <div className="absolute inset-0 opacity-[0.4]" style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23f1f5f9' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`}} />
            
            <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-100/50 rounded-full blur-[128px] pointer-events-none" />
            <div className="absolute bottom-0 left-0 w-96 h-96 bg-blue-100/50 rounded-full blur-[128px] pointer-events-none" />

            <div className="relative z-10">
              <h2 className="text-3xl md:text-5xl font-extrabold text-slate-900 mb-6 tracking-tight">
                Get a transparent quote. <br className="hidden md:block"/> 
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
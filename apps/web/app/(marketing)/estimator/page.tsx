export const dynamic = "force-dynamic";

import type { Metadata } from "next";
import { prisma } from "@repo/database";
import { Badge } from "@/components/ui/badge";
import { EstimatorForm } from "@/components/marketing/estimator-form";
import { Calculator, Layers3, PackageSearch, ShieldCheck } from "lucide-react";
import { loadModuleTemplates } from "@/lib/estimator/templateLoader";
import { loadPriceBook } from "@/lib/estimator/priceBookLoader";
import { loadProductCatalog } from "@/lib/estimator/productCatalogLoader";

export const metadata: Metadata = {
  title: "Material Estimator | Goel Traders Design Studio",
  description:
    "Calculate the exact materials needed for your interior project. Get instant estimates for plywood, laminates, hardware, and more.",
};

async function getDesignCategories() {
  const categories = await prisma.category.findMany({
    where: { type: "design" },
    orderBy: { label: "asc" },
  });

  const designs = await prisma.design.findMany({
    include: { materials: true },
    orderBy: { title: "asc" },
  });

  return categories.map((cat) => ({
    id: cat.id,
    slug: cat.slug,
    label: cat.label,
    designs: designs
      .filter((d) => d.categoryId === cat.id)
      .map((d) => ({
        id: d.id,
        title: d.title,
        slug: d.slug,
        roomSize: d.roomSize || "10x10",
        style: d.style || "Modern",
        estimatedCost: d.estimatedCost || "Calculated",
        materials: d.materials.map((m) => ({
          material: {
            name: m.name,
            baseQty: m.quantity,
            unit: m.unit,
            scaling: "AREA",
          },
        })),
      })),
  }));
}

const highlights = [
  {
    icon: Layers3,
    title: "Module-led planning",
    copy: "Layouts become cabinet modules before materials are counted.",
  },
  {
    icon: PackageSearch,
    title: "Contractor-grade BOM",
    copy: "See sheets, hardware, waste, and purchase-ready quantities.",
  },
  {
    icon: ShieldCheck,
    title: "Lead-ready output",
    copy: "Save estimates, print PDFs, and move straight into site visits.",
  },
];

export default async function EstimatorPage() {
  const [categories, templateMap, priceBook, productCatalog] = await Promise.all([
    getDesignCategories(),
    loadModuleTemplates(),
    loadPriceBook(),
    loadProductCatalog()
  ]);

  const serialisedCatalog = {
    bySlug: Object.fromEntries(productCatalog.bySlug),
    mappings: productCatalog.mappings.map((m) => ({
      pattern: m.pattern.source,
      flags: m.pattern.flags,
      productSlugs: m.productSlugs,
      reason: m.reason,
    })),
  };
  return (
    <div className="relative overflow-hidden py-10 md:py-14">
      <div className="absolute inset-x-0 top-0 -z-10 h-[520px] bg-[radial-gradient(circle_at_top_left,_rgba(199,120,53,0.18),_transparent_34%),radial-gradient(circle_at_top_right,_rgba(35,71,52,0.12),_transparent_28%),linear-gradient(180deg,_rgba(249,246,239,0.92),_rgba(255,255,255,0))]" />
      <div className="container mx-auto space-y-10 px-4">
        <section className="relative overflow-hidden rounded-[2rem] border border-foreground/10 bg-[linear-gradient(135deg,rgba(255,251,245,0.98),rgba(248,244,236,0.9))] px-6 py-8 shadow-[0_24px_80px_rgba(15,23,42,0.08)] md:px-10 md:py-10">
          <div className="absolute -right-10 top-6 h-40 w-40 rounded-full bg-[radial-gradient(circle,_rgba(191,132,64,0.24),_transparent_70%)] blur-2xl" />
          <div className="absolute bottom-0 left-0 h-32 w-56 bg-[linear-gradient(135deg,rgba(34,74,57,0.12),transparent_70%)]" />
          <div className="grid gap-8 lg:grid-cols-[1.15fr_0.85fr] lg:items-end">
            <div className="space-y-5">
              <Badge className="rounded-full bg-foreground text-background hover:bg-foreground/90">
                Interior Planning Tool
              </Badge>
              <div className="space-y-3">
                <h1 className="max-w-3xl text-4xl font-semibold tracking-[-0.04em] text-balance md:text-5xl lg:text-6xl">
                  Material estimator with a cleaner workflow and smarter project output.
                </h1>
                <p className="max-w-2xl text-base leading-7 text-muted-foreground md:text-lg">
                  Build a room estimate the way a studio team would: choose a category, pick a reference,
                  define the layout, and get a polished BOM with cost layers and contractor-ready details.
                </p>
              </div>
              <div className="flex flex-wrap gap-3 text-sm">
                <div className="rounded-full border border-foreground/10 bg-background/80 px-4 py-2 shadow-sm">
                  6 interior categories
                </div>
                <div className="rounded-full border border-foreground/10 bg-background/80 px-4 py-2 shadow-sm">
                  Layout-based estimation
                </div>
                <div className="rounded-full border border-foreground/10 bg-background/80 px-4 py-2 shadow-sm">
                  Print-friendly result sheets
                </div>
              </div>
            </div>
            <div className="grid gap-3">
              {highlights.map((item) => (
                <div
                  key={item.title}
                  className="flex items-start gap-4 rounded-2xl border border-foreground/10 bg-background/75 p-4 backdrop-blur"
                >
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                    <item.icon className="h-5 w-5" />
                  </div>
                  <div className="space-y-1">
                    <p className="font-semibold">{item.title}</p>
                    <p className="text-sm leading-6 text-muted-foreground">{item.copy}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div className="mt-8 flex items-center gap-3 rounded-[1.5rem] border border-foreground/10 bg-foreground px-4 py-3 text-sm text-background shadow-lg md:w-fit">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-background/10">
              <Calculator className="h-5 w-5" />
            </div>
            <div>
              <p className="font-medium">Fast estimate flow</p>
              <p className="text-background/70">Category, layout, dimensions, result, callback.</p>
            </div>
          </div>
        </section>

        <EstimatorForm categories={categories} moduleTemplates={templateMap} priceBook={priceBook} productCatalog={serialisedCatalog} />;
      </div>
    </div>
  );
}

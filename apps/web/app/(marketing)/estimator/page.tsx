export const dynamic = "force-dynamic";

import type { Metadata } from "next";
import { prisma } from "@repo/database";
import { EstimatorForm } from "@/components/marketing/estimator-form";
import { Calculator } from "lucide-react";

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
    slug: cat.slug,
    label: cat.label,
    designs: designs
      .filter((d) => d.categoryId === cat.id)
      .map((d) => ({
        title: d.title,
        slug: d.slug,
        roomSize: d.roomSize,
        style: d.style,
        estimatedCost: d.estimatedCost,
        materials: d.materials.map((m) => ({
          name: m.name,
          quantity: m.quantity,
          unit: m.unit,
        })),
      })),
  }));
}

export default async function EstimatorPage() {
  const categories = await getDesignCategories();

  return (
    <div className="py-12">
      <div className="container mx-auto px-4">
        {/* Hero Section */}
        <div className="mb-12 text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10">
            <Calculator className="h-8 w-8 text-primary" />
          </div>
          <h1 className="mb-3 text-4xl font-bold tracking-tight">Material Estimator</h1>
          <p className="mx-auto max-w-2xl text-lg text-muted-foreground">
            Get an instant estimate of all the materials you&apos;ll need for your interior project.
            Just select a design, enter your room dimensions, and we&apos;ll calculate everything for you.
          </p>
        </div>

        {/* Estimator Form */}
        <EstimatorForm categories={categories} />
      </div>
    </div>
  );
}

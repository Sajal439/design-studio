export const dynamic = "force-dynamic";

import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@repo/database";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ArrowLeft, ShoppingBag, Phone, Package } from "lucide-react";
import type { Metadata } from "next";
import { DesignEstimator } from "@/components/marketing/estimator/design-estimator";
import { SaveDesignButton } from "@/components/marketing/save-design-button";
import { AddToProjectDialog } from "@/components/marketing/add-to-project-dialog";

async function getDesign(slug: string) {
  return prisma.design.findUnique({ where: { slug }, include: { category: true, materials: true } });
}

async function getSimilarDesigns(categoryId: string, excludeSlug: string) {
  return prisma.design.findMany({
    where: { categoryId, slug: { not: excludeSlug } },
    select: { slug: true, title: true, style: true, images: true, estimatedCost: true },
    take: 3,
  });
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const design = await getDesign(slug);
  if (!design) return { title: "Design Not Found" };

  return {
    title: `${design.title} | Goel Traders Design Studio`,
    description: design.description,
    openGraph: {
      title: design.title,
      description: design.description,
      images: design.images[0] ? [{ url: design.images[0] }] : undefined,
    },
  };
}

export default async function DesignDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const design = await getDesign(slug);
  if (!design) notFound();

  const similarDesigns = await getSimilarDesigns(design.categoryId, design.slug);

  return (
    <div className="py-12">
      <div className="container mx-auto px-4">
        <Link href="/designs" className="mb-6 inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"><ArrowLeft className="h-4 w-4" /> Back to Gallery</Link>
        <div className="grid gap-10 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <div className="relative mb-4 aspect-video overflow-hidden rounded-xl bg-muted">
              {design.images[0] ? <Image alt={design.title} className="object-cover" fill sizes="(max-width: 1024px) 100vw, 66vw" src={design.images[0]} /> : null}
            </div>
            {design.images.length > 1 ? (
              <div className="mb-6 grid gap-3 sm:grid-cols-3">
                {design.images.slice(1).map((image: string, index: number) => (
                  <div key={`${image}-${index}`} className="relative aspect-video overflow-hidden rounded-lg bg-muted">
                    <Image alt={`${design.title} view ${index + 2}`} className="object-cover" fill sizes="33vw" src={image} />
                  </div>
                ))}
              </div>
            ) : null}
            <div className="mb-3 flex items-center gap-3"><Badge>{design.category.label}</Badge><Badge variant="outline">{design.style}</Badge></div>
            <h1 className="mb-2 text-3xl font-bold">{design.title}</h1>
            <p className="mb-6 leading-relaxed text-muted-foreground">{design.description}</p>
            <Card>
              <CardHeader><CardTitle className="flex items-center gap-2"><Package className="h-5 w-5" /> Material Breakdown</CardTitle></CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {design.materials.map((mat: { id: string; name: string; quantity: number; unit: string }) => (
                    <div key={mat.id} className="flex items-center justify-between rounded-lg bg-muted/50 px-4 py-3">
                      <span className="text-muted-foreground">{mat.name}</span>
                      <span className="font-medium">{mat.quantity} {mat.unit}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="space-y-6">
            <Card>
              <CardContent className="p-6">
                <p className="mb-1 text-sm text-muted-foreground">Estimated Cost</p>
                <p className="mb-1 text-2xl font-bold">{design.estimatedCost}</p>
                <p className="mb-4 text-xs text-muted-foreground">varies by material choice & location</p>
                <Separator className="mb-4" />
                <div className="space-y-3">
                  <Button className="w-full" size="lg" asChild><Link href={`/quote?design=${design.slug}`}><ShoppingBag className="mr-2 h-4 w-4" /> Request Quote</Link></Button>
                  <Button className="w-full" size="lg" variant="outline" asChild><Link href="/consultation"><Phone className="mr-2 h-4 w-4" /> Book Consultation</Link></Button>
                  <div className="flex gap-2">
                    <SaveDesignButton designId={design.id} compact={false} className="flex-1" />
                    <AddToProjectDialog designId={design.id} className="flex-1" />
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6">
                <h3 className="mb-4 font-semibold">Quick Facts</h3>
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between"><span className="text-muted-foreground">Category</span><span className="font-medium">{design.category.label}</span></div>
                  <Separator />
                  <div className="flex justify-between"><span className="text-muted-foreground">Style</span><span className="font-medium">{design.style}</span></div>
                  <Separator />
                  <div className="flex justify-between"><span className="text-muted-foreground">Room Size</span><span className="font-medium">{design.roomSize}</span></div>
                  <Separator />
                  <div className="flex justify-between"><span className="text-muted-foreground">Materials</span><span className="font-medium">{design.materials.length} items</span></div>
                </div>
              </CardContent>
            </Card>

            {/* Inline Estimator */}
            <DesignEstimator
              design={{
                title: design.title,
                slug: design.slug,
                roomSize: design.roomSize,
                materials: design.materials.map((m: { name: string; quantity: number; unit: string }) => ({
                  name: m.name,
                  quantity: m.quantity,
                  unit: m.unit,
                })),
              }}
            />
          </div>
        </div>
      </div>

      {/* ── Similar Designs ── */}
      {similarDesigns.length > 0 && (
        <div className="container mx-auto px-4 py-10">
          <h2 className="mb-6 text-2xl font-bold">Similar Designs</h2>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {similarDesigns.map((d) => (
              <Link
                key={d.slug}
                href={`/designs/${d.slug}`}
                className="group rounded-2xl border bg-background overflow-hidden transition-all hover:-translate-y-1 hover:shadow-md"
              >
                <div className="relative aspect-video overflow-hidden bg-muted">
                  {d.images[0] ? (
                    <Image
                      alt={d.title}
                      src={d.images[0]}
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
        </div>
      )}
    </div>
  );
}

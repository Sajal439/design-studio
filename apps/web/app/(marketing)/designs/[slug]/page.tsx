export const dynamic = "force-dynamic";

import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@repo/database";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ArrowLeft, MessageCircle, Phone, Package } from "lucide-react";
import type { Metadata } from "next";
import { siteConfig } from "@/lib/site-config";
import { getFirstImageUrl } from "@/lib/utils";

async function getDesign(slug: string) {
  return prisma.design.findUnique({ where: { slug }, include: { category: true } });
}

async function getSimilarDesigns(categoryId: string, excludeSlug: string) {
  return prisma.design.findMany({
    where: { categoryId, slug: { not: excludeSlug } },
    select: { slug: true, title: true, style: true, images: true, estimatedCost: true, category: true },
    take: 3,
  });
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const design = await getDesign(slug);
  if (!design) return { title: "Design Not Found" };

  return {
    title: `${design.title} | ${siteConfig.name}`,
    description: design.description || "",
    openGraph: {
      title: design.title,
      description: design.description || "",
      images: getFirstImageUrl(design.images) ? [{ url: getFirstImageUrl(design.images)! }] : undefined,
    },
  };
}

export default async function DesignDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const design = await getDesign(slug);
  if (!design) notFound();

  const similarDesigns = await getSimilarDesigns(design.categoryId, design.slug);

  const waText = encodeURIComponent(
    `Hi! I'm interested in "${design.title}" (${design.estimatedCost}). Can you share the exact price?`
  );
  const waUrl = `https://wa.me/91${siteConfig.whatsapp}?text=${waText}`;

  return (
    <div className="py-12">
      <div className="container mx-auto px-4">
        <Link
          href="/designs"
          className="mb-6 inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" /> Back to Gallery
        </Link>

        <div className="grid gap-10 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <div className="relative mb-4 aspect-video overflow-hidden rounded-xl bg-muted">
              {getFirstImageUrl(design.images) ? (
                <Image
                  alt={design.title}
                  className="object-cover"
                  fill
                  sizes="(max-width: 1024px) 100vw, 66vw"
                  src={getFirstImageUrl(design.images)!}
                />
              ) : null}
            </div>

            {Array.isArray(design.images) && design.images.length > 1 ? (
              <div className="mb-6 grid gap-3 sm:grid-cols-3">
                {(design.images as any[]).slice(1).map((image: any, index: number) => (
                  <div key={`${image.url}-${index}`} className="relative aspect-video overflow-hidden rounded-lg bg-muted">
                    <Image
                      alt={`${design.title} view ${index + 2}`}
                      className="object-cover"
                      fill
                      sizes="33vw"
                      src={image.url}
                    />
                  </div>
                ))}
              </div>
            ) : null}

            <div className="mb-3 flex items-center gap-3">
              <Badge>{design.category?.label}</Badge>
              {design.style && <Badge variant="outline">{design.style}</Badge>}
            </div>
            <h1 className="mb-2 text-3xl font-bold">{design.title}</h1>
            <p className="mb-6 leading-relaxed text-muted-foreground">{design.description}</p>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Package className="h-5 w-5" /> Requirements & Actions
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {/* Primary Call to Action: WhatsApp */}
                  <a
                    href={waUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex w-full items-center justify-center gap-2 rounded-lg bg-[#25D366] px-4 py-3 text-sm font-medium text-white hover:bg-[#22c55e] active:bg-[#16a34a] transition-colors"
                  >
                    <MessageCircle className="h-4 w-4" />
                    Get Price on WhatsApp
                  </a>

                  {/* Secondary Call to Action: Call */}
                  <a
                    href={`tel:${siteConfig.phone}`}
                    className="flex w-full items-center justify-center gap-2 rounded-lg border border-input bg-background px-4 py-3 text-sm font-medium hover:bg-muted transition-colors"
                  >
                    <Phone className="h-4 w-4" />
                    Call {siteConfig.phone}
                  </a>

                  {/* Trust signal */}
                  <p className="text-xs text-center text-muted-foreground mt-2">
                    Available at our Karnal showroom · Usually responds within 1 hr
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="space-y-6">
            <Card>
              <CardContent className="p-6">
                <p className="mb-1 text-sm text-muted-foreground">Estimated Cost</p>
                <p className="mb-1 text-2xl font-bold">{design.estimatedCost || "Custom"}</p>
                <p className="text-xs text-muted-foreground">varies by material choice & location</p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <h3 className="mb-4 font-semibold">Quick Facts</h3>
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Category</span>
                    <span className="font-medium">{design.category?.label}</span>
                  </div>
                  <Separator />
                  {design.style && (
                    <>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Style</span>
                        <span className="font-medium">{design.style}</span>
                      </div>
                      <Separator />
                    </>
                  )}
                  {design.roomSize && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Room Size</span>
                      <span className="font-medium">{design.roomSize}</span>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {similarDesigns.length > 0 && (
        <div className="container mx-auto px-4 py-10 border-t mt-12">
          <h2 className="mb-6 text-2xl font-bold">Similar Designs</h2>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {similarDesigns.map((d: any) => (
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
                  {d.style && <Badge variant="outline" className="mb-2">{d.style}</Badge>}
                  <h3 className="font-semibold">{d.title}</h3>
                  <p className="mt-1 text-sm text-muted-foreground">{d.category?.label} • {d.estimatedCost || "Custom"}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

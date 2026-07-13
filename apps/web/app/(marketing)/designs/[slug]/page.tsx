export const dynamic = "force-dynamic";

import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@repo/database";
import { Card, CardContent, CardHeader, CardTitle } from "@repo/ui/card";
import { Badge } from "@repo/ui/badge";
import { Separator } from "@repo/ui/separator";
import { ArrowLeft, GalleryHorizontal, MapPin, MessageCircle, Phone, Package } from "lucide-react";
import type { Metadata } from "next";
import { DesignSaveButton } from "@/components/marketing/design-save-button";
import { siteConfig } from "@/lib/site-config";
import { buildWhatsAppUrl, getFirstImageUrl, normalizeDesignImages } from "@/lib/utils";

async function getDesign(slug: string) {
  return prisma.design.findFirst({ where: { slug, isPublished: true }, include: { category: true } });
}

async function getSimilarDesigns(categoryId: string, excludeSlug: string) {
  return prisma.design.findMany({
    where: { categoryId, slug: { not: excludeSlug }, isPublished: true },
    select: { slug: true, title: true, style: true, images: true, estimatedCost: true, category: true },
    take: 3,
  });
}

type SimilarDesign = Awaited<ReturnType<typeof getSimilarDesigns>>[number];

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const design = await getDesign(slug);
  if (!design) return { title: "Design Not Found" };

  return {
    title: `${design.title} | ${siteConfig.name}`,
    description: design.description || "",
    alternates: {
      canonical: `/designs/${slug}`,
    },
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

  const waText =
    `Hi! I'm interested in "${design.title}" (${design.estimatedCost || design.priceRange || "custom"}). Can you share the exact price?`
  ;
  const waUrl = buildWhatsAppUrl(`91${siteConfig.whatsapp}`, waText);
  const galleryImages = normalizeDesignImages(design.images);
  const isRealProject = design.isRealWork;

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: design.title,
    image: getFirstImageUrl(design.images) ? [getFirstImageUrl(design.images)] : [],
    description: design.description,
    brand: {
      "@type": "Brand",
      name: siteConfig.name,
    },
    offers: {
      "@type": "Offer",
      url: `${siteConfig.url}/designs/${slug}`,
      priceCurrency: "INR",
      price: design.priceRange ? design.priceRange.replace(/[^0-9]/g, '') || "150000" : "150000",
      availability: "https://schema.org/InStock",
      seller: {
        "@type": "Organization",
        name: siteConfig.name,
      },
    },
  };

  return (
    <div className="py-12">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
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

            {galleryImages.length > 1 ? (
              <div className="mb-6">
                <div className="mb-3 flex items-center gap-2 text-sm font-semibold text-slate-700">
                  <GalleryHorizontal className="h-4 w-4" />
                  {isRealProject ? "Project Gallery" : "More Views"}
                </div>
                <div className="grid gap-3 sm:grid-cols-3">
                  {galleryImages.slice(1).map((image, index) => (
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
              </div>
            ) : null}

            <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
              <div className="flex flex-wrap items-center gap-3">
                <Badge>{design.category?.label}</Badge>
                {design.style && <Badge variant="outline">{design.style}</Badge>}
                {isRealProject ? (
                  <Badge variant="outline" className="border-emerald-200 bg-emerald-50 text-emerald-700">
                    Real Project
                  </Badge>
                ) : null}
              </div>
              <DesignSaveButton
                variant="inline"
                design={{
                  slug: design.slug,
                  title: design.title,
                  imageUrl: getFirstImageUrl(design.images),
                  categoryLabel: design.category?.label,
                  estimatedCost: design.estimatedCost,
                }}
              />
            </div>
            <h1 className="mb-2 text-3xl font-bold">{design.title}</h1>
            <div className="prose prose-slate max-w-none mb-10">
              <p className="lead text-lg text-muted-foreground leading-relaxed mb-6">{design.description}</p>
              
              <h2 className="text-xl font-bold mt-8 mb-4">Design Overview</h2>
              <p className="text-muted-foreground leading-relaxed mb-6">
                This {design.title.toLowerCase()} is designed for modern homes in Haryana, focusing on {design.style ? design.style.toLowerCase() : "contemporary"} aesthetics and optimal space utilization. 
                Our {design.category?.label?.toLowerCase() || "interior"} designs use premium materials from trusted brands like Century Ply, Greenply, and Hettich to ensure longevity and a pristine finish.
                {design.roomSize ? ` This layout is particularly well-suited for rooms around ${design.roomSize}.` : ""}
              </p>

              <h2 className="text-xl font-bold mt-8 mb-4">Material Specifications</h2>
              <div className="overflow-x-auto mb-6">
                <table className="min-w-full border text-sm text-left">
                  <thead className="bg-muted text-muted-foreground">
                    <tr>
                      <th className="px-4 py-3 font-semibold border-b">Component</th>
                      <th className="px-4 py-3 font-semibold border-b">Specification / Brand</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    <tr className="bg-background">
                      <td className="px-4 py-3 font-medium border-r">Core Material</td>
                      <td className="px-4 py-3">BWR/BWP Plywood (Century Ply / Greenply) or HDHMR (Action TESA)</td>
                    </tr>
                    <tr className="bg-muted/30">
                      <td className="px-4 py-3 font-medium border-r">Exterior Finish</td>
                      <td className="px-4 py-3">1mm Premium Laminate (Merino) or High-Gloss Acrylic</td>
                    </tr>
                    <tr className="bg-background">
                      <td className="px-4 py-3 font-medium border-r">Hardware & Hinges</td>
                      <td className="px-4 py-3">Soft-close hinges and channels (Hettich / Hafele / Godrej)</td>
                    </tr>
                    <tr className="bg-muted/30">
                      <td className="px-4 py-3 font-medium border-r">Edge Banding</td>
                      <td className="px-4 py-3">Machine-pressed Rehau PVC edge banding</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <h2 className="text-xl font-bold mt-8 mb-4">Frequently Asked Questions</h2>
              <div className="space-y-4">
                <div className="border rounded-lg p-5 bg-background">
                  <h3 className="font-semibold text-base mb-2">What is the estimated cost for this {design.category?.label?.toLowerCase() || "design"}?</h3>
                  <p className="text-sm text-muted-foreground">The cost for this design typically falls around {design.estimatedCost || design.priceRange || "₹1,50,000"}. The exact price will depend on your specific room dimensions and the exact finishes you select. You can use our estimator tool to get a more accurate quote.</p>
                </div>
                <div className="border rounded-lg p-5 bg-background">
                  <h3 className="font-semibold text-base mb-2">Can this design be customized for my space?</h3>
                  <p className="text-sm text-muted-foreground">Absolutely. Every design we showcase is 100% customizable. Our experts can adjust the layout, color palette, and storage configuration to perfectly match your room size and personal requirements.</p>
                </div>
                <div className="border rounded-lg p-5 bg-background">
                  <h3 className="font-semibold text-base mb-2">Are the materials guaranteed?</h3>
                  <p className="text-sm text-muted-foreground">Yes, as authorized dealers, we provide 100% genuine materials with manufacturer warranties. Plywoods come with borer and termite warranties, and hardware components like Hettich hinges come with lifetime functional warranties.</p>
                </div>
              </div>
            </div>
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Package className="h-5 w-5" /> {isRealProject ? "Project Details & Actions" : "Requirements & Actions"}
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
                    {isRealProject ? "Ask About Similar Work" : "Get Price on WhatsApp"}
                  </a>

                  {/* Secondary Call to Action: Call */}
                  <a
                    href={`tel:${siteConfig.phone}`}
                    className="flex w-full items-center justify-center gap-2 rounded-lg border border-input bg-background px-4 py-3 text-sm font-medium hover:bg-muted transition-colors"
                  >
                    <Phone className="h-4 w-4" />
                    {isRealProject ? "Call the Showroom" : `Call ${siteConfig.phone}`}
                  </a>

                  {/* Trust signal */}
                  <p className="text-xs text-center text-muted-foreground mt-2">
                    {isRealProject
                      ? "Visit the showroom to compare finishes and discuss a similar project with our team."
                      : "Available at our Karnal showroom · Usually responds within 1 hr"}
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="space-y-6">
            <Card>
              <CardContent className="p-6">
                <p className="mb-1 text-sm text-muted-foreground">
                  {isRealProject ? "Project Value Approx." : "Estimated Cost"}
                </p>
                <p className="mb-1 text-2xl font-bold">{design.priceRange || design.estimatedCost || "Custom"}</p>
                <p className="text-xs text-muted-foreground">
                  {isRealProject ? "reference budget for a similar scope and finish level" : "varies by material choice & location"}
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <h3 className="mb-4 font-semibold">{isRealProject ? "Project Snapshot" : "Quick Facts"}</h3>
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Category</span>
                    <span className="font-medium">{design.category?.label}</span>
                  </div>
                  <Separator />
                  {design.location && (
                    <>
                      <div className="flex justify-between gap-4">
                        <span className="text-muted-foreground">Location</span>
                        <span className="flex items-center gap-1 font-medium text-right">
                          <MapPin className="h-3.5 w-3.5 text-slate-400" />
                          {design.location}
                        </span>
                      </div>
                      <Separator />
                    </>
                  )}
                  {design.badge && (
                    <>
                      <div className="flex justify-between gap-4">
                        <span className="text-muted-foreground">Highlight</span>
                        <span className="font-medium text-right">{design.badge}</span>
                      </div>
                      <Separator />
                    </>
                  )}
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
          <h2 className="mb-6 text-2xl font-bold">{isRealProject ? "More Designs to Explore" : "Similar Designs"}</h2>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {similarDesigns.map((d: SimilarDesign) => (
              <div
                key={d.slug}
                className="group relative rounded-2xl border bg-background overflow-hidden transition-all hover:-translate-y-1 hover:shadow-md"
              >
                <DesignSaveButton
                  design={{
                    slug: d.slug,
                    title: d.title,
                    imageUrl: getFirstImageUrl(d.images),
                    categoryLabel: d.category?.label,
                    estimatedCost: d.estimatedCost,
                  }}
                  className="absolute top-3 right-3 z-10"
                />
                <Link
                  href={`/designs/${d.slug}`}
                  className="block"
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
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

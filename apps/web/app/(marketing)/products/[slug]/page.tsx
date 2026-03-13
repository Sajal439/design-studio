export const dynamic = "force-dynamic";

import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@repo/database";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ArrowLeft, ShoppingBag, CheckCircle, ClipboardList } from "lucide-react";
import type { Metadata } from "next";

async function getProduct(slug: string) {
  return prisma.product.findUnique({ where: { slug }, include: { category: true, specifications: true } });
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const product = await getProduct(slug);
  if (!product) return { title: "Product Not Found" };

  return {
    title: `${product.name} | Goel Traders`,
    description: product.description,
    openGraph: {
      title: product.name,
      description: product.description,
      images: product.images[0] ? [{ url: product.images[0] }] : undefined,
    },
  };
}

export default async function ProductDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const product = await getProduct(slug);
  if (!product) notFound();

  return (
    <div className="py-12">
      <div className="container mx-auto px-4">
        <Link href="/products" className="mb-6 inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"><ArrowLeft className="h-4 w-4" /> Back to Products</Link>
        <div className="grid gap-10 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <div className="relative mb-4 aspect-[16/10] overflow-hidden rounded-xl bg-muted">
              {product.images[0] ? <Image alt={product.name} className="object-cover" fill sizes="(max-width: 1024px) 100vw, 66vw" src={product.images[0]} /> : null}
            </div>
            {product.images.length > 1 ? (
              <div className="mb-6 grid gap-3 sm:grid-cols-3">
                {product.images.slice(1).map((image: string, index: number) => (
                  <div key={`${image}-${index}`} className="relative aspect-video overflow-hidden rounded-lg bg-muted">
                    <Image alt={`${product.name} view ${index + 2}`} className="object-cover" fill sizes="33vw" src={image} />
                  </div>
                ))}
              </div>
            ) : null}
            <div className="mb-3 flex items-center gap-3">
              <Badge>{product.category.label}</Badge>
              <Badge variant="outline">{product.brand}</Badge>
              {product.inStock ? <span className="flex items-center gap-1 text-sm text-green-600"><CheckCircle className="h-4 w-4" /> In Stock</span> : null}
            </div>
            <h1 className="mb-2 text-3xl font-bold">{product.name}</h1>
            <p className="mb-6 leading-relaxed text-muted-foreground">{product.description}</p>
            <Card>
              <CardHeader><CardTitle className="flex items-center gap-2"><ClipboardList className="h-5 w-5" /> Specifications</CardTitle></CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {product.specifications.map((spec: { id: string; label: string; value: string }) => (
                    <div key={spec.id} className="flex items-center justify-between rounded-lg bg-muted/50 px-4 py-3">
                      <span className="text-muted-foreground">{spec.label}</span>
                      <span className="font-medium">{spec.value}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
          <div className="space-y-6">
            <Card>
              <CardContent className="p-6">
                <p className="mb-1 text-sm text-muted-foreground">Price Range</p>
                <p className="mb-1 text-2xl font-bold">{product.priceRange}</p>
                <p className="mb-4 text-xs text-muted-foreground">per {product.unit} • prices vary by quantity</p>
                <Separator className="mb-4" />
                <div className="space-y-3">
                  <Button className="w-full" size="lg" asChild><Link href={`/quote?product=${product.slug}`}><ShoppingBag className="mr-2 h-4 w-4" /> Request Price</Link></Button>
                  <Button className="w-full" size="lg" variant="outline" asChild><Link href="/consultation">Book Consultation</Link></Button>
                </div>
                <p className="mt-4 text-center text-xs text-muted-foreground">Bulk pricing available for contractors</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6">
                <h3 className="mb-4 font-semibold">Product Info</h3>
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between"><span className="text-muted-foreground">Category</span><span className="font-medium">{product.category.label}</span></div>
                  <Separator />
                  <div className="flex justify-between"><span className="text-muted-foreground">Brand</span><span className="font-medium">{product.brand}</span></div>
                  <Separator />
                  <div className="flex justify-between"><span className="text-muted-foreground">Unit</span><span className="font-medium capitalize">{product.unit}</span></div>
                  <Separator />
                  <div className="flex justify-between"><span className="text-muted-foreground">Availability</span><span className="font-medium text-green-600">{product.inStock ? "In Stock" : "Out of Stock"}</span></div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}


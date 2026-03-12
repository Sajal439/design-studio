import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@repo/database";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ArrowLeft, ShoppingBag, Phone, Package } from "lucide-react";
import type { Metadata } from "next";

async function getDesign(slug: string) {
  return prisma.design.findUnique({
    where: { slug },
    include: { category: true, materials: true },
  });
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const design = await getDesign(slug);
  if (!design) return { title: "Design Not Found" };

  return {
    title: `${design.title} | Goel Traders Design Studio`,
    description: design.description,
    openGraph: {
      title: design.title,
      description: design.description,
    },
  };
}

export default async function DesignDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const design = await getDesign(slug);

  if (!design) notFound();

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
          {/* Left: Design Info */}
          <div className="lg:col-span-2">
            <div className="aspect-video rounded-xl bg-gradient-to-br from-muted to-muted/50 flex items-center justify-center mb-6">
              <span className="text-7xl opacity-30">🏠</span>
            </div>

            <div className="mb-3 flex items-center gap-3">
              <Badge>{design.category.label}</Badge>
              <Badge variant="outline">{design.style}</Badge>
            </div>

            <h1 className="mb-2 text-3xl font-bold">{design.title}</h1>
            <p className="mb-6 text-muted-foreground leading-relaxed">{design.description}</p>

            {/* Materials Breakdown */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Package className="h-5 w-5" /> Material Breakdown
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {design.materials.map((mat: { id: string; name: string; quantity: number; unit: string }) => (
                    <div
                      key={mat.id}
                      className="flex items-center justify-between rounded-lg bg-muted/50 px-4 py-3"
                    >
                      <span className="text-muted-foreground">{mat.name}</span>
                      <span className="font-medium">
                        {mat.quantity} {mat.unit}
                      </span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right: Sidebar */}
          <div className="space-y-6">
            <Card>
              <CardContent className="p-6">
                <p className="mb-1 text-sm text-muted-foreground">Estimated Cost</p>
                <p className="mb-1 text-2xl font-bold">{design.estimatedCost}</p>
                <p className="mb-4 text-xs text-muted-foreground">varies by material choice & location</p>
                <Separator className="mb-4" />

                <div className="space-y-3">
                  <Button className="w-full" size="lg" asChild>
                    <Link href={`/quote?design=${design.slug}`}>
                      <ShoppingBag className="mr-2 h-4 w-4" /> Request Quote
                    </Link>
                  </Button>
                  <Button className="w-full" size="lg" variant="outline" asChild>
                    <Link href="/consultation">
                      <Phone className="mr-2 h-4 w-4" /> Book Consultation
                    </Link>
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <h3 className="mb-4 font-semibold">Quick Facts</h3>
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Category</span>
                    <span className="font-medium">{design.category.label}</span>
                  </div>
                  <Separator />
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Style</span>
                    <span className="font-medium">{design.style}</span>
                  </div>
                  <Separator />
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Room Size</span>
                    <span className="font-medium">{design.roomSize}</span>
                  </div>
                  <Separator />
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Materials</span>
                    <span className="font-medium">{design.materials.length} items</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}

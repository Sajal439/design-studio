import Link from "next/link";
import { notFound } from "next/navigation";
import { getDesignBySlug, designs, categories } from "@/lib/data/designs";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ArrowLeft, Ruler, ShoppingBag, MessageSquare } from "lucide-react";
import type { Metadata } from "next";

// Dynamic SEO meta tags per design
export async function generateMetadata({
    params,
}: {
    params: Promise<{ slug: string }>;
}): Promise<Metadata> {
    const { slug } = await params;
    const design = getDesignBySlug(slug);
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

// Pre-generate pages for all designs (better SEO)
export function generateStaticParams() {
    return designs.map((d) => ({ slug: d.slug }));
}

export default async function DesignDetailPage({
    params,
}: {
    params: Promise<{ slug: string }>;
}) {
    const { slug } = await params;
    const design = getDesignBySlug(slug);

    if (!design) notFound();

    const categoryLabel = categories.find((c) => c.id === design.category)?.label;

    return (
        <div className="py-12">
            <div className="container mx-auto px-4">
                {/* Back button */}
                <Link
                    href="/designs"
                    className="mb-6 inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
                >
                    <ArrowLeft className="h-4 w-4" /> Back to Gallery
                </Link>

                <div className="grid gap-10 lg:grid-cols-3">
                    {/* Left: Images */}
                    <div className="lg:col-span-2">
                        {/* Main image placeholder */}
                        <div className="aspect-[16/10] rounded-xl bg-gradient-to-br from-muted to-muted/50 flex items-center justify-center mb-4">
                            <div className="text-center">
                                <span className="text-6xl block mb-2">
                                    {design.category === "kitchen" && "🍳"}
                                    {design.category === "wardrobe" && "👔"}
                                    {design.category === "tv-unit" && "📺"}
                                    {design.category === "bedroom" && "🛏️"}
                                    {design.category === "study" && "📚"}
                                    {design.category === "office" && "💼"}
                                </span>
                                <p className="text-sm text-muted-foreground">Design preview image</p>
                            </div>
                        </div>

                        {/* Design Info */}
                        <h1 className="mb-2 text-3xl font-bold">{design.title}</h1>
                        <div className="mb-4 flex flex-wrap gap-2">
                            <Badge>{categoryLabel}</Badge>
                            <Badge variant="outline">{design.style}</Badge>
                            <Badge variant="outline">📐 {design.roomSize}</Badge>
                        </div>
                        <p className="mb-6 text-muted-foreground leading-relaxed">{design.description}</p>

                        {/* Material Breakdown */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Ruler className="h-5 w-5" /> Material Breakdown
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-3">
                                    {design.materials.map((mat, i) => (
                                        <div
                                            key={i}
                                            className="flex items-center justify-between rounded-lg bg-muted/50 px-4 py-3"
                                        >
                                            <span className="font-medium">{mat.name}</span>
                                            <span className="text-muted-foreground">
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
                        {/* Price Card */}
                        <Card>
                            <CardContent className="p-6">
                                <p className="mb-1 text-sm text-muted-foreground">Estimated Project Cost</p>
                                <p className="mb-4 text-2xl font-bold">{design.estimatedCost}</p>
                                <Separator className="mb-4" />

                                <div className="space-y-3">
                                    <Button className="w-full" size="lg" asChild>
                                        <Link href={`/quote?design=${design.slug}`}>
                                            <ShoppingBag className="mr-2 h-4 w-4" /> Request Quote
                                        </Link>
                                    </Button>
                                    <Button className="w-full" size="lg" variant="outline" asChild>
                                        <Link href="/consultation">
                                            <MessageSquare className="mr-2 h-4 w-4" /> Book Consultation
                                        </Link>
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Quick Facts */}
                        <Card>
                            <CardContent className="p-6">
                                <h3 className="mb-4 font-semibold">Quick Facts</h3>
                                <div className="space-y-3 text-sm">
                                    <div className="flex justify-between">
                                        <span className="text-muted-foreground">Category</span>
                                        <span className="font-medium">{categoryLabel}</span>
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

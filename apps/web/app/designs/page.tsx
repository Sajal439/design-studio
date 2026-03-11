import Link from "next/link";
import { designs, categories, getDesignsByCategory } from "@/lib/data/designs";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";

export const metadata = {
    title: "Design Gallery | Goel Traders Design Studio",
    description: "Browse curated interior design inspirations for kitchens, wardrobes, TV units, bedrooms, and more.",
};

export default async function DesignsPage({
    searchParams,
}: {
    searchParams: Promise<{ category?: string }>;
}) {
    const { category } = await searchParams;
    const activeCategory = category || "all";
    const filteredDesigns = getDesignsByCategory(activeCategory);

    return (
        <div className="py-12">
            <div className="container mx-auto px-4">
                {/* Page Header */}
                <div className="mb-10 text-center">
                    <h1 className="mb-3 text-4xl font-bold">Design Inspiration Gallery</h1>
                    <p className="text-lg text-muted-foreground">
                        Explore curated interior designs — find your style, estimate materials, request a quote.
                    </p>
                </div>

                {/* Category Filter Tabs */}
                <div className="mb-10 flex flex-wrap justify-center gap-2">
                    <Link href="/designs">
                        <Badge
                            variant={activeCategory === "all" ? "default" : "outline"}
                            className="cursor-pointer px-4 py-2 text-sm"
                        >
                            All
                        </Badge>
                    </Link>
                    {categories.map((cat) => (
                        <Link key={cat.id} href={`/designs?category=${cat.id}`}>
                            <Badge
                                variant={activeCategory === cat.id ? "default" : "outline"}
                                className="cursor-pointer px-4 py-2 text-sm"
                            >
                                {cat.label}
                            </Badge>
                        </Link>
                    ))}
                </div>

                {/* Design Grid */}
                <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                    {filteredDesigns.map((design) => (
                        <Link key={design.id} href={`/designs/${design.slug}`}>
                            <Card className="group h-full overflow-hidden transition-all hover:shadow-lg hover:-translate-y-1">
                                {/* Placeholder image area */}
                                <div className="aspect-[4/3] bg-gradient-to-br from-muted to-muted/50 flex items-center justify-center">
                                    <span className="text-4xl opacity-40">
                                        {design.category === "kitchen" && "🍳"}
                                        {design.category === "wardrobe" && "👔"}
                                        {design.category === "tv-unit" && "📺"}
                                        {design.category === "bedroom" && "🛏️"}
                                        {design.category === "study" && "📚"}
                                        {design.category === "office" && "💼"}
                                    </span>
                                </div>
                                <CardContent className="p-5">
                                    <Badge variant="secondary" className="mb-2 text-xs">
                                        {categories.find((c) => c.id === design.category)?.label}
                                    </Badge>
                                    <h3 className="mb-1 text-lg font-semibold group-hover:text-primary transition-colors">
                                        {design.title}
                                    </h3>
                                    <p className="mb-3 text-sm text-muted-foreground line-clamp-2">
                                        {design.description}
                                    </p>
                                    <div className="flex items-center justify-between">
                                        <span className="text-sm font-medium">{design.estimatedCost}</span>
                                        <span className="text-sm text-primary flex items-center gap-1">
                                            View Details <ArrowRight className="h-3 w-3" />
                                        </span>
                                    </div>
                                </CardContent>
                            </Card>
                        </Link>
                    ))}
                </div>

                {filteredDesigns.length === 0 && (
                    <div className="py-20 text-center">
                        <p className="text-lg text-muted-foreground">No designs found in this category yet.</p>
                        <Button asChild className="mt-4" variant="outline">
                            <Link href="/designs">View All Designs</Link>
                        </Button>
                    </div>
                )}
            </div>
        </div>
    );
}

import Link from "next/link";
import { products, productCategories, getProductsByCategory } from "@/lib/data/products";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowRight, CheckCircle, XCircle } from "lucide-react";

export const metadata = {
    title: "Products | Goel Traders Design Studio",
    description: "Browse quality plywood, laminates, hardware, adhesives, veneers and edge bands from top brands.",
};

export default async function ProductsPage({
    searchParams,
}: {
    searchParams: Promise<{ category?: string }>;
}) {
    const { category } = await searchParams;
    const activeCategory = category || "all";
    const filteredProducts = getProductsByCategory(activeCategory);

    return (
        <div className="py-12">
            <div className="container mx-auto px-4">
                <div className="mb-10 text-center">
                    <h1 className="mb-3 text-4xl font-bold">Our Products</h1>
                    <p className="text-lg text-muted-foreground">
                        Quality interior materials from trusted brands — plywood, laminates, hardware & more.
                    </p>
                </div>

                {/* Category Filters */}
                <div className="mb-10 flex flex-wrap justify-center gap-2">
                    <Link href="/products">
                        <Badge
                            variant={activeCategory === "all" ? "default" : "outline"}
                            className="cursor-pointer px-4 py-2 text-sm"
                        >
                            All
                        </Badge>
                    </Link>
                    {productCategories.map((cat) => (
                        <Link key={cat.id} href={`/products?category=${cat.id}`}>
                            <Badge
                                variant={activeCategory === cat.id ? "default" : "outline"}
                                className="cursor-pointer px-4 py-2 text-sm"
                            >
                                {cat.label}
                            </Badge>
                        </Link>
                    ))}
                </div>

                {/* Product Grid */}
                <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                    {filteredProducts.map((product) => (
                        <Link key={product.id} href={`/products/${product.slug}`}>
                            <Card className="group h-full overflow-hidden transition-all hover:shadow-lg hover:-translate-y-1">
                                <div className="aspect-[4/3] bg-gradient-to-br from-muted to-muted/50 flex items-center justify-center">
                                    <span className="text-5xl opacity-30">📦</span>
                                </div>
                                <CardContent className="p-5">
                                    <div className="mb-2 flex items-center justify-between">
                                        <Badge variant="secondary" className="text-xs">
                                            {productCategories.find((c) => c.id === product.category)?.label}
                                        </Badge>
                                        {product.inStock ? (
                                            <span className="flex items-center gap-1 text-xs text-green-600">
                                                <CheckCircle className="h-3 w-3" /> In Stock
                                            </span>
                                        ) : (
                                            <span className="flex items-center gap-1 text-xs text-red-500">
                                                <XCircle className="h-3 w-3" /> Out of Stock
                                            </span>
                                        )}
                                    </div>
                                    <h3 className="mb-1 text-lg font-semibold group-hover:text-primary transition-colors">
                                        {product.name}
                                    </h3>
                                    <p className="mb-1 text-xs text-muted-foreground">{product.brand}</p>
                                    <p className="mb-3 text-sm text-muted-foreground line-clamp-2">
                                        {product.description}
                                    </p>
                                    <div className="flex items-center justify-between">
                                        <span className="text-sm font-medium">{product.priceRange}</span>
                                        <span className="text-sm text-primary flex items-center gap-1">
                                            Details <ArrowRight className="h-3 w-3" />
                                        </span>
                                    </div>
                                </CardContent>
                            </Card>
                        </Link>
                    ))}
                </div>
            </div>
        </div>
    );
}

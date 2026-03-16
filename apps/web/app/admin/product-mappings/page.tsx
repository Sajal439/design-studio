export const dynamic = "force-dynamic";
import { ProductMappingManager } from "@/components/admin/product-mapping-manager";
import { prisma } from "@repo/database";

export default async function AdminProductMappingsPage() {
    const [mappings, productRows] = await Promise.all([
        prisma.productMapping.findMany({ orderBy: { priority: "asc" } }),
        prisma.product.findMany({
            select: {
                slug: true,
                name: true,
                category: { select: { name: true } }
            },
            orderBy: { name: "asc" },
        }),
    ]);

    const products = productRows.map(p => ({
        ...p,
        category: p.category.name
    }));

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold">Product mappings</h1>
                <p className="mt-2 text-muted-foreground">
                    Control which products appear in estimate recommendations. Each
                    mapping matches a pattern against BOM material names and links to
                    one or more products by slug. Changes apply immediately.
                </p>
            </div>
            <ProductMappingManager mappings={mappings} products={products} />
        </div>
    );
}
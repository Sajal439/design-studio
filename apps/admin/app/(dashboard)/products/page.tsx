export const dynamic = "force-dynamic";
import { prisma } from "@repo/database";
import { ProductsManager } from "@/components/products-manager";

export default async function ProductsPage() {
    const products = await prisma.product.findMany({
        where: { active: true },
        orderBy: [{ category: "asc" }, { tier: "asc" }, { createdAt: "asc" }],
    });

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold">Products</h1>
                <p className="mt-2 text-muted-foreground">
                    Manage products (laminates, plywood, hardware, appliances, etc.) with brand-level pricing.
                    Toggle <strong>Estimator</strong> to set which product price is used
                    in the public kitchen cost calculator for each tier.
                </p>
            </div>
            <ProductsManager products={products} />
        </div>
    );
}

export const dynamic = "force-dynamic";

import { prisma } from "@repo/database";
import { ProductManager } from "@/components/admin/product-manager";

export default async function AdminProductsPage() {
  const [categories, products] = await Promise.all([
    prisma.category.findMany({ where: { type: "product" }, orderBy: { name: "asc" } }),
    prisma.product.findMany({ include: { category: true, specifications: true }, orderBy: { createdAt: "desc" } }),
  ]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Product Management</h1>
        <p className="mt-2 text-muted-foreground">Maintain the public catalog and product details.</p>
      </div>
      <ProductManager categories={categories} products={products} />
    </div>
  );
}


export const dynamic = "force-dynamic";

import { prisma } from "@repo/database";
import { DesignManager } from "@/components/admin/design-manager";

export default async function AdminDesignsPage() {
  const [categories, designs] = await Promise.all([
    prisma.category.findMany({ where: { type: "design" }, orderBy: { name: "asc" } }),
    prisma.design.findMany({ include: { category: true, materials: true }, orderBy: { createdAt: "desc" } }),
  ]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Design Management</h1>
        <p className="mt-2 text-muted-foreground">Create, update, and remove design inspirations.</p>
      </div>
      <DesignManager categories={categories} designs={designs} />
    </div>
  );
}


export const dynamic = "force-dynamic";

import { prisma } from "@repo/database";
import { DesignManager } from "@/components/admin/design-manager";

export default async function AdminDesignsPage() {
  const [categories, designs] = await Promise.all([
    prisma.category.findMany({
      where: { type: "design" },
      orderBy: { label: "asc" },
      select: { id: true, slug: true, label: true },
    }),
    prisma.design.findMany({
      include: {
        category: {
          select: { slug: true, label: true },
        },
      },
      orderBy: { createdAt: "desc" },
    }),
  ]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Designs</h1>
        <p className="mt-2 text-muted-foreground">
          Manage gallery items, real-work projects, and the WhatsApp copy used
          on the public site.
        </p>
      </div>
      <DesignManager categories={categories} designs={designs} />
    </div>
  );
}

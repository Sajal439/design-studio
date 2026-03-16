export const dynamic = "force-dynamic";
import { prisma } from "@repo/database";
import { ModuleTemplateManager } from "@/components/admin/module-template-manager";

export default async function AdminModuleTemplatesPage() {
    const templates = await prisma.moduleTemplate.findMany({
        orderBy: [{ category: "asc" }, { sortOrder: "asc" }],
    });
    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold">Module templates</h1>
                <p className="mt-2 text-muted-foreground">
                    Edit material multipliers, hardware counts, and shutter modes per
                    cabinet type. Changes take effect immediately — no deploy needed.
                </p>
            </div>
            <ModuleTemplateManager templates={templates} />
        </div>
    );
}
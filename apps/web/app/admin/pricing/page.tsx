export const dynamic = "force-dynamic";
import { PricingManager } from "@/components/admin/pricing-manager";
import { prisma } from "@repo/database";

export default async function AdminPricingPage() {
    const entries = await prisma.priceBookEntry.findMany({
        orderBy: [{ category: "asc" }, { key: "asc" }],
    });
    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold">Price book</h1>
                <p className="mt-2 text-muted-foreground">
                    Update material prices, hardware costs, and margin rates. Changes
                    apply to all estimates immediately — no deploy needed. Rates are
                    stored as decimals: 0.26 = 26%.
                </p>
            </div>
            <PricingManager entries={entries} />
        </div>
    );
}
/**
 * apps/web/app/(marketing)/estimator/page.tsx
 *
 * Server component: loads the price book once from DB (React cache),
 * serializes it, and passes it to the client estimator.
 *
 * The client never calls the DB — it receives prices as props.
 * Admin updates to the price book revalidate via /api/admin/pricing/[id].
 */

import type { Metadata } from "next";
import { loadPriceBook } from "@/lib/estimator/priceBookLoader";
import { SimpleEstimator } from "@/components/marketing/simple-estimator";
import { siteConfig } from "@/lib/site-config";

export const metadata: Metadata = {
  title: `Material Estimator | ${siteConfig.name}`,
  description:
    "Get an instant material estimate for your kitchen, wardrobe, or any furniture. See Budget, Medium, and Premium options with real prices.",
};

export default async function EstimatorPage() {
  const priceBook = await loadPriceBook();

  return (
    <div className="py-10 pb-20 md:pb-10">
      <div className="container mx-auto max-w-2xl px-4">

        <div className="mb-8">
          <h1 className="text-3xl font-bold tracking-tight mb-2">
            Know your interior material cost in 2 minutes
          </h1>
          <p className="text-muted-foreground">
            Enter your furniture size — see Budget, Medium, and Premium
            material costs instantly. Same calculation method contractors use.
          </p>
        </div>

        <SimpleEstimator priceBook={priceBook} />
      </div>
    </div>
  );
}
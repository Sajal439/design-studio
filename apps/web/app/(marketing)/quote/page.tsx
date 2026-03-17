import { QuoteForm } from "@/components/marketing/quote-form";
import { siteConfig } from "@/lib/site-config";
import { Metadata } from "next";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: `Request a Quote | ${siteConfig.name}`,
  description: "Get a detailed material quote for your interior project. Kitchens, wardrobes, bedrooms, TV units, and more — sourced directly from Goel Traders.",
  openGraph: {
    title: `Request a Quote | ${siteConfig.name}`,
    description: "Free quotes for interior materials. Tell us about your project and we'll respond within 24 hours.",
    url: `${siteConfig.url}/quote`,
  },
};

export default async function QuotePage({
  searchParams,
}: {
  searchParams: Promise<{
    design?: string;
    product?: string;
    source?: string;
    projectType?: string;
    message?: string;
  }>;
}) {
  const params = await searchParams;
  return (
    <QuoteForm
      designSlug={params.design}
      productSlug={params.product}
      source={params.source}
      prefillProjectType={params.projectType}
      prefillMessage={params.message}
    />
  );
}

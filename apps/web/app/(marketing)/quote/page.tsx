import { QuoteForm } from "@/components/marketing/quote-form";

export const dynamic = "force-dynamic";

export default async function QuotePage({ searchParams }: { searchParams: Promise<{ design?: string; product?: string }> }) {
  const params = await searchParams;
  return <QuoteForm designSlug={params.design} productSlug={params.product} />;
}

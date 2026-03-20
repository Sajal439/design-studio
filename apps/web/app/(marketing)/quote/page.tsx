import { redirect } from "next/navigation";
import { siteConfig } from "@/lib/site-config";

export default function QuotePage({
  searchParams,
}: {
  searchParams: { design?: string };
}) {
  const design = searchParams.design;
  const waText = encodeURIComponent(
    design
      ? `Hi! I'm interested in getting a quote for the design "${design}".`
      : `Hi! I'm interested in getting a quote for interior work.`
  );
  redirect(`https://wa.me/91${siteConfig.whatsapp}?text=${waText}`);
}

import type { Metadata } from "next";
import { siteConfig } from "@/lib/site-config";
import ConsultationClient from "./consultationClient";

export const metadata: Metadata = {
    title: `Book a Free Consultation | ${siteConfig.name}`,
    description:
        "Book a free interior consultation — showroom visit, video call, or site visit. Get expert guidance on materials, layouts, and cost estimates from Goel Traders.",
    openGraph: {
        title: `Book a Free Consultation | ${siteConfig.name}`,
        description:
            "Expert interior material guidance at no cost. Book your preferred consultation type today.",
        url: `${siteConfig.url}/consultation`,
    },
};

export default function Page() {
    return <ConsultationClient />;
}
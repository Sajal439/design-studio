import type { ReactNode } from "react";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { WhatsAppFab } from "@/components/marketing/whatsapp-fab";
import { ExitIntentPopup } from "@/components/marketing/exit-intent-popup";
import { siteConfig } from "@/lib/site-config";

const jsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Organization",
      "@id": `${siteConfig.url}/#organization`,
      name: siteConfig.name,
      url: siteConfig.url,
      logo: `${siteConfig.url}/logo.png`,
      contactPoint: {
        "@type": "ContactPoint",
        telephone: siteConfig.phone,
        contactType: "customer service",
        areaServed: "IN",
        availableLanguage: ["en", "hi"],
      },
    },
    {
      "@type": "LocalBusiness",
      "@id": `${siteConfig.url}/#localbusiness`,
      name: siteConfig.name,
      url: siteConfig.url,
      telephone: siteConfig.phone,
      priceRange: "₹₹",
      address: {
        "@type": "PostalAddress",
        addressLocality: "Karnal",
        addressRegion: "Haryana",
        addressCountry: "IN",
      },
      areaServed: [
        "Karnal", "Panipat", "Kurukshetra", "Ambala",
        "Kaithal", "Rohtak", "Sonipat",
      ],
      hasOfferCatalog: {
        "@type": "OfferCatalog",
        name: "Interior Design Materials",
      },
    },
  ],
};

export default function MarketingLayout({ children }: { children: ReactNode }) {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <Header />
      {children}
      <Footer />
      <WhatsAppFab />
      <ExitIntentPopup />
    </>
  );
}

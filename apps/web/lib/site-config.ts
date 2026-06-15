export const siteConfig = {
  name: process.env.NEXT_PUBLIC_SITE_NAME ?? "Goel Traders",
  tagline:
    process.env.NEXT_PUBLIC_SITE_TAGLINE ??
    "Interior material sourcing platform",
  url: process.env.NEXT_PUBLIC_SITE_URL ?? "https://www.goeltraders.in",
  phone: process.env.NEXT_PUBLIC_CONTACT_PHONE ?? "+91 9215801362",
  email: process.env.NEXT_PUBLIC_CONTACT_EMAIL ?? "goeltraders78@gmail.com",
  address:
    process.env.NEXT_PUBLIC_CONTACT_ADDRESS ??
    "Goel Traders, Railway Road, Gharaunda, Haryana",
  whatsapp: process.env.NEXT_PUBLIC_WHATSAPP_NUMBER ?? "9215801362",
  // SEO defaults
  description:
    "Explore premium modular kitchens, wardrobes, and bedroom designs. Get instant material estimates and direct pricing from Goel Traders — Karnal's leading interior materials supplier.",
};

import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { SessionProvider } from "@/lib/session-context";
import { Analytics } from "@vercel/analytics/next"
import { SpeedInsights } from "@vercel/speed-insights/next"
import { siteConfig } from "@/lib/site-config";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
});

export const metadata: Metadata = {
  metadataBase: new URL(siteConfig.url),
  title: "Modular Kitchen & Interior Materials in Karnal, Haryana | Goel Traders",
  description: siteConfig.description,
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: "Modular Kitchen & Interior Materials in Karnal, Haryana | Goel Traders",
    description: siteConfig.description,
    url: "/",
    siteName: siteConfig.name,
    locale: "en_IN",
    type: "website",
  },
  icons: {
    icon: "/icon.svg",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={`${inter.variable} w-full overflow-x-hidden font-sans antialiased`}>
        <SessionProvider>
          {children}
        </SessionProvider>
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}

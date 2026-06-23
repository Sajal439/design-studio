"use client";

import { MessageCircle } from "lucide-react";
import { siteConfig } from "@/lib/site-config";

/**
 * Floating WhatsApp CTA button — appears on all marketing pages.
 * Opens WhatsApp with a context‐aware pre‐filled message.
 * On mobile: positioned above the contact bar.
 * On desktop: positioned in the bottom-right corner.
 */
export function WhatsAppFab({ context }: { context?: string }) {
  const message = context
    ? `Hi, I'm interested in ${context}. Can you help me with pricing and availability?`
    : "Hi, I'm browsing the Goel Traders Design Studio and would like to know more about your interior materials.";

  const url = `https://wa.me/91${siteConfig.whatsapp}?text=${encodeURIComponent(message)}`;

  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Chat on WhatsApp"
      className="fixed z-50 flex h-14 w-14 items-center justify-center rounded-full bg-[#25D366] text-white shadow-lg transition-all hover:scale-110 hover:shadow-xl active:scale-95 print:hidden bottom-24 right-4 md:bottom-6 md:right-6"
    >
      <MessageCircle className="h-6 w-6" />
    </a>
  );
}


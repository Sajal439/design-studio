"use client";

import { MessageCircle } from "lucide-react";
import { siteConfig } from "@/lib/site-config";

/**
 * Floating WhatsApp CTA button — appears on all marketing pages.
 * Opens WhatsApp with a context‐aware pre‐filled message.
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
      className="fixed bottom-6 right-6 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-[#25D366] text-white shadow-lg transition-all hover:scale-110 hover:shadow-xl active:scale-95 print:hidden"
    >
      <MessageCircle className="h-6 w-6" />
      <span className="absolute -top-2 -left-2 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white">
        1
      </span>
    </a>
  );
}

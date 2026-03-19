"use client";

import { Phone, MessageCircle, FileText } from "lucide-react";
import Link from "next/link";
import { siteConfig } from "@/lib/site-config";

const WA_TEXT = encodeURIComponent(
  "Hi! I'm looking for interior materials. Can you help me with pricing?"
);

export function MobileContactBar() {
  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 flex md:hidden border-t bg-background/95 backdrop-blur-sm">
      <a
        href={`tel:${siteConfig.phone}`}
        className="flex flex-1 flex-col items-center justify-center gap-1 py-3 text-xs font-medium text-muted-foreground hover:text-foreground active:bg-muted transition-colors"
      >
        <Phone className="h-5 w-5" />
        Call
      </a>
      <a
        href={`https://wa.me/91${siteConfig.whatsapp}?text=${WA_TEXT}`}
        target="_blank"
        rel="noopener noreferrer"
        className="flex flex-1 flex-col items-center justify-center gap-1 py-3 text-xs font-medium text-[#25D366] hover:bg-green-50 dark:hover:bg-green-950 transition-colors"
      >
        <MessageCircle className="h-5 w-5" />
        WhatsApp
      </a>
      <Link
        href="/quote"
        className="flex flex-1 flex-col items-center justify-center gap-1 py-3 text-xs font-medium text-muted-foreground hover:text-foreground active:bg-muted transition-colors"
      >
        <FileText className="h-5 w-5" />
        Quote
      </Link>
    </div>
  );
}
"use client";

import { Calculator, Home, MessageCircle, Phone } from "lucide-react";
import Link from "next/link";
import { siteConfig } from "@/lib/site-config";

const WA_TEXT = encodeURIComponent(
  "Hi! I'm looking for interior materials. Can you help me with pricing?"
);

export function MobileContactBar() {
  return (
    <div className="fixed bottom-3 left-1/2 z-50 w-[calc(100%-0.75rem)] max-w-[26rem] -translate-x-1/2 md:hidden">
      <div className="grid grid-cols-4 overflow-hidden rounded-[1.75rem] border border-slate-200/80 bg-background/95 shadow-[0_16px_40px_-20px_rgba(15,23,42,0.45)] backdrop-blur-xl">
        <Link
          href="/"
          className="flex min-h-18 flex-col items-center justify-center gap-1 border-r border-slate-200/80 py-3 text-[11px] font-semibold text-slate-600 transition-colors hover:bg-slate-800 active:bg-black"
        >
          <Home className="h-5 w-5" />
          Home
        </Link>
        <a
          href={`tel:${siteConfig.phone}`}
          className="flex min-h-18 flex-col items-center justify-center gap-1 border-r border-slate-200/80 py-3 text-[11px] font-semibold text-slate-600 transition-colors hover:bg-slate-50 hover:text-slate-900 active:bg-slate-100"
        >
          <Phone className="h-5 w-5" />
          Call
        </a>
        <a
          href={`https://wa.me/91${siteConfig.whatsapp}?text=${WA_TEXT}`}
          target="_blank"
          rel="noopener noreferrer"
          className="flex min-h-18 flex-col items-center justify-center gap-1 border-r border-slate-200/80 py-3 text-[11px] font-semibold text-[#25D366] transition-colors hover:bg-green-50 active:bg-green-100"
        >
          <MessageCircle className="h-5 w-5" />
          WhatsApp
        </a>
        <Link
          href="/estimator"
          className="flex min-h-18 flex-col items-center justify-center gap-1 border-r border-slate-200/80 py-3 text-[11px] font-semibold text-slate-600 transition-colors hover:bg-slate-800 active:bg-black"
        >
          <Calculator className="h-5 w-5" />
          Estimate
        </Link>
      </div>
    </div>
  );
}

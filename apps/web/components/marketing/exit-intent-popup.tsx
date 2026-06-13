"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { Button } from "@repo/ui/button";
import { X, Calculator, MessageCircle } from "lucide-react";
import { siteConfig } from "@/lib/site-config";

/**
 * Exit-intent + scroll-depth popup.
 * - Desktop: fires when the mouse leaves the viewport toward the top (tab close intent).
 * - Mobile: fires when the user has scrolled ≥ 70 % of the page and paused.
 *
 * Shows once per session (sessionStorage flag).
 */
export function ExitIntentPopup() {
  const [visible, setVisible] = useState(false);
  const shownRef = useRef(false);

  function maybeShow() {
    if (shownRef.current) return;
    if (typeof sessionStorage !== "undefined" && sessionStorage.getItem("exit_popup_shown")) return;
    shownRef.current = true;
    sessionStorage.setItem("exit_popup_shown", "1");
    setVisible(true);
  }

  useEffect(() => {
    // Desktop: mouse leaving toward top of viewport
    function onMouseLeave(e: MouseEvent) {
      if (e.clientY < 5) maybeShow();
    }

    // Mobile/scroll: 70 % scroll depth
    function onScroll() {
      const scrolled = window.scrollY + window.innerHeight;
      const total = document.documentElement.scrollHeight;
      if (scrolled / total >= 0.7) maybeShow();
    }

    document.addEventListener("mouseleave", onMouseLeave);
    window.addEventListener("scroll", onScroll, { passive: true });

    return () => {
      document.removeEventListener("mouseleave", onMouseLeave);
      window.removeEventListener("scroll", onScroll);
    };
  }, []);

  if (!visible) return null;

  const waUrl = `https://wa.me/91${siteConfig.whatsapp}?text=${encodeURIComponent("Hi, I was browsing Goel Traders Design Studio and have a question about interior materials.")}`;

  return (
    <div className="fixed inset-0 z-[60] flex items-end justify-center p-4 sm:items-center print:hidden">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        onClick={() => setVisible(false)}
      />

      {/* Popup card */}
      <div className="relative w-full max-w-md rounded-2xl bg-background shadow-2xl ring-1 ring-border animate-in slide-in-from-bottom-4 duration-300">
        <button
          onClick={() => setVisible(false)}
          className="absolute right-4 top-4 rounded-full p-1 text-muted-foreground hover:text-foreground"
          aria-label="Close"
        >
          <X className="h-4 w-4" />
        </button>

        <div className="p-6">
          <p className="mb-1 text-xs font-semibold uppercase tracking-widest text-primary">
            Before you go…
          </p>
          <h2 className="mb-2 text-xl font-bold leading-snug">
            Get a free material estimate for your project
          </h2>
          <p className="mb-6 text-sm text-muted-foreground">
            Input your room size and get an instant cost breakdown — kitchens, wardrobes,
            TV units, and more. No sign-up needed.
          </p>

          <div className="flex flex-col gap-3 sm:flex-row">
            <Button asChild className="flex-1" onClick={() => setVisible(false)}>
              <Link href="/estimator">
                <Calculator className="mr-2 h-4 w-4" />
                Get Free Estimate
              </Link>
            </Button>
            <Button asChild variant="outline" className="flex-1 border-[#25D366] text-[#25D366] hover:bg-[#25D366]/10" onClick={() => setVisible(false)}>
              <a href={waUrl} target="_blank" rel="noopener noreferrer">
                <MessageCircle className="mr-2 h-4 w-4" />
                WhatsApp Expert
              </a>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

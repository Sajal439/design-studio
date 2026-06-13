import Link from "next/link";
import { Button } from "@repo/ui/button";
import { ArrowLeft, Search } from "lucide-react";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Page Not Found | Goel Traders Design Studio",
};

export default function NotFound() {
  return (
    <div className="flex min-h-[70vh] flex-col items-center justify-center px-4 text-center">
      <div className="mb-6">
        <span className="block text-8xl font-black text-muted-foreground/20 select-none">
          404
        </span>
      </div>

      <h1 className="mb-3 text-3xl font-bold tracking-tight">Page not found</h1>
      <p className="mb-8 max-w-md text-muted-foreground">
        The page you&apos;re looking for doesn&apos;t exist or may have been moved.
        Browse our design gallery or get a free material estimate below.
      </p>

      <div className="flex flex-wrap justify-center gap-3">
        <Button asChild>
          <Link href="/">
            <ArrowLeft className="mr-2 h-4 w-4" /> Back to Home
          </Link>
        </Button>
        <Button variant="outline" asChild>
          <Link href="/designs">
            <Search className="mr-2 h-4 w-4" /> Browse Designs
          </Link>
        </Button>
        <Button variant="outline" asChild>
          <Link href="/estimator">Get Free Estimate</Link>
        </Button>
      </div>
    </div>
  );
}

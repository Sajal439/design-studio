import type { Metadata } from "next";
import Image from "next/image";
import { CheckCircle2, ShieldCheck, Award } from "lucide-react";
import { siteConfig } from "@/lib/site-config";

export const metadata: Metadata = {
  title: "About Us | Goel Traders — Karnal's Trusted Interior Materials Dealer",
  description: "Learn about Goel Traders, Karnal's leading authorized dealer for premium interior materials like Century Ply, Greenply, Merino, Hettich, and Hafele.",
  alternates: {
    canonical: "/about",
  },
};

export default function AboutPage() {
  return (
    <div className="py-12 md:py-20">
      <div className="container mx-auto px-4 max-w-4xl">
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight mb-4">
            About Goel Traders
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Your trusted partner for premium interior materials in Karnal, Haryana. We bridge the gap between your dream design and factory-direct materials.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-10 items-center mb-20">
          <div className="relative aspect-square rounded-3xl overflow-hidden bg-slate-100">
            {/* Placeholder for actual showroom image */}
            <div className="absolute inset-0 flex items-center justify-center text-slate-400">
              <span className="text-sm font-medium">Showroom Showcase</span>
            </div>
          </div>
          <div>
            <h2 className="text-2xl font-bold mb-4">Our Story</h2>
            <p className="text-muted-foreground mb-6 leading-relaxed">
              Located in the heart of Haryana, Goel Traders was established with a single mission: to provide homeowners, architects, and carpenters with 100% genuine, premium interior materials at transparent prices.
            </p>
            <p className="text-muted-foreground mb-6 leading-relaxed">
              We understand that building a home is a deeply personal journey. That's why we don't just sell plywood or hardware; we offer an end-to-end material sourcing experience. From helping you estimate costs using our proprietary tools to delivering directly to your site across Haryana, we are with you at every step.
            </p>
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <CheckCircle2 className="text-emerald-500 h-5 w-5" />
                <span className="font-medium">100% Genuine Materials</span>
              </div>
              <div className="flex items-center gap-3">
                <CheckCircle2 className="text-emerald-500 h-5 w-5" />
                <span className="font-medium">Transparent Pricing</span>
              </div>
              <div className="flex items-center gap-3">
                <CheckCircle2 className="text-emerald-500 h-5 w-5" />
                <span className="font-medium">Expert Consultation</span>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-slate-50 rounded-[2rem] p-10 md:p-16 mb-20">
          <div className="text-center mb-10">
            <h2 className="text-2xl md:text-3xl font-bold mb-4">Authorized Dealers</h2>
            <p className="text-muted-foreground">We partner directly with India's top brands to bring you original products.</p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
            {["Century Ply", "Greenply", "Merino Laminates", "Hettich", "Hafele", "Action TESA", "Godrej", "Fevicol"].map((brand) => (
              <div key={brand} className="bg-white p-4 rounded-xl border shadow-sm font-semibold text-slate-700">
                {brand}
              </div>
            ))}
          </div>
        </div>

        <div className="grid sm:grid-cols-3 gap-6 text-center">
          <div className="p-6 rounded-2xl border">
            <ShieldCheck className="h-10 w-10 mx-auto text-primary mb-4" />
            <h3 className="font-bold text-lg mb-2">Quality Assured</h3>
            <p className="text-sm text-muted-foreground">Every board and hinge is quality checked before delivery.</p>
          </div>
          <div className="p-6 rounded-2xl border">
            <Award className="h-10 w-10 mx-auto text-primary mb-4" />
            <h3 className="font-bold text-lg mb-2">Expert Team</h3>
            <p className="text-sm text-muted-foreground">Years of experience in recommending the right materials for every budget.</p>
          </div>
          <div className="p-6 rounded-2xl border">
            <CheckCircle2 className="h-10 w-10 mx-auto text-primary mb-4" />
            <h3 className="font-bold text-lg mb-2">On-Time Delivery</h3>
            <p className="text-sm text-muted-foreground">We ensure your project never stops because of material delays.</p>
          </div>
        </div>

      </div>
    </div>
  );
}

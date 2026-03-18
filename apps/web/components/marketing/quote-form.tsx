"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ShoppingBag, CheckCircle, Calculator } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { quoteRequestSchema, type QuoteRequest } from "@/lib/validations";

const projectTypes = [
  "Modular Kitchen",
  "Wardrobe",
  "TV Unit",
  "Bedroom Interior",
  "Study Table",
  "Office Furniture",
  "Complete Home Interior",
  "Other",
];

type QuoteFormProps = {
  designSlug?: string;
  productSlug?: string;
  prefillProjectType?: string;   // ← new
  prefillMessage?: string;    // ← new
  source?: string;
};

export function QuoteForm({
  designSlug = "",
  productSlug = "",
  prefillProjectType,
  prefillMessage,
  source,
}: QuoteFormProps) {
  // Auto-generate source if not provided
  const resolvedSource = source
    || (designSlug ? `design_detail:${designSlug}` : "")
    || (productSlug ? `product_detail:${productSlug}` : "")
    || "quote_page";

  const [formData, setFormData] = useState<QuoteRequest>({
    name: "",
    phone: "",
    email: "",
    projectType: prefillProjectType ?? "",
    designSlug: designSlug ?? "",
    productSlug: productSlug ?? "",
    location: "",
    message: prefillMessage ?? "",
    source: resolvedSource,
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  const selectedItem = designSlug || productSlug;
  const selectedItemLabel = designSlug ? "Design" : productSlug ? "Product" : "";

  useEffect(() => {
    setFormData((current) => ({ ...current, designSlug, productSlug }));
  }, [designSlug, productSlug]);

  function handleChange(event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) {
    setFormData({ ...formData, [event.target.name]: event.target.value });
    if (errors[event.target.name]) {
      setErrors({ ...errors, [event.target.name]: "" });
    }
  }

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setLoading(true);

    const result = quoteRequestSchema.safeParse(formData);
    if (!result.success) {
      const fieldErrors: Record<string, string> = {};
      result.error.errors.forEach((error) => {
        if (error.path[0]) fieldErrors[error.path[0] as string] = error.message;
      });
      setErrors(fieldErrors);
      setLoading(false);
      return;
    }

    try {
      const response = await fetch("/api/quote", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(result.data),
      });

      if (!response.ok) {
        setErrors({ form: "Something went wrong. Please try again." });
        return;
      }

      setSubmitted(true);
    } catch {
      setErrors({ form: "Something went wrong. Please try again." });
    } finally {
      setLoading(false);
    }
  }

  if (submitted) {
    return (
      <div className="py-20">
        <div className="container mx-auto px-4 text-center">
          <div className="mx-auto max-w-md">
            <CheckCircle className="mx-auto mb-4 h-16 w-16 text-green-500" />
            <h1 className="mb-3 text-3xl font-bold">Quote Request Submitted!</h1>
            <p className="mb-6 text-muted-foreground">Thank you! Our team will review your requirements and get back to you within 24 hours with a detailed quote.</p>
            <div className="flex justify-center gap-3">
              <Button asChild variant="outline"><Link href="/designs">Browse More Designs</Link></Button>
              <Button asChild><Link href="/">Go Home</Link></Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="py-12">
      <div className="container mx-auto px-4">
        <div className="mx-auto max-w-2xl">
          <div className="mb-8 text-center">
            <ShoppingBag className="mx-auto mb-3 h-10 w-10 text-primary" />
            <h1 className="mb-2 text-3xl font-bold">Request a Quote</h1>
            <p className="text-muted-foreground">Tell us about your project and we&apos;ll send you a detailed material quote.</p>
            {selectedItem ? <Badge className="mt-3">{selectedItemLabel}: {selectedItem.replace(/-/g, " ")}</Badge> : null}
          </div>

          {source === "estimator" && (
            <div className="mb-6 flex items-start gap-3 rounded-xl border border-primary/20 bg-primary/5 px-4 py-3">
              <div className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
                <Calculator className="h-3.5 w-3.5" />
              </div>
              <div className="text-sm">
                <p className="font-medium">Filled from your estimate</p>
                <p className="mt-0.5 text-muted-foreground">
                  Project type and details have been carried over. Add your contact info and we'll be in touch.
                </p>
              </div>
            </div>
          )}
          <Card>
            <CardContent className="p-6 md:p-8">
              <form onSubmit={handleSubmit} className="space-y-5">
                <div className="grid gap-5 sm:grid-cols-2">
                  <div>
                    <label className="mb-1.5 block text-sm font-medium">Full Name *</label>
                    <Input name="name" value={formData.name} onChange={handleChange} placeholder="Your full name" />
                    {errors.name ? <p className="mt-1 text-sm text-destructive">{errors.name}</p> : null}
                  </div>
                  <div>
                    <label className="mb-1.5 block text-sm font-medium">Phone Number *</label>
                    <Input name="phone" value={formData.phone} onChange={handleChange} placeholder="+91 XXXXX XXXXX" />
                    {errors.phone ? <p className="mt-1 text-sm text-destructive">{errors.phone}</p> : null}
                  </div>
                </div>

                <div>
                  <label className="mb-1.5 block text-sm font-medium">Email Address *</label>
                  <Input name="email" type="email" value={formData.email} onChange={handleChange} placeholder="your@email.com" />
                  {errors.email ? <p className="mt-1 text-sm text-destructive">{errors.email}</p> : null}
                </div>

                <div>
                  <label className="mb-1.5 block text-sm font-medium">Project Type *</label>
                  <select name="projectType" value={formData.projectType} onChange={handleChange} className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm">
                    <option value="">Select project type</option>
                    {projectTypes.map((type) => <option key={type} value={type}>{type}</option>)}
                  </select>
                  {errors.projectType ? <p className="mt-1 text-sm text-destructive">{errors.projectType}</p> : null}
                </div>

                <div>
                  <label className="mb-1.5 block text-sm font-medium">Project Location *</label>
                  <Input name="location" value={formData.location} onChange={handleChange} placeholder="City, Area" />
                  {errors.location ? <p className="mt-1 text-sm text-destructive">{errors.location}</p> : null}
                </div>

                <div>
                  <label className="mb-1.5 block text-sm font-medium">Additional Details</label>
                  <Textarea name="message" value={formData.message} onChange={handleChange} placeholder="Room dimensions, preferred brands, budget range, any other requirements..." rows={4} />
                </div>

                {errors.form ? <p className="rounded-md border border-destructive/30 bg-destructive/5 px-3 py-2 text-sm text-destructive">{errors.form}</p> : null}
                <Button type="submit" size="lg" className="w-full" disabled={loading}>{loading ? "Submitting..." : "Submit Quote Request"}</Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

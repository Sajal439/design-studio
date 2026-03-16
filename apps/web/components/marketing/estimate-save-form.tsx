"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { EstimationResult } from "@/lib/estimator/types";
import { CheckCircle2, Loader2, PhoneCall, ShieldCheck, Sparkles } from "lucide-react";

interface EstimateSaveFormProps {
  result: EstimationResult;
}

export function EstimateSaveForm({ result }: EstimateSaveFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState("");
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    city: "",
  });

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setIsSubmitting(true);
    setError("");

    try {
      const response = await fetch("/api/estimates", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...result,
          customerName: formData.name,
          customerPhone: formData.phone,
          customerCity: formData.city,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to save estimate. Please try again.");
      }

      setIsSuccess(true);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to save estimate. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  }

  if (isSuccess) {
    return (
      <Card className="overflow-hidden border-green-500/40 bg-[linear-gradient(135deg,rgba(240,255,246,0.95),rgba(255,255,255,1))]">
        <CardContent className="flex flex-col items-center justify-center gap-4 p-8 text-center">
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-green-500/12 text-green-600">
            <CheckCircle2 className="h-7 w-7" />
          </div>
          <div>
            <h3 className="text-2xl font-semibold">Estimate saved successfully</h3>
            <p className="mt-2 max-w-xl text-muted-foreground">
              Thank you, {formData.name}. Our team will reach out on {formData.phone} to take this estimate into a final site-ready quote.
            </p>
          </div>
          <Button variant="outline" onClick={() => window.location.reload()}>
            Start new estimate
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="overflow-hidden border border-foreground/10">
      <div className="grid lg:grid-cols-[0.85fr_1.15fr]">
        <div className="bg-[linear-gradient(135deg,rgba(29,31,34,0.98),rgba(71,51,35,0.96))] p-6 text-white">
          <div className="max-w-sm space-y-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/12">
              <PhoneCall className="h-5 w-5" />
            </div>
            <div>
              <CardTitle className="text-2xl font-semibold text-white">Save this estimate and let us take it further.</CardTitle>
              <CardDescription className="mt-2 text-white/70">
                Lock the project summary now. The design team can refine it into a final quotation, cutting list, or site visit discussion.
              </CardDescription>
            </div>
            <div className="space-y-3 text-sm text-white/80">
              <div className="flex items-start gap-3 rounded-2xl border border-white/10 bg-white/6 p-3">
                <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0" />
                <p>We store the estimate with your chosen layout, material grade, and BOM details.</p>
              </div>
              <div className="flex items-start gap-3 rounded-2xl border border-white/10 bg-white/6 p-3">
                <Sparkles className="mt-0.5 h-4 w-4 shrink-0" />
                <p>Great for callbacks, site visits, and converting this estimate into a Goel Traders product-backed quote.</p>
              </div>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="bg-background">
          <CardContent className="space-y-5 p-6">
            {error ? <p className="rounded-2xl border border-destructive/20 bg-destructive/8 px-4 py-3 text-sm text-destructive">{error}</p> : null}

            <div className="rounded-[1.25rem] border border-foreground/10 bg-[linear-gradient(180deg,rgba(249,247,242,0.82),rgba(255,255,255,0.98))] p-4">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">Project summary</p>
              <p className="mt-2 font-semibold">{result.categoryLabel}</p>
              <p className="mt-1 text-sm text-muted-foreground">
                {result.layout.replace(/_/g, " ")} layout, {result.grade.toLowerCase()} grade, {result.finishType.toLowerCase()} finish,
                {" "}{result.doorType.toLowerCase()} doors, {result.dimensions.width} ft x {result.dimensions.height} ft x {result.dimensions.depth} ft
              </p>
              <p className="mt-2 text-sm text-muted-foreground">
                Recommended next step: {result.nextBestAction.primary.replace(/_/g, " ").toLowerCase()}
              </p>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="name">Full name</Label>
                <Input
                  id="name"
                  required
                  placeholder="Rahul Kumar"
                  value={formData.name}
                  onChange={(event) => setFormData({ ...formData, name: event.target.value })}
                  className="h-12 rounded-2xl"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone">Phone number</Label>
                <Input
                  id="phone"
                  required
                  type="tel"
                  placeholder="+91 9876543210"
                  value={formData.phone}
                  onChange={(event) => setFormData({ ...formData, phone: event.target.value })}
                  className="h-12 rounded-2xl"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="city">City</Label>
              <Input
                id="city"
                required
                placeholder="Mumbai, Maharashtra"
                value={formData.city}
                onChange={(event) => setFormData({ ...formData, city: event.target.value })}
                className="h-12 rounded-2xl"
              />
            </div>
          </CardContent>

          <CardFooter className="justify-between gap-3 bg-muted/20 p-6">
            <p className="text-sm text-muted-foreground">We will use these details only for this estimate follow-up.</p>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
              Save estimate
            </Button>
          </CardFooter>
        </form>
      </div>
    </Card>
  );
}

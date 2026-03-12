"use client";
export const dynamic = "force-dynamic";
import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ShoppingBag, CheckCircle } from "lucide-react";
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

export default function QuotePage() {

    const searchParams = useSearchParams();
    const designSlug = searchParams.get("design") || "";
    const productSlug = searchParams.get("product") || "";

    const [formData, setFormData] = useState<QuoteRequest>({
        name: "",
        phone: "",
        email: "",
        projectType: "",
        designSlug,
        productSlug,
        location: "",
        message: "",
    });
    const selectedItem = designSlug || productSlug;
    const selectedItemLabel = designSlug ? "Design" : productSlug ? "Product" : "";

    useEffect(() => {
        setFormData((current) => ({
            ...current,
            designSlug,
            productSlug,
        }));
    }, [designSlug, productSlug]);
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [submitted, setSubmitted] = useState(false);
    const [loading, setLoading] = useState(false);

    function handleChange(
        e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
    ) {
        setFormData({ ...formData, [e.target.name]: e.target.value });
        // Clear error on change
        if (errors[e.target.name]) {
            setErrors({ ...errors, [e.target.name]: "" });
        }
    }

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        setLoading(true);

        // Validate with Zod
        const result = quoteRequestSchema.safeParse(formData);
        if (!result.success) {
            const fieldErrors: Record<string, string> = {};
            result.error.errors.forEach((err) => {
                if (err.path[0]) fieldErrors[err.path[0] as string] = err.message;
            });
            setErrors(fieldErrors);
            setLoading(false);
            return;
        }

        // Submit to API
        try {
            const response = await fetch("/api/quote", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(result.data),
            });
            if (!response.ok) {
                setErrors({ form: "something went wrong. Please try again." })
            }
            setSubmitted(true)
        } catch {
            setErrors({ form: "something went wrong. Please try again." })
        } finally {
            setLoading(false)
        }
    }

    if (submitted) {
        return (
            <div className="py-20">
                <div className="container mx-auto px-4 text-center">
                    <div className="mx-auto max-w-md">
                        <CheckCircle className="mx-auto mb-4 h-16 w-16 text-green-500" />
                        <h1 className="mb-3 text-3xl font-bold">Quote Request Submitted!</h1>
                        <p className="mb-6 text-muted-foreground">
                            Thank you! Our team will review your requirements and get back to you
                            within 24 hours with a detailed quote.
                        </p>
                        <div className="flex gap-3 justify-center">
                            <Button asChild variant="outline">
                                <a href="/designs">Browse More Designs</a>
                            </Button>
                            <Button asChild>
                                <a href="/">Go Home</a>
                            </Button>
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
                        <p className="text-muted-foreground">
                            Tell us about your project and we&apos;ll send you a detailed material quote.
                        </p>
                        {selectedItem && (
                            <Badge className="mt-3">
                                {selectedItemLabel}: {selectedItem.replace(/-/g, " ")}
                            </Badge>
                        )}
                    </div>

                    <Card>
                        <CardContent className="p-6 md:p-8">
                            <form onSubmit={handleSubmit} className="space-y-5">
                                <div className="grid gap-5 sm:grid-cols-2">
                                    <div>
                                        <label className="mb-1.5 block text-sm font-medium">Full Name *</label>
                                        <Input
                                            name="name"
                                            value={formData.name}
                                            onChange={handleChange}
                                            placeholder="Your full name"
                                        />
                                        {errors.name && <p className="mt-1 text-sm text-destructive">{errors.name}</p>}
                                    </div>
                                    <div>
                                        <label className="mb-1.5 block text-sm font-medium">Phone Number *</label>
                                        <Input
                                            name="phone"
                                            value={formData.phone}
                                            onChange={handleChange}
                                            placeholder="+91 XXXXX XXXXX"
                                        />
                                        {errors.phone && <p className="mt-1 text-sm text-destructive">{errors.phone}</p>}
                                    </div>
                                </div>

                                <div>
                                    <label className="mb-1.5 block text-sm font-medium">Email Address *</label>
                                    <Input
                                        name="email"
                                        type="email"
                                        value={formData.email}
                                        onChange={handleChange}
                                        placeholder="your@email.com"
                                    />
                                    {errors.email && <p className="mt-1 text-sm text-destructive">{errors.email}</p>}
                                </div>

                                <div>
                                    <label className="mb-1.5 block text-sm font-medium">Project Type *</label>
                                    <select
                                        name="projectType"
                                        value={formData.projectType}
                                        onChange={handleChange}
                                        className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                                    >
                                        <option value="">Select project type</option>
                                        {projectTypes.map((type) => (
                                            <option key={type} value={type}>{type}</option>
                                        ))}
                                    </select>
                                    {errors.projectType && <p className="mt-1 text-sm text-destructive">{errors.projectType}</p>}
                                </div>

                                <div>
                                    <label className="mb-1.5 block text-sm font-medium">Project Location *</label>
                                    <Input
                                        name="location"
                                        value={formData.location}
                                        onChange={handleChange}
                                        placeholder="City, Area"
                                    />
                                    {errors.location && <p className="mt-1 text-sm text-destructive">{errors.location}</p>}
                                </div>

                                <div>
                                    <label className="mb-1.5 block text-sm font-medium">Additional Details</label>
                                    <Textarea
                                        name="message"
                                        value={formData.message}
                                        onChange={handleChange}
                                        placeholder="Room dimensions, preferred brands, budget range, any other requirements..."
                                        rows={4}
                                    />
                                </div>
                                {errors.form && (
                                    <p className="rounded-md border border-destructive/30 bg-destructive/5 px-3 py-2 text-sm text-destructive">
                                        {errors.form}
                                    </p>
                                )}
                                <Button type="submit" size="lg" className="w-full" disabled={loading}>
                                    {loading ? "Submitting..." : "Submit Quote Request"}
                                </Button>
                            </form>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}

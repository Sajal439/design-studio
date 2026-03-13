"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Phone, CheckCircle, Building, Video, MapPin } from "lucide-react";
import { consultationSchema, type ConsultationRequest } from "@/lib/validations";

const consultationTypes = [
    { id: "showroom", label: "Showroom Visit", icon: Building, desc: "Visit our store to see materials in person" },
    { id: "video", label: "Video Call", icon: Video, desc: "Quick video consultation from home" },
    { id: "site-visit", label: "Site Visit", icon: MapPin, desc: "Our expert visits your project location" },
] as const;

const projectTypes = [
    "Modular Kitchen",
    "Wardrobe",
    "TV Unit",
    "Bedroom Interior",
    "Complete Home Interior",
    "Office Furniture",
    "Other",
];

export default function ConsultationPage() {
    const [formData, setFormData] = useState<ConsultationRequest>({
        name: "",
        phone: "",
        projectType: "",
        location: "",
        consultationType: "showroom",
    });
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [submitted, setSubmitted] = useState(false);
    const [loading, setLoading] = useState(false);

    function handleChange(
        e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
    ) {
        setFormData({ ...formData, [e.target.name]: e.target.value });
        if (errors[e.target.name]) {
            setErrors({ ...errors, [e.target.name]: "" });
        }
    }

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        setLoading(true);

        const result = consultationSchema.safeParse(formData);
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
        const response = await fetch("/api/consultation", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(result.data),
        });

        if (!response.ok) {
            setErrors({ form: "Something went wrong. Please try again." });
            setLoading(false);
            return;
        }

        setSubmitted(true);
        setLoading(false);
    }

    if (submitted) {
        return (
            <div className="py-20">
                <div className="container mx-auto px-4 text-center">
                    <div className="mx-auto max-w-md">
                        <CheckCircle className="mx-auto mb-4 h-16 w-16 text-green-500" />
                        <h1 className="mb-3 text-3xl font-bold">Consultation Booked!</h1>
                        <p className="mb-6 text-muted-foreground">
                            Thank you! Our team will call you within 2 hours to confirm your
                            {" "}{formData.consultationType === "showroom" && "showroom visit"}
                            {formData.consultationType === "video" && "video consultation"}
                            {formData.consultationType === "site-visit" && "site visit"}.
                        </p>
                        <div className="flex gap-3 justify-center">
                            <Button asChild variant="outline">
                                <a href="/designs">Browse Designs</a>
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
                        <Phone className="mx-auto mb-3 h-10 w-10 text-primary" />
                        <h1 className="mb-2 text-3xl font-bold">Book a Free Consultation</h1>
                        <p className="text-muted-foreground">
                            Get expert guidance on materials, design choices, and cost estimation.
                        </p>
                    </div>

                    {/* Consultation Type Selector */}
                    <div className="mb-8 grid gap-3 sm:grid-cols-3">
                        {consultationTypes.map((type) => (
                            <button
                                key={type.id}
                                type="button"
                                onClick={() => setFormData({ ...formData, consultationType: type.id })}
                                className={`rounded-lg border-2 p-4 text-left transition-all ${formData.consultationType === type.id
                                    ? "border-primary bg-primary/5"
                                    : "border-border hover:border-primary/50"
                                    }`}
                            >
                                <type.icon className={`mb-2 h-6 w-6 ${formData.consultationType === type.id ? "text-primary" : "text-muted-foreground"
                                    }`} />
                                <p className="font-semibold text-sm">{type.label}</p>
                                <p className="text-xs text-muted-foreground mt-1">{type.desc}</p>
                            </button>
                        ))}
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
                                    <label className="mb-1.5 block text-sm font-medium">Your Location *</label>
                                    <Input
                                        name="location"
                                        value={formData.location}
                                        onChange={handleChange}
                                        placeholder="City, Area"
                                    />
                                    {errors.location && <p className="mt-1 text-sm text-destructive">{errors.location}</p>}
                                </div>
                                {errors.form && (
                                    <p className="rounded-md border border-destructive/30 bg-destructive/5 px-3 py-2 text-sm text-destructive">
                                        {errors.form}
                                    </p>
                                )}
                                <Button type="submit" size="lg" className="w-full" disabled={loading}>
                                    {loading ? "Booking..." : "Book Consultation"}
                                </Button>
                            </form>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}

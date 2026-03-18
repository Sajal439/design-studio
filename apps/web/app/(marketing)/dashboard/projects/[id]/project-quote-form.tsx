"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { CheckCircle } from "lucide-react";

interface ProjectQuoteFormProps {
  projectId: string;
}

export function ProjectQuoteForm({ projectId }: ProjectQuoteFormProps) {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [location, setLocation] = useState("");
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await fetch(`/api/projects/${projectId}/quote`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, phone, location }),
      });

      if (res.ok) {
        setSubmitted(true);
      } else {
        const data = await res.json() as { error?: string };
        setError(data.error ?? "Something went wrong. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  }

  if (submitted) {
    return (
      <div className="flex items-center gap-3 rounded-xl border border-green-200 bg-green-50 p-5">
        <CheckCircle className="h-6 w-6 shrink-0 text-green-600" />
        <div>
          <p className="font-semibold text-green-800">Quote request submitted!</p>
          <p className="text-sm text-green-700">
            Our team will contact you shortly to discuss your project.
          </p>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="grid gap-4 sm:grid-cols-3">
      <div>
        <Label htmlFor="pq-name">Your Name</Label>
        <Input
          id="pq-name"
          placeholder="Rajesh Kumar"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />
      </div>
      <div>
        <Label htmlFor="pq-phone">Phone</Label>
        <Input
          id="pq-phone"
          type="tel"
          placeholder="9876543210"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          required
          minLength={10}
        />
      </div>
      <div>
        <Label htmlFor="pq-location">City / Location</Label>
        <Input
          id="pq-location"
          placeholder="Karnal, Haryana"
          value={location}
          onChange={(e) => setLocation(e.target.value)}
          required
        />
      </div>

      {error && <p className="text-sm text-destructive sm:col-span-3">{error}</p>}

      <Button
        type="submit"
        disabled={loading}
        className="sm:col-span-3 w-full sm:w-auto sm:ml-auto"
      >
        {loading ? "Submitting…" : "Request Project Quote"}
      </Button>
    </form>
  );
}

import Link from "next/link";
import { Star, Quote } from "lucide-react";
import { Button } from "@/components/ui/button";

const testimonials = [
  {
    name: "Rahul Sharma",
    location: "Karnal, Haryana",
    project: "Modular Kitchen",
    rating: 5,
    text: "Goel Traders helped us choose the right plywood and laminates for our kitchen. The estimator tool gave us a realistic budget, and the team was spot on with their recommendation. Extremely happy with the final result.",
  },
  {
    name: "Priya & Amit Gupta",
    location: "Panipat, Haryana",
    project: "3-Bedroom Wardrobe",
    rating: 5,
    text: "We visited the showroom after using the design gallery online. The variety of designs and material options is amazing. Got a complete wardrobe set at a very competitive price with Hettich hardware.",
  },
  {
    name: "Sandeep Verma",
    location: "Kurukshetra, Haryana",
    project: "TV Unit + Study Table",
    rating: 5,
    text: "Very professional team. They suggested Century Ply for durability and the Merino laminate finish looks exactly like the design we picked. Will definitely recommend to friends and family.",
  },
];

export function TestimonialsSection() {
  return (
    <section className="py-16 md:py-24 bg-muted/20">
      <div className="container mx-auto px-4">
        <div className="mb-12 text-center">
          <p className="mb-2 text-xs font-semibold uppercase tracking-widest text-primary">
            Real Projects · Real Customers
          </p>
          <h2 className="mb-3 text-3xl font-bold">What Our Customers Say</h2>
          <p className="mx-auto max-w-xl text-muted-foreground">
            Hundreds of families across Karnal and Haryana trust Goel Traders for their interior material needs.
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          {testimonials.map((t) => (
            <div
              key={t.name}
              className="relative rounded-2xl border bg-background p-6 shadow-sm transition-all hover:-translate-y-1 hover:shadow-md"
            >
              <Quote className="absolute right-6 top-6 h-8 w-8 text-primary/10" />
              {/* Stars */}
              <div className="mb-4 flex gap-0.5">
                {Array.from({ length: t.rating }).map((_, i) => (
                  <Star key={i} className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                ))}
              </div>
              <p className="mb-6 text-sm leading-relaxed text-muted-foreground">
                &ldquo;{t.text}&rdquo;
              </p>
              <div className="border-t pt-4">
                <p className="font-semibold">{t.name}</p>
                <p className="text-xs text-muted-foreground">
                  {t.project} · {t.location}
                </p>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-10 text-center">
          <Button asChild variant="outline">
            <Link href="/consultation">Book a Free Consultation</Link>
          </Button>
        </div>
      </div>
    </section>
  );
}

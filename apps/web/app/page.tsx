import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowRight, Ruler, Palette, ShoppingBag, MessageSquare, Phone, Star } from "lucide-react";

const categories = [
  { name: "Modular Kitchens", icon: "🍳", count: "50+ Designs", href: "/designs?category=kitchen" },
  { name: "Wardrobes", icon: "👔", count: "40+ Designs", href: "/designs?category=wardrobe" },
  { name: "TV Units", icon: "📺", count: "30+ Designs", href: "/designs?category=tv-unit" },
  { name: "Bedroom Interiors", icon: "🛏️", count: "35+ Designs", href: "/designs?category=bedroom" },
  { name: "Study Tables", icon: "📚", count: "20+ Designs", href: "/designs?category=study" },
  { name: "Office Furniture", icon: "💼", count: "25+ Designs", href: "/designs?category=office" },
];

const features = [
  {
    icon: Palette,
    title: "Browse Designs",
    description: "Explore curated interior designs for every room in your home.",
  },
  {
    icon: Ruler,
    title: "Estimate Materials",
    description: "Input your room dimensions and get an accurate material breakdown.",
  },
  {
    icon: ShoppingBag,
    title: "Request Quotes",
    description: "Get competitive pricing from Goel Traders for all your materials.",
  },
  {
    icon: Phone,
    title: "Book Consultation",
    description: "Schedule a visit — showroom, video call, or on-site consultation.",
  },
];

export default function Home() {
  return (
    <div>
      {/* Hero Section */}
      <section className="relative overflow-hidden border-b bg-gradient-to-b from-muted/50 to-background py-20 md:py-32">
        <div className="container mx-auto px-4 text-center">
          <div className="mx-auto max-w-3xl">
            <p className="mb-4 text-sm font-medium uppercase tracking-widest text-muted-foreground">
              Your Trusted Interior Materials Partner
            </p>
            <h1 className="mb-6 text-4xl font-bold tracking-tight md:text-6xl">
              Design Your Dream Interior with{" "}
              <span className="bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
                Confidence
              </span>
            </h1>
            <p className="mb-8 text-lg text-muted-foreground md:text-xl">
              Browse interior design inspirations, estimate materials, and get quotes —
              all from Goel Traders, your reliable local supplier.
            </p>
            <div className="flex flex-col gap-4 sm:flex-row sm:justify-center">
              <Button size="lg" asChild>
                <Link href="/designs">
                  Explore Designs <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
              <Button size="lg" variant="outline" asChild>
                <Link href="/consultation">Book Free Consultation</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Categories Section */}
      <section className="py-16 md:py-24">
        <div className="container mx-auto px-4">
          <div className="mb-12 text-center">
            <h2 className="mb-3 text-3xl font-bold">Browse by Category</h2>
            <p className="text-muted-foreground">Find inspiration for every room</p>
          </div>
          <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-6">
            {categories.map((cat) => (
              <Link key={cat.name} href={cat.href}>
                <Card className="group cursor-pointer transition-all hover:shadow-md hover:-translate-y-1">
                  <CardContent className="flex flex-col items-center p-6 text-center">
                    <span className="mb-3 text-4xl">{cat.icon}</span>
                    <h3 className="mb-1 text-sm font-semibold">{cat.name}</h3>
                    <p className="text-xs text-muted-foreground">{cat.count}</p>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="border-t bg-muted/30 py-16 md:py-24">
        <div className="container mx-auto px-4">
          <div className="mb-12 text-center">
            <h2 className="mb-3 text-3xl font-bold">How It Works</h2>
            <p className="text-muted-foreground">From inspiration to installation in 4 simple steps</p>
          </div>
          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
            {features.map((feature, i) => (
              <div key={feature.title} className="text-center">
                <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary text-primary-foreground">
                  <feature.icon className="h-6 w-6" />
                </div>
                <div className="mb-2 text-xs font-bold text-muted-foreground">STEP {i + 1}</div>
                <h3 className="mb-2 text-lg font-semibold">{feature.title}</h3>
                <p className="text-sm text-muted-foreground">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 md:py-24">
        <div className="container mx-auto px-4 text-center">
          <div className="mx-auto max-w-2xl rounded-2xl bg-primary p-8 text-primary-foreground md:p-12">
            <Star className="mx-auto mb-4 h-10 w-10" />
            <h2 className="mb-3 text-2xl font-bold md:text-3xl">
              Ready to Start Your Interior Project?
            </h2>
            <p className="mb-6 text-primary-foreground/80">
              Get a free consultation with our interior material experts.
              We&apos;ll help you choose the right materials for your budget.
            </p>
            <div className="flex flex-col gap-3 sm:flex-row sm:justify-center">
              <Button size="lg" variant="secondary" asChild>
                <Link href="/quote">Request a Quote</Link>
              </Button>
              <Button size="lg" variant="outline" className="border-primary-foreground/30 text-primary-foreground hover:bg-primary-foreground/10" asChild>
                <Link href="/consultation">
                  <MessageSquare className="mr-2 h-4 w-4" /> Talk to an Expert
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

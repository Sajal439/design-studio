import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Menu, Phone } from "lucide-react";
import { siteConfig } from "@/lib/site-config";
import { buildWhatsAppUrl } from "@/lib/utils";

const navLinks = [
    { href: "/designs", label: "Designs" },
    { href: "/estimator", label: "Estimator" },
];

export function Header() {
    return (
        <header className="sticky top-0 z-50 w-full border-b bg-background/80 backdrop-blur-sm">
            <div className="container mx-auto flex h-16 items-center justify-between px-4">

                {/* Logo */}
                <Link href="/" className="flex items-center gap-2">
                    <Image src="/logo.svg" className="h-10 w-auto" alt="Goel Traders" width={160} height={40} priority />
                </Link>

                {/* Desktop Navigation */}
                <nav className="hidden md:flex items-center gap-6">

                    {navLinks.map((link) => (
                        <Link
                            key={link.href}
                            href={link.href}
                            className="text-sm font-medium text-muted-foreground hover:text-foreground"
                        >
                            {link.label}
                        </Link>
                    ))}

                    {/* Call CTA */}
                    <a
                        href={`tel:${siteConfig.phone}`}
                        className="flex items-center gap-1.5 text-sm font-semibold text-primary hover:text-primary/80"
                    >
                        <Phone className="h-4 w-4" />
                        Call Now
                    </a>

                    {/* WhatsApp CTA (PRIMARY) */}
                    <a
                        href={buildWhatsAppUrl(siteConfig.whatsapp)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-4 py-2 rounded-md bg-green-500 text-white text-sm font-semibold hover:bg-green-600 transition"
                    >
                        WhatsApp
                    </a>
                </nav>

                {/* Mobile Menu */}
                <Sheet>
                    <SheetTrigger asChild className="md:hidden">
                        <Button variant="ghost" size="icon">
                            <Menu className="h-5 w-5" />
                        </Button>
                    </SheetTrigger>

                    <SheetContent side="right" className="w-72">
                        <nav className="flex flex-col gap-5 mt-6">

                            {navLinks.map((link) => (
                                <Link key={link.href} href={link.href} className="text-lg font-medium">
                                    {link.label}
                                </Link>
                            ))}

                            <div className="h-px bg-border my-2" />

                            {/* Mobile CTAs */}
                            <a
                                href={`tel:${siteConfig.phone}`}
                                className="flex items-center gap-2 text-lg font-semibold"
                            >
                                <Phone className="h-5 w-5" />
                                Call Now
                            </a>

                            <a
                                href={buildWhatsAppUrl(siteConfig.whatsapp)}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="bg-green-500 text-white text-center py-3 rounded-md font-semibold"
                            >
                                WhatsApp
                            </a>
                        </nav>
                    </SheetContent>
                </Sheet>

            </div>
        </header>
    );
}

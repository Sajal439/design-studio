import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Menu, Phone } from "lucide-react";
import { UserNav } from "@/components/layout/user-nav";
import { siteConfig } from "@/lib/site-config";

const navLinks = [
    { href: "/designs", label: "Design Gallery" },
    { href: "/products", label: "Products" },
    { href: "/estimator", label: "Material Estimator" },
    { href: "/consultation", label: "Book Consultation" },
    { href: "/dashboard", label: "Dashboard" }
];

export function Header() {
    return (
        <header className="sticky top-0 z-50 w-full border-b bg-background/80 backdrop-blur-sm">
            <div className="container mx-auto flex h-16 items-center justify-between px-4">
                {/* Logo */}
                <Link href="/" className="flex items-center gap-2">
                    <span className="text-xl font-bold tracking-tight">
                        Goel Traders <span className="text-primary/60">Design Studio</span>
                    </span>
                </Link>

                {/* Desktop Navigation */}
                <nav className="hidden md:flex items-center gap-6">
                    {navLinks.map((link) => (
                        <Link
                            key={link.href}
                            href={link.href}
                            className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
                        >
                            {link.label}
                        </Link>
                    ))}
                    <a
                        href={`tel:${siteConfig.phone}`}
                        className="flex items-center gap-1.5 text-sm font-medium text-primary transition-colors hover:text-primary/80"
                    >
                        <Phone className="h-3.5 w-3.5" />
                        {siteConfig.phone}
                    </a>
                    <Button asChild variant="outline">
                        <Link href="/quote">Request Quote</Link>
                    </Button>
                    <UserNav />
                </nav>

                {/* Mobile Navigation */}
                <Sheet>
                    <SheetTrigger asChild className="md:hidden">
                        <Button variant="ghost" size="icon">
                            <Menu className="h-5 w-5" />
                        </Button>
                    </SheetTrigger>
                    <SheetContent side="right" className="w-72 overflow-y-auto">
                        <div className="flex justify-between items-center mb-6">
                            <span className="font-bold">Menu</span>
                        </div>
                        <nav className="flex flex-col gap-4">
                            {navLinks.map((link) => (
                                <Link
                                    key={link.href}
                                    href={link.href}
                                    className="text-lg font-medium text-muted-foreground hover:text-foreground"
                                >
                                    {link.label}
                                </Link>
                            ))}
                            <div className="h-px bg-border my-2" />
                            <a
                                href={`tel:${siteConfig.phone}`}
                                className="flex items-center gap-2 text-lg font-medium text-primary"
                            >
                                <Phone className="h-4 w-4" />
                                Call {siteConfig.phone}
                            </a>
                            <div className="flex flex-col gap-2">
                                <Button asChild className="w-full">
                                    <Link href="/quote">Request Quote</Link>
                                </Button>
                            </div>
                            <div className="h-px bg-border my-2" />
                            <div className="flex items-center justify-center pt-2">
                                <UserNav />
                            </div>
                        </nav>
                    </SheetContent>
                </Sheet>
            </div>
        </header>
    );
}

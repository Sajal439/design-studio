import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Sheet, SheetClose, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Calculator, ChevronRight, Menu, MessageCircle, Phone, SwatchBook } from "lucide-react";
import { siteConfig } from "@/lib/site-config";
import { buildWhatsAppUrl } from "@/lib/utils";

const navLinks = [
    { href: "/", label: "Home", description: "See our latest material-first homepage.", icon: SwatchBook },
    { href: "/designs", label: "Designs" },
    { href: "/estimator", label: "Estimator" },
    { href: "/consultation", label: "Consultation", description: "Book a free call or showroom discussion.", icon: MessageCircle },
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

                    {navLinks.filter((link) => link.href !== "/consultation" && link.href !== "/").map((link) => (
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
                        <Button variant="outline" size="icon" className="rounded-full border-slate-200 bg-white/80 shadow-sm">
                            <Menu className="h-5 w-5" />
                        </Button>
                    </SheetTrigger>
                    <SheetContent side="right" className="w-[88vw] max-w-sm border-l border-slate-200 bg-gradient-to-b from-white via-slate-50 to-slate-100 p-0" showCloseButton={false}>
                        <div className="flex h-full flex-col">
                            <div className="border-b border-slate-200/80 bg-white/90 p-5">
                                <div className="flex items-start justify-between gap-4">
                                    <div>
                                        <Link href="/" className="flex items-center gap-2">
                                            <Image src="/logo.svg" className="h-9 w-auto" alt="Goel Traders" width={144} height={36} priority />
                                        </Link>
                                        <p className="mt-3 max-w-xs text-sm leading-6 text-slate-600">
                                            Browse designs, estimate material costs, and connect with the showroom team in one place.
                                        </p>
                                    </div>
                                    <SheetClose asChild>
                                        <Button variant="ghost" size="icon-sm" className="rounded-full border border-slate-200 bg-white text-slate-600">
                                            <ChevronRight className="h-4 w-4 rotate-180" />
                                        </Button>
                                    </SheetClose>
                                </div>
                            </div>
                            <nav className="flex-1 space-y-3 overflow-y-auto p-5">
                                {navLinks.map((link) => {
                                    const Icon = link.icon ?? (link.href === "/estimator" ? Calculator : SwatchBook);

                                    return (
                                        <SheetClose asChild key={link.href}>
                                            <Link
                                                href={link.href}
                                                className="flex items-center gap-4 rounded-[1.4rem] border border-slate-200 bg-white/90 px-4 py-4 shadow-sm transition-all hover:-translate-y-0.5 hover:border-slate-300 hover:shadow-md"
                                            >
                                                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-slate-100 text-slate-700">
                                                    <Icon className="h-5 w-5" />
                                                </div>
                                                <div className="min-w-0 flex-1">
                                                    <p className="text-base font-semibold text-slate-900">{link.label}</p>
                                                    <p className="text-sm text-slate-500">
                                                        {link.description ?? "Open this section"}
                                                    </p>
                                                </div>
                                                <ChevronRight className="h-4 w-4 text-slate-400" />
                                            </Link>
                                        </SheetClose>
                                    );
                                })}
                            </nav>
                            <div className="border-t border-slate-200/80 bg-white/90 p-5">
                                <div className="grid grid-cols-2 gap-3">
                                    <a
                                        href={`tel:${siteConfig.phone}`}
                                        className="flex items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700"
                                    >
                                        <Phone className="h-4 w-4" />
                                        Call
                                    </a>

                                    <a
                                        href={buildWhatsAppUrl(siteConfig.whatsapp)}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="flex items-center justify-center gap-2 rounded-2xl bg-[#25D366] px-4 py-3 text-sm font-semibold text-white"
                                    >
                                        <MessageCircle className="h-4 w-4" />
                                        WhatsApp
                                    </a>
                                </div>
                            </div>
                        </div>
                    </SheetContent>
                </Sheet>
            </div>
        </header>
    );
}

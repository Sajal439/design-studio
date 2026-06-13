import Link from "next/link";
import { Separator } from "@repo/ui/separator";
import { siteConfig } from "@/lib/site-config";

export function Footer() {
    const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(siteConfig.address)}`;

    return (
        <footer className="border-t bg-muted/30">
            <div className="container mx-auto px-4 py-12">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                    {/* Brand */}
                    <div className="md:col-span-1">
                        <h3 className="text-lg font-bold">Goel Traders</h3>
                        <p className="mt-2 text-sm text-muted-foreground">
                            Your trusted partner for interior design materials. Quality plywood, laminates, and hardware.
                        </p>
                    </div>

                    {/* Quick Links */}
                    <div>
                        <h4 className="text-sm font-semibold mb-3">Explore</h4>
                        <ul className="space-y-2 text-sm text-muted-foreground">
                            <li><Link href="/" className="hover:text-foreground">Home</Link></li>
                            <li><Link href="/designs" className="hover:text-foreground">Design Gallery</Link></li>
                            <li><Link href="/estimator" className="hover:text-foreground">Material Estimator</Link></li>
                        </ul>
                    </div>

                    {/* Services */}
                    <div>
                        <h4 className="text-sm font-semibold mb-3">Services</h4>
                        <ul className="space-y-2 text-sm text-muted-foreground">
                            <li><Link href="/quote" className="hover:text-foreground">Request Quote</Link></li>
                            <li><Link href="/consultation" className="hover:text-foreground">Book Consultation</Link></li>
                        </ul>
                    </div>

                    {/* Contact */}
                    <div>
                        <h4 className="text-sm font-semibold mb-3">Contact</h4>
                        <ul className="space-y-2 text-sm text-muted-foreground">
                            <li>
                                <a
                                    href={mapsUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="hover:text-foreground"
                                >
                                    📍 {siteConfig.address}
                                </a>
                            </li>
                            <li>
                                <a href={`tel:${siteConfig.phone}`} className="hover:text-foreground">
                                    📞 {siteConfig.phone}
                                </a>
                            </li>
                            <li>
                                <a href={`mailto:${siteConfig.email}`} className="hover:text-foreground">
                                    ✉️ {siteConfig.email}
                                </a>
                            </li>
                        </ul>
                    </div>
                </div>

                <Separator className="my-8" />

                <p className="text-center text-sm text-muted-foreground">
                    © {new Date().getFullYear()} Goel Traders Design Studio. All rights reserved.
                </p>
            </div>
        </footer>
    );
}

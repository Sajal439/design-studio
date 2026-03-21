import { MapPin, MessageCircle, Navigation, Phone } from "lucide-react";
import { siteConfig } from "@/lib/site-config";
import { buildWhatsAppUrl } from "@/lib/utils";

const showroomQuery = `${siteConfig.name}, ${siteConfig.address}`;
const mapsSearchUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(showroomQuery)}`;
const mapsEmbedUrl = `https://maps.google.com/maps?q=${encodeURIComponent(showroomQuery)}&t=&z=15&ie=UTF8&iwloc=B&output=embed`;

export function LocationSection() {
  return (
    <section className="border-t border-slate-100 bg-white py-24">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-14 max-w-2xl">
          <p className="mb-3 text-xs font-semibold uppercase tracking-[0.28em] text-slate-500">
            Visit The Showroom
          </p>
          <h2 className="text-3xl font-bold tracking-tight text-slate-900 md:text-4xl">
            See finishes, compare materials, and finalize faster in person.
          </h2>
          <p className="mt-4 text-lg leading-8 text-slate-600">
            Most customers prefer visiting our showroom before placing an order. Explore laminates,
            plywood, hardware, and finish combinations with our team on-site.
          </p>
        </div>

        <div className="grid gap-8 lg:grid-cols-[1.1fr_0.9fr]">
          <div className="overflow-hidden rounded-[2rem] border border-slate-200 bg-slate-50 shadow-xl shadow-slate-200/40">
            <div className="border-b border-slate-200 bg-slate-900 px-6 py-5 text-white">
              <p className="text-sm font-semibold uppercase tracking-[0.22em] text-slate-300">
                Showroom Location
              </p>
              <h3 className="mt-2 text-2xl font-bold">Goel Traders, Gharaunda</h3>
            </div>
            <div className="aspect-[4/3] w-full bg-slate-100">
              <iframe
                title="Goel Traders showroom location"
                src={mapsEmbedUrl}
                className="h-full w-full border-0"
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
              />
            </div>
          </div>

          <div className="rounded-[2rem] border border-slate-200 bg-slate-50 p-8 shadow-sm">
            <div className="space-y-6">
              <div className="rounded-[1.5rem] bg-white p-5 shadow-sm">
                <div className="flex items-start gap-4">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-slate-900 text-white">
                    <MapPin className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold uppercase tracking-[0.22em] text-slate-500">
                      Address
                    </p>
                    <p className="mt-2 text-base font-semibold leading-7 text-slate-900">
                      {siteConfig.address}
                    </p>
                  </div>
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2">
                <div className="rounded-[1.5rem] bg-white p-5 shadow-sm">
                  <p className="text-sm font-semibold uppercase tracking-[0.22em] text-slate-500">
                    Call Before Visit
                  </p>
                  <a
                    href={`tel:${siteConfig.phone}`}
                    className="mt-3 inline-flex items-center gap-2 text-base font-semibold text-slate-900 hover:text-slate-600"
                  >
                    <Phone className="h-4 w-4" />
                    {siteConfig.phone}
                  </a>
                </div>

                <div className="rounded-[1.5rem] bg-white p-5 shadow-sm">
                  <p className="text-sm font-semibold uppercase tracking-[0.22em] text-slate-500">
                    Quick WhatsApp
                  </p>
                  <a
                    href={buildWhatsAppUrl(siteConfig.whatsapp, "Hi! I want to visit the showroom. Please guide me with directions and timing.")}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-3 inline-flex items-center gap-2 text-base font-semibold text-[#25D366] hover:text-[#1fa856]"
                  >
                    <MessageCircle className="h-4 w-4" />
                    Message Before Visit
                  </a>
                </div>
              </div>

              <div className="rounded-[1.5rem] border border-dashed border-slate-300 bg-white p-5">
                <p className="text-sm leading-7 text-slate-600">
                  Bring your room layout, carpenter list, or reference photos. Our team can help you shortlist
                  materials faster when you visit the showroom.
                </p>
              </div>

              <div className="flex flex-col gap-3 sm:flex-row">
                <a
                  href={mapsSearchUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center gap-2 rounded-2xl bg-slate-900 px-6 py-4 text-sm font-semibold text-white transition-colors hover:bg-slate-800"
                >
                  <Navigation className="h-4 w-4" />
                  Get Directions
                </a>
                <a
                  href={`tel:${siteConfig.phone}`}
                  className="inline-flex items-center justify-center gap-2 rounded-2xl border border-slate-300 bg-white px-6 py-4 text-sm font-semibold text-slate-700 transition-colors hover:bg-slate-100"
                >
                  <Phone className="h-4 w-4" />
                  Call Showroom
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

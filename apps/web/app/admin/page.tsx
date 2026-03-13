export const dynamic = "force-dynamic";

import { prisma } from "@repo/database";
import { Prisma } from "@repo/database";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { StatsCard } from "@/components/admin/stats-card";

type QuoteItem = Prisma.QuoteRequestGetPayload<Record<string, never>>;
type ConsultationItem = Prisma.ConsultationGetPayload<Record<string, never>>;

async function getDashboardData() {
  const [designsCount, productsCount, quotesCount, consultationsCount, usersCount, recentQuotes, recentConsultations] = await Promise.all([
    prisma.design.count(),
    prisma.product.count(),
    prisma.quoteRequest.count(),
    prisma.consultation.count(),
    prisma.user.count(),
    prisma.quoteRequest.findMany({ orderBy: { createdAt: "desc" }, take: 5 }),
    prisma.consultation.findMany({ orderBy: { createdAt: "desc" }, take: 5 }),
  ]);

  return { designsCount, productsCount, quotesCount, consultationsCount, usersCount, recentQuotes, recentConsultations };
}

export default async function AdminDashboardPage() {
  const data = await getDashboardData();

  return (
    <div className="space-y-6">
      <section>
        <div className="mb-4">
          <h1 className="text-2xl font-bold">Overview</h1>
          <p className="text-muted-foreground">Snapshot of platform content, leads, and managed users.</p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
          <StatsCard title="Total Designs" value={data.designsCount} description="Published inspirations" />
          <StatsCard title="Total Products" value={data.productsCount} description="Catalog entries" />
          <StatsCard title="Quote Requests" value={data.quotesCount} description="Captured quote leads" />
          <StatsCard title="Consultations" value={data.consultationsCount} description="Consultation bookings" />
          <StatsCard title="Users" value={data.usersCount} description="Lead-derived user profiles" />
        </div>
      </section>

      <section className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader><CardTitle>Recent Quote Requests</CardTitle></CardHeader>
          <CardContent>
            {data.recentQuotes.length === 0 ? <p className="text-sm text-muted-foreground">No quote requests yet.</p> : (
              <div className="space-y-3">
                {data.recentQuotes.map((quote: QuoteItem) => (
                  <div key={quote.id} className="rounded-lg border bg-background p-4">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="font-medium">{quote.name}</p>
                        <p className="text-sm text-muted-foreground">{quote.projectType} • {quote.location}</p>
                        <p className="text-sm text-muted-foreground">{quote.email} • {quote.phone}</p>
                      </div>
                      <Badge variant="outline" className="capitalize">{quote.status}</Badge>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>Recent Consultations</CardTitle></CardHeader>
          <CardContent>
            {data.recentConsultations.length === 0 ? <p className="text-sm text-muted-foreground">No consultations yet.</p> : (
              <div className="space-y-3">
                {data.recentConsultations.map((consultation: ConsultationItem) => (
                  <div key={consultation.id} className="rounded-lg border bg-background p-4">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="font-medium">{consultation.name}</p>
                        <p className="text-sm text-muted-foreground">{consultation.projectType} • {consultation.location}</p>
                        <p className="text-sm text-muted-foreground">{consultation.consultationType}</p>
                      </div>
                      <Badge variant="outline" className="capitalize">{consultation.status}</Badge>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </section>
    </div>
  );
}


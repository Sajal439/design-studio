export const dynamic = "force-dynamic";

import { prisma } from "@repo/database";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { StatsCard } from "@/components/admin/stats-card";
import { LeadTrendBars, SourceBreakdown } from "@/components/admin/lead-analytics";
import { TrendingUp, BarChart3 } from "lucide-react";

const DAY_LABELS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

// Raw-query result type for source breakdown
type SourceRow = { source: string | null; count: bigint };

async function getDashboardData() {
  const now = new Date();
  const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
  const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

  const [
    designsCount,
    productsCount,
    quotesCount,
    consultationsCount,
    estimatesCount,
    usersCount,
    recentQuotes,
    recentConsultations,
    recentQuotesByDay,
    recentConsultationsByDay,
    recentEstimatesByDay,
  ] = await Promise.all([
    prisma.design.count(),
    prisma.product.count(),
    prisma.quoteRequest.count(),
    prisma.consultation.count(),
    prisma.estimate.count(),
    prisma.user.count(),
    prisma.quoteRequest.findMany({ orderBy: { createdAt: "desc" }, take: 5 }),
    prisma.consultation.findMany({ orderBy: { createdAt: "desc" }, take: 5 }),
    prisma.quoteRequest.findMany({
      where: { createdAt: { gte: sevenDaysAgo } },
      select: { createdAt: true },
    }),
    prisma.consultation.findMany({
      where: { createdAt: { gte: sevenDaysAgo } },
      select: { createdAt: true },
    }),
    prisma.estimate.findMany({
      where: { createdAt: { gte: sevenDaysAgo } },
      select: { createdAt: true },
    }),
  ]);

  // Try raw SQL for source breakdown — gracefully degrade if column doesn't exist yet
  let sourceBreakdown: { source: string; count: number }[] = [];
  try {
    const quoteSourceRows = await prisma.$queryRaw<SourceRow[]>`
      SELECT source, COUNT(*) as count FROM "QuoteRequest"
      WHERE "createdAt" >= ${thirtyDaysAgo} GROUP BY source ORDER BY count DESC
    `;
    const consultSourceRows = await prisma.$queryRaw<SourceRow[]>`
      SELECT source, COUNT(*) as count FROM "Consultation"
      WHERE "createdAt" >= ${thirtyDaysAgo} GROUP BY source ORDER BY count DESC
    `;
    const sourceMap = new Map<string, number>();
    for (const row of [...quoteSourceRows, ...consultSourceRows]) {
      const key = row.source ?? "direct";
      sourceMap.set(key, (sourceMap.get(key) ?? 0) + Number(row.count));
    }
    sourceBreakdown = Array.from(sourceMap.entries())
      .map(([source, count]) => ({ source, count }))
      .sort((a, b) => b.count - a.count);
  } catch {
    // Migration not yet applied — source column doesn't exist; show empty
  }

  // Build 7-day trend array
  const trendData = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(now);
    d.setDate(d.getDate() - (6 - i));
    const dayStart = new Date(d.getFullYear(), d.getMonth(), d.getDate());
    const dayEnd = new Date(dayStart.getTime() + 24 * 60 * 60 * 1000);
    return {
      label: DAY_LABELS[d.getDay()] ?? "?",
      quotes: recentQuotesByDay.filter(
        (r) => r.createdAt >= dayStart && r.createdAt < dayEnd
      ).length,
      consultations: recentConsultationsByDay.filter(
        (r) => r.createdAt >= dayStart && r.createdAt < dayEnd
      ).length,
      estimates: recentEstimatesByDay.filter(
        (r) => r.createdAt >= dayStart && r.createdAt < dayEnd
      ).length,
    };
  });

  return {
    designsCount, productsCount, quotesCount, consultationsCount,
    estimatesCount, usersCount, recentQuotes, recentConsultations,
    trendData, sourceBreakdown,
  };
}

export default async function AdminDashboardPage() {
  const data = await getDashboardData();

  return (
    <div className="space-y-6">
      {/* ── Stats strip ── */}
      <section>
        <div className="mb-4">
          <h1 className="text-2xl font-bold">Overview</h1>
          <p className="text-muted-foreground">Lead activity, content counts, and funnel snapshot.</p>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-6">
          <StatsCard title="Designs" value={data.designsCount} description="Published" />
          <StatsCard title="Products" value={data.productsCount} description="Catalog" />
          <StatsCard title="Quotes" value={data.quotesCount} description="Total" />
          <StatsCard title="Consultations" value={data.consultationsCount} description="Total" />
          <StatsCard title="Estimates" value={data.estimatesCount} description="Saved" />
          <StatsCard title="Users" value={data.usersCount} description="Registered" />
        </div>
      </section>

      {/* ── Lead analytics ── */}
      <section className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              7-Day Lead Trend
            </CardTitle>
          </CardHeader>
          <CardContent>
            <LeadTrendBars data={data.trendData} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              Lead Source Breakdown (30 days)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <SourceBreakdown items={data.sourceBreakdown} />
          </CardContent>
        </Card>
      </section>

      {/* ── Conversion funnel ── */}
      <section>
        <Card>
          <CardHeader><CardTitle>Conversion Funnel</CardTitle></CardHeader>
          <CardContent>
            <div className="grid gap-4 sm:grid-cols-3 text-center">
              {[
                {
                  label: "Estimates Saved",
                  value: data.estimatesCount,
                  color: "bg-amber-100 text-amber-800",
                  note: "High-intent visitors",
                },
                {
                  label: "Quote Requests",
                  value: data.quotesCount,
                  color: "bg-blue-100 text-blue-800",
                  note: data.estimatesCount > 0
                    ? `${Math.round((data.quotesCount / data.estimatesCount) * 100)}% of estimates`
                    : "Track conversions",
                },
                {
                  label: "Consultations",
                  value: data.consultationsCount,
                  color: "bg-green-100 text-green-800",
                  note: "In-person contact",
                },
              ].map((step) => (
                <div key={step.label} className={`rounded-2xl p-5 ${step.color}`}>
                  <p className="text-4xl font-bold">{step.value}</p>
                  <p className="mt-1 font-semibold">{step.label}</p>
                  <p className="mt-1 text-xs opacity-70">{step.note}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </section>

      {/* ── Recent leads ── */}
      <section className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader><CardTitle>Recent Quote Requests</CardTitle></CardHeader>
          <CardContent>
            {data.recentQuotes.length === 0
              ? <p className="text-sm text-muted-foreground">No quote requests yet.</p>
              : (
                <div className="space-y-3">
                  {data.recentQuotes.map((quote) => (
                    <div key={quote.id} className="rounded-lg border bg-background p-4">
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <p className="font-medium">{quote.name}</p>
                          <p className="text-sm text-muted-foreground">{quote.projectType} · {quote.location}</p>
                          <p className="text-sm text-muted-foreground">{quote.phone}</p>
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
            {data.recentConsultations.length === 0
              ? <p className="text-sm text-muted-foreground">No consultations yet.</p>
              : (
                <div className="space-y-3">
                  {data.recentConsultations.map((consultation) => (
                    <div key={consultation.id} className="rounded-lg border bg-background p-4">
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <p className="font-medium">{consultation.name}</p>
                          <p className="text-sm text-muted-foreground">{consultation.projectType} · {consultation.location}</p>
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

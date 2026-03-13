export const dynamic = "force-dynamic";

import { prisma } from "@repo/database";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { RecordSelect } from "@/components/admin/record-select";

const quoteQuery = () => prisma.quoteRequest.findMany({ include: { user: true } });
type QuoteWithUser = Awaited<ReturnType<typeof quoteQuery>>[number];

function formatDate(date: Date) {
  return new Intl.DateTimeFormat("en-IN", { dateStyle: "medium", timeStyle: "short" }).format(date);
}

export default async function AdminQuotesPage() {
  const quotes = await prisma.quoteRequest.findMany({ orderBy: { createdAt: "desc" }, include: { user: true } });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Quote Requests</h1>
        <p className="mt-2 text-muted-foreground">Review incoming quote leads and update their pipeline status.</p>
      </div>
      <Card>
        <CardHeader><CardTitle>All Quote Requests</CardTitle></CardHeader>
        <CardContent>
          {quotes.length === 0 ? <p className="text-sm text-muted-foreground">No quote requests yet.</p> : (
            <div className="space-y-4">
              {quotes.map((quote: QuoteWithUser) => (
                <div key={quote.id} className="rounded-lg border bg-background p-4">
                  <div className="grid gap-4 lg:grid-cols-[1.5fr_1fr_220px]">
                    <div className="space-y-2">
                      <div className="flex items-center gap-2"><p className="font-semibold">{quote.name}</p><Badge variant="outline" className="capitalize">{quote.status}</Badge></div>
                      <p className="text-sm text-muted-foreground">{quote.projectType} • {quote.location}</p>
                      <p className="text-sm text-muted-foreground">{quote.email} • {quote.phone}</p>
                      <p className="text-sm text-muted-foreground">Submitted on {formatDate(quote.createdAt)}</p>
                      {quote.designSlug || quote.productSlug ? <p className="text-sm"><span className="font-medium">Source:</span> {quote.designSlug ? `Design - ${quote.designSlug}` : `Product - ${quote.productSlug}`}</p> : null}
                      {quote.message ? <p className="text-sm text-muted-foreground"><span className="font-medium text-foreground">Notes:</span> {quote.message}</p> : null}
                    </div>
                    <div className="space-y-2">
                      <p className="text-sm font-medium">Linked User</p>
                      <div className="rounded-md bg-muted/50 p-3 text-sm text-muted-foreground">{quote.user ? `${quote.user.name} • ${quote.user.phone}` : "Lead not linked"}</div>
                    </div>
                    <div>
                      <p className="mb-2 text-sm font-medium">Update Status</p>
                      <RecordSelect endpoint="/api/admin/quotes" id={quote.id} options={["new", "contacted", "quoted", "closed"]} value={quote.status} />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}


export const dynamic = "force-dynamic";

import { prisma } from "@repo/database";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { RecordSelect } from "@/components/admin/record-select";

function formatDate(date: Date) {
  return new Intl.DateTimeFormat("en-IN", { dateStyle: "medium", timeStyle: "short" }).format(date);
}

export default async function AdminConsultationsPage() {
  const consultations = await prisma.consultation.findMany({ orderBy: { createdAt: "desc" }, include: { user: true } });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Consultations</h1>
        <p className="mt-2 text-muted-foreground">Track bookings and keep consultation progress up to date.</p>
      </div>
      <Card>
        <CardHeader><CardTitle>All Consultation Requests</CardTitle></CardHeader>
        <CardContent>
          {consultations.length === 0 ? <p className="text-sm text-muted-foreground">No consultations yet.</p> : (
            <div className="space-y-4">
              {consultations.map((consultation) => (
                <div key={consultation.id} className="rounded-lg border bg-background p-4">
                  <div className="grid gap-4 lg:grid-cols-[1.5fr_1fr_220px]">
                    <div className="space-y-2">
                      <div className="flex items-center gap-2"><p className="font-semibold">{consultation.name}</p><Badge variant="outline" className="capitalize">{consultation.status}</Badge></div>
                      <p className="text-sm text-muted-foreground">{consultation.projectType} • {consultation.location}</p>
                      <p className="text-sm text-muted-foreground">{consultation.phone}</p>
                      <p className="text-sm text-muted-foreground">Submitted on {formatDate(consultation.createdAt)}</p>
                      <p className="text-sm"><span className="font-medium">Consultation Type:</span> {consultation.consultationType}</p>
                    </div>
                    <div className="space-y-2">
                      <p className="text-sm font-medium">Linked User</p>
                      <div className="rounded-md bg-muted/50 p-3 text-sm text-muted-foreground">{consultation.user ? `${consultation.user.name} • ${consultation.user.phone}` : "Lead not linked"}</div>
                    </div>
                    <div>
                      <p className="mb-2 text-sm font-medium">Update Status</p>
                      <RecordSelect endpoint="/api/admin/consultations" id={consultation.id} options={["new", "confirmed", "completed", "cancelled"]} value={consultation.status} />
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


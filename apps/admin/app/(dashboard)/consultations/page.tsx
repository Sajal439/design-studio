import { prisma } from "@repo/database";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@repo/ui/table";
import { Badge } from "@repo/ui/badge";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@repo/ui/card";

export const revalidate = 0; // Don't cache this page so we see new bookings

export default async function ConsultationsPage() {
  const consultations = await prisma.consultation.findMany({
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Consultations</h2>
        <p className="text-muted-foreground">
          View and manage your incoming consultation bookings.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Recent Bookings</CardTitle>
          <CardDescription>A list of all consultation requests from the public website.</CardDescription>
        </CardHeader>
        <CardContent>
          {consultations.length === 0 ? (
            <div className="flex h-32 items-center justify-center rounded-md border border-dashed text-sm text-muted-foreground">
              No consultations booked yet.
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Contact</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Message</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {consultations.map((booking) => (
                  <TableRow key={booking.id}>
                    <TableCell className="font-medium">
                      {booking.createdAt.toLocaleDateString()}
                    </TableCell>
                    <TableCell>{booking.name}</TableCell>
                    <TableCell>
                      <div className="flex flex-col">
                        <span>{booking.phone}</span>
                        {booking.email && <span className="text-xs text-muted-foreground">{booking.email}</span>}
                      </div>
                    </TableCell>
                    <TableCell className="capitalize">{booking.type.replace("-", " ")}</TableCell>
                    <TableCell>
                      <Badge variant={booking.status === "PENDING" ? "default" : "secondary"}>
                        {booking.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="max-w-[200px] truncate" title={booking.message || ""}>
                      {booking.message || "-"}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

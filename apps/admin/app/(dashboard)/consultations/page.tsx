import { prisma } from "@repo/database";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@repo/ui/table";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@repo/ui/card";
import { ConsultationStatusDropdown } from "@/components/consultation-status-dropdown";

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
          View and manage your incoming consultation bookings. Click the status badge to update it.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Recent Bookings</CardTitle>
          <CardDescription>
            A list of all consultation requests from the public website.
            {consultations.length > 0 && (
              <span className="ml-2 text-foreground font-medium">
                ({consultations.length} total)
              </span>
            )}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {consultations.length === 0 ? (
            <div className="flex h-32 items-center justify-center rounded-md border border-dashed text-sm text-muted-foreground">
              No consultations booked yet.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Name</TableHead>
                    <TableHead>Contact</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Project</TableHead>
                    <TableHead>Location</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {consultations.map((booking) => (
                    <TableRow key={booking.id}>
                      <TableCell className="font-medium whitespace-nowrap">
                        {booking.createdAt.toLocaleDateString("en-IN", {
                          day: "2-digit",
                          month: "short",
                          year: "numeric",
                        })}
                      </TableCell>
                      <TableCell className="font-medium">{booking.name}</TableCell>
                      <TableCell>
                        <div className="flex flex-col">
                          <a
                            href={`tel:${booking.phone}`}
                            className="text-sm font-medium text-primary hover:underline"
                          >
                            {booking.phone}
                          </a>
                          {booking.email && (
                            <span className="text-xs text-muted-foreground">{booking.email}</span>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="capitalize whitespace-nowrap">
                        {booking.type.replace("-", " ")}
                      </TableCell>
                      <TableCell className="whitespace-nowrap">
                        {booking.projectType || (
                          <span className="text-muted-foreground">-</span>
                        )}
                      </TableCell>
                      <TableCell className="whitespace-nowrap">
                        {booking.location || (
                          <span className="text-muted-foreground">-</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <ConsultationStatusDropdown
                          id={booking.id}
                          currentStatus={booking.status}
                        />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

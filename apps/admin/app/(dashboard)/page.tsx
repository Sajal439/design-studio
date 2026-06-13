import { Card, CardContent, CardHeader, CardTitle } from "@repo/ui/card";
import { prisma } from "@repo/database";
import { CalendarDays, Images, IndianRupee, Users } from "lucide-react";

export default async function AdminDashboardPage() {
  const [totalDesigns, publishedDesigns, totalConsultations, pendingConsultations] = await Promise.all([
    prisma.design.count(),
    prisma.design.count({ where: { isPublished: true } }),
    prisma.consultation.count(),
    prisma.consultation.count({ where: { status: "PENDING" } }),
  ]);

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Overview</h2>
        <p className="text-muted-foreground">
          Welcome to the Goel Traders administrative portal.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Designs</CardTitle>
            <Images className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalDesigns}</div>
            <p className="text-xs text-muted-foreground">
              {publishedDesigns} published
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Consultations</CardTitle>
            <CalendarDays className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalConsultations}</div>
            <p className="text-xs text-muted-foreground">
              {pendingConsultations} pending requests
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Price Book Items</CardTitle>
            <IndianRupee className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">142</div>
            <p className="text-xs text-muted-foreground">
              Active material prices
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">+0</div>
            <p className="text-xs text-muted-foreground">
              Billing integration pending
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <Card className="col-span-4">
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">No recent activity to display yet. Charts will populate as data comes in.</p>
            <div className="mt-4 h-[200px] w-full rounded-md border border-dashed flex items-center justify-center bg-zinc-50/50">
              <span className="text-sm text-zinc-400">Activity Chart Placeholder</span>
            </div>
          </CardContent>
        </Card>
        <Card className="col-span-3">
          <CardHeader>
            <CardTitle>Pending Actions</CardTitle>
          </CardHeader>
          <CardContent>
            {pendingConsultations > 0 ? (
              <div className="rounded-md border border-orange-200 bg-orange-50 p-4">
                <div className="flex items-center gap-3">
                  <CalendarDays className="h-5 w-5 text-orange-500" />
                  <p className="text-sm font-medium text-orange-900">You have {pendingConsultations} new consultation requests.</p>
                </div>
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">You're all caught up!</p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

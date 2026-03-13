export const dynamic = "force-dynamic";

import { prisma } from "@repo/database";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { RecordSelect } from "@/components/admin/record-select";

function formatDate(date: Date) {
  return new Intl.DateTimeFormat("en-IN", { dateStyle: "medium" }).format(date);
}

export default async function AdminUsersPage() {
  const users = await prisma.user.findMany({
    include: { _count: { select: { quoteRequests: true, consultations: true } } },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Users</h1>
        <p className="mt-2 text-muted-foreground">Lead-derived users that can later plug into full authentication.</p>
      </div>
      <Card>
        <CardHeader><CardTitle>All Users</CardTitle></CardHeader>
        <CardContent>
          {users.length === 0 ? <p className="text-sm text-muted-foreground">No users yet.</p> : (
            <div className="space-y-4">
              {users.map((user) => (
                <div key={user.id} className="rounded-lg border bg-background p-4">
                  <div className="grid gap-4 lg:grid-cols-[1.5fr_220px_220px]">
                    <div className="space-y-2">
                      <div className="flex items-center gap-2"><p className="font-semibold">{user.name}</p><Badge variant={user.isActive ? "default" : "outline"}>{user.isActive ? "active" : "inactive"}</Badge></div>
                      <p className="text-sm text-muted-foreground">{user.phone}{user.email ? ` • ${user.email}` : ""}</p>
                      <p className="text-sm text-muted-foreground">Joined on {formatDate(user.createdAt)}</p>
                      <p className="text-sm text-muted-foreground">Quotes: {user._count.quoteRequests} • Consultations: {user._count.consultations}</p>
                    </div>
                    <div>
                      <p className="mb-2 text-sm font-medium">Role</p>
                      <RecordSelect endpoint="/api/admin/users" field="role" id={user.id} options={["customer", "admin"]} value={user.role} />
                    </div>
                    <div>
                      <p className="mb-2 text-sm font-medium">Status</p>
                      <RecordSelect endpoint="/api/admin/users" field="isActive" id={user.id} options={["true", "false"]} value={String(user.isActive)} />
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


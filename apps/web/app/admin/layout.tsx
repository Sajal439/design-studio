import type { ReactNode } from "react";
import Link from "next/link";
import { AdminNav } from "@/components/admin/admin-nav";
import { LogoutButton } from "@/components/admin/logout-button";

export default function AdminLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-muted/30">
      <div className="mx-auto grid min-h-screen max-w-7xl lg:grid-cols-[260px_1fr]">
        <aside className="border-r bg-background">
          <div className="sticky top-0 p-6">
            <Link href="/admin" className="block">
              <h1 className="text-xl font-bold">Goel Traders Admin</h1>
              <p className="mt-1 text-sm text-muted-foreground">Internal dashboard</p>
            </Link>
            <div className="mt-8">
              <AdminNav />
            </div>
          </div>
        </aside>

        <div className="flex min-h-screen flex-col">
          <header className="border-b bg-background">
            <div className="flex items-center justify-between px-6 py-4">
              <div>
                <h2 className="text-lg font-semibold">Admin Dashboard</h2>
                <p className="text-sm text-muted-foreground">Protected admin area for managing content and leads.</p>
              </div>
              <LogoutButton />
            </div>
          </header>

          <main className="flex-1 px-6 py-6">{children}</main>
        </div>
      </div>
    </div>
  );
}

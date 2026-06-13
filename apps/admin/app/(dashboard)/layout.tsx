import type { ReactNode } from "react";
import Link from "next/link";
import { AdminNav } from "@/components/admin-nav";
import { UserNav } from "@/components/user-nav";

export default function AdminLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-zinc-50/50">
      <div className="mx-auto grid min-h-screen lg:grid-cols-[280px_1fr]">
        <aside className="border-r border-zinc-200 bg-white shadow-sm">
          <div className="sticky top-0 flex h-screen flex-col px-4 py-6">
            <Link href="/" className="mb-8 flex items-center gap-3 px-2">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-sm">
                <span className="font-bold text-lg">G</span>
              </div>
              <div>
                <h1 className="text-base font-bold leading-tight">Goel Traders</h1>
                <p className="text-xs text-muted-foreground">Admin Portal</p>
              </div>
            </Link>
            <div className="flex-1 overflow-y-auto pr-2">
              <AdminNav />
            </div>
            
            {/* Optional footer area in sidebar */}
            <div className="mt-auto border-t pt-4 px-2">
              <p className="text-xs text-muted-foreground text-center">v2.0.0</p>
            </div>
          </div>
        </aside>

        <div className="flex min-h-screen flex-col">
          <header className="sticky top-0 z-30 border-b border-zinc-200 bg-white/80 backdrop-blur-md">
            <div className="flex h-16 items-center justify-between px-8">
              <div>
                <h2 className="text-lg font-semibold tracking-tight">Dashboard Overview</h2>
              </div>
              <div className="flex items-center gap-4">
                <UserNav />
              </div>
            </div>
          </header>

          <main className="flex-1 overflow-y-auto p-8">
            <div className="mx-auto max-w-6xl">{children}</div>
          </main>
        </div>
      </div>
    </div>
  );
}

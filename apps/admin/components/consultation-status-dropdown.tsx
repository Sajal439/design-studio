"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@repo/ui/dropdown-menu";
import { Badge } from "@repo/ui/badge";
import { ChevronDown, Loader2 } from "lucide-react";

const STATUSES = [
  { value: "PENDING", label: "Pending", color: "default" as const },
  { value: "CONTACTED", label: "Contacted", color: "secondary" as const },
  { value: "COMPLETED", label: "Completed", color: "outline" as const },
  { value: "CANCELLED", label: "Cancelled", color: "destructive" as const },
] as const;

type StatusValue = (typeof STATUSES)[number]["value"];

function getStatusConfig(status: string) {
  return STATUSES.find((s) => s.value === status) ?? STATUSES[0];
}

// Colored dot for visual status indication
function StatusDot({ status }: { status: string }) {
  const colorMap: Record<string, string> = {
    PENDING: "bg-amber-500",
    CONTACTED: "bg-blue-500",
    COMPLETED: "bg-emerald-500",
    CANCELLED: "bg-red-400",
  };
  return (
    <span
      className={`inline-block h-2 w-2 rounded-full ${colorMap[status] ?? "bg-gray-400"}`}
    />
  );
}

export function ConsultationStatusDropdown({
  id,
  currentStatus,
}: {
  id: string;
  currentStatus: string;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const config = getStatusConfig(currentStatus);

  async function handleStatusChange(newStatus: StatusValue) {
    if (newStatus === currentStatus) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/consultations/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      if (res.ok) {
        router.refresh();
      }
    } catch (err) {
      console.error("Failed to update status:", err);
    } finally {
      setLoading(false);
    }
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild disabled={loading}>
        <button
          type="button"
          className="inline-flex items-center gap-1.5 rounded-md border border-input bg-background px-2.5 py-1.5 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50"
        >
          {loading ? (
            <Loader2 className="h-3.5 w-3.5 animate-spin" />
          ) : (
            <StatusDot status={currentStatus} />
          )}
          {config.label}
          <ChevronDown className="h-3.5 w-3.5 text-muted-foreground" />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-44">
        <DropdownMenuLabel>Update Status</DropdownMenuLabel>
        <DropdownMenuSeparator />
        {STATUSES.map((status) => (
          <DropdownMenuItem
            key={status.value}
            onClick={() => void handleStatusChange(status.value)}
            className={currentStatus === status.value ? "bg-accent" : ""}
          >
            <StatusDot status={status.value} />
            {status.label}
            {currentStatus === status.value && (
              <span className="ml-auto text-xs text-muted-foreground">Current</span>
            )}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

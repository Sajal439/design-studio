"use client";

import { useRouter } from "next/navigation";
import { LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";

export function LogoutButton() {
  const router = useRouter();

  async function handleLogout() {
    await fetch("/api/admin/session", { method: "DELETE" });
    router.push("/admin/login");
    router.refresh();
  }

  return (
    <Button onClick={handleLogout} size="sm" variant="outline">
      <LogOut className="mr-2 h-4 w-4" />
      Logout
    </Button>
  );
}

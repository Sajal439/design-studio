"use client";

import { useState, useEffect } from "react";
import { FolderPlus, FolderOpen, Plus, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface Project {
  id: string;
  name: string;
  status: string;
  _count: { items: number };
}

interface AddToProjectDialogProps {
  designId?: string;
  estimateId?: string;
  /** Small trigger button label, defaults to "Add to project" */
  label?: string;
  className?: string;
}

const STATUS_BADGES: Record<string, string> = {
  planning: "bg-blue-100 text-blue-700",
  quoted: "bg-amber-100 text-amber-700",
  in_progress: "bg-green-100 text-green-700",
  completed: "bg-gray-100 text-gray-600",
};

export function AddToProjectDialog({
  designId,
  estimateId,
  label = "Add to project",
  className,
}: AddToProjectDialogProps) {
  const [open, setOpen] = useState(false);
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(false);
  const [addedIds, setAddedIds] = useState<Set<string>>(new Set());

  // New project form
  const [newName, setNewName] = useState("");
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    if (!open) return;
    setLoading(true);
    fetch("/api/projects")
      .then((r) => {
        if (r.status === 401) {
          window.location.href = `/login?redirect=${encodeURIComponent(window.location.pathname)}`;
          throw new Error("Unauthorized");
        }
        return r.json();
      })
      .then((data) => setProjects(data as Project[]))
      .catch(() => null)
      .finally(() => setLoading(false));
  }, [open]);

  async function addToProject(projectId: string) {
    const res = await fetch(`/api/projects/${projectId}/items`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ designId, estimateId }),
    });
    if (res.ok) {
      setAddedIds((prev) => new Set([...prev, projectId]));
    }
  }

  async function createAndAdd() {
    if (!newName.trim()) return;
    setCreating(true);
    try {
      const res = await fetch("/api/projects", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: newName.trim() }),
      });
      if (res.ok) {
        const project = (await res.json()) as Project;
        // Re-fetch project list
        const listRes = await fetch("/api/projects");
        const list = (await listRes.json()) as Project[];
        setProjects(list);
        await addToProject(project.id);
        setNewName("");
      }
    } finally {
      setCreating(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm" variant="outline" className={className}>
          <FolderPlus className="mr-2 h-4 w-4" />
          {label}
        </Button>
      </DialogTrigger>

      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle>Add to Project</DialogTitle>
        </DialogHeader>

        <div className="space-y-3">
          {/* Existing projects */}
          {loading ? (
            <div className="space-y-2">
              {[1, 2].map((i) => (
                <div key={i} className="h-12 animate-pulse rounded-lg bg-muted" />
              ))}
            </div>
          ) : projects.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              No projects yet — create one below.
            </p>
          ) : (
            <ul className="space-y-2">
              {projects.map((p) => (
                <li key={p.id}>
                  <button
                    onClick={() => addToProject(p.id)}
                    disabled={addedIds.has(p.id)}
                    className={cn(
                      "flex w-full items-center justify-between rounded-lg border px-3 py-2 text-sm transition-colors",
                      addedIds.has(p.id)
                        ? "border-green-200 bg-green-50"
                        : "hover:bg-muted",
                    )}
                  >
                    <span className="flex items-center gap-2">
                      <FolderOpen className="h-4 w-4 shrink-0 text-muted-foreground" />
                      <span className="font-medium">{p.name}</span>
                      <span
                        className={cn(
                          "rounded px-1.5 py-0.5 text-xs font-medium capitalize",
                          STATUS_BADGES[p.status] ?? STATUS_BADGES.planning,
                        )}
                      >
                        {p.status}
                      </span>
                    </span>
                    <span className="flex items-center gap-2 text-muted-foreground">
                      {addedIds.has(p.id) ? (
                        <Check className="h-4 w-4 text-green-600" />
                      ) : (
                        <Badge variant="outline">{p._count.items}</Badge>
                      )}
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          )}

          {/* Create new project */}
          <div className="border-t pt-3">
            <Label className="mb-1 text-xs text-muted-foreground">New project</Label>
            <div className="flex gap-2">
              <Input
                placeholder="Project name"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && createAndAdd()}
              />
              <Button
                size="icon"
                onClick={createAndAdd}
                disabled={!newName.trim() || creating}
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

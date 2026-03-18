import { redirect } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { Heart, FolderOpen, Plus, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { getSession } from "@/lib/auth";
import { prisma } from "@repo/database";
import type { Metadata } from "next";
import { NewProjectForm } from "./new-project-form";

export const metadata: Metadata = {
  title: "My Dashboard | Goel Traders Design Studio",
  description: "View your saved designs and interior projects.",
};

const STATUS_STYLES: Record<string, string> = {
  planning: "bg-blue-100 text-blue-700",
  quoted: "bg-amber-100 text-amber-700",
  in_progress: "bg-green-100 text-green-700",
  completed: "bg-gray-100 text-gray-600",
};

export default async function DashboardPage() {
  const session = await getSession();
  if (!session) redirect("/login?redirect=/dashboard");

  // Fetch saved designs and projects in parallel
  const [savedDesigns, projects] = await Promise.all([
    prisma.savedDesign.findMany({
      where: { userId: session.userId },
      include: {
        design: {
          select: {
            id: true,
            slug: true,
            title: true,
            images: true,
            estimatedCost: true,
            style: true,
            category: { select: { label: true } },
          },
        },
      },
      orderBy: { createdAt: "desc" },
    }),
    prisma.project.findMany({
      where: { userId: session.userId },
      include: { _count: { select: { items: true } } },
      orderBy: { updatedAt: "desc" },
    }),
  ]);

  return (
    <div className="container mx-auto px-4 py-10">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">My Dashboard</h1>
        <p className="mt-1 text-muted-foreground">
          Your saved designs and interior projects
        </p>
      </div>

      <Tabs defaultValue="saved">
        <TabsList className="mb-6">
          <TabsTrigger value="saved" className="gap-2">
            <Heart className="h-4 w-4" />
            Saved Designs
            {savedDesigns.length > 0 && (
              <Badge variant="secondary" className="ml-1">{savedDesigns.length}</Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="projects" className="gap-2">
            <FolderOpen className="h-4 w-4" />
            My Projects
            {projects.length > 0 && (
              <Badge variant="secondary" className="ml-1">{projects.length}</Badge>
            )}
          </TabsTrigger>
        </TabsList>

        {/* ── Saved Designs Tab ── */}
        <TabsContent value="saved">
          {savedDesigns.length === 0 ? (
            <div className="rounded-2xl border bg-muted/20 py-20 text-center">
              <Heart className="mx-auto mb-4 h-10 w-10 text-muted-foreground/40" />
              <h2 className="mb-2 text-lg font-semibold">No saved designs yet</h2>
              <p className="mb-6 text-sm text-muted-foreground">
                Browse designs and click the ♥ icon to save them here.
              </p>
              <Button asChild>
                <Link href="/designs">Browse Designs</Link>
              </Button>
            </div>
          ) : (
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {savedDesigns.map(({ design }) => (
                <Link
                  key={design.slug}
                  href={`/designs/${design.slug}`}
                  className="group overflow-hidden rounded-2xl border bg-background transition-all hover:-translate-y-1 hover:shadow-md"
                >
                  <div className="relative aspect-video overflow-hidden bg-muted">
                    {design.images[0] ? (
                      <Image
                        alt={design.title}
                        src={design.images[0]}
                        fill
                        className="object-cover transition-transform group-hover:scale-105"
                        sizes="(max-width: 1280px) 50vw, 25vw"
                      />
                    ) : (
                      <div className="flex h-full items-center justify-center text-muted-foreground">
                        No image
                      </div>
                    )}
                  </div>
                  <div className="p-4">
                    <Badge variant="outline" className="mb-2 text-xs">
                      {design.category.label}
                    </Badge>
                    <h3 className="font-semibold leading-tight">{design.title}</h3>
                    <p className="mt-1 text-sm text-muted-foreground">{design.estimatedCost}</p>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </TabsContent>

        {/* ── Projects Tab ── */}
        <TabsContent value="projects">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-lg font-semibold">
              {projects.length === 0 ? "Create your first project" : `${projects.length} project${projects.length !== 1 ? "s" : ""}`}
            </h2>
            <NewProjectForm />
          </div>

          {projects.length === 0 ? (
            <div className="rounded-2xl border bg-muted/20 py-20 text-center">
              <FolderOpen className="mx-auto mb-4 h-10 w-10 text-muted-foreground/40" />
              <h2 className="mb-2 text-lg font-semibold">No projects yet</h2>
              <p className="mb-6 text-sm text-muted-foreground">
                Group your designs and estimates into a project, then request a single quote.
              </p>
            </div>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {projects.map((p) => (
                <Card key={p.id} className="transition-all hover:-translate-y-0.5 hover:shadow-md">
                  <CardContent className="p-5">
                    <div className="mb-3 flex items-start justify-between gap-2">
                      <div>
                        <h3 className="font-semibold">{p.name}</h3>
                        <p className="mt-0.5 text-sm text-muted-foreground">
                          {p._count.items} item{p._count.items !== 1 ? "s" : ""}
                        </p>
                      </div>
                      <span
                        className={`rounded px-2 py-0.5 text-xs font-medium capitalize ${STATUS_STYLES[p.status] ?? STATUS_STYLES.planning}`}
                      >
                        {p.status.replace("_", " ")}
                      </span>
                    </div>
                    <Button size="sm" variant="outline" className="w-full" asChild>
                      <Link href={`/dashboard/projects/${p.id}`}>
                        Open Project <ArrowRight className="ml-2 h-3 w-3" />
                      </Link>
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}

import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { ArrowLeft, FolderOpen, Tag } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { getSession } from "@/lib/auth";
import { prisma } from "@repo/database";
import type { Metadata } from "next";
import { ProjectQuoteForm } from "./project-quote-form";
import { ProjectStatusSelect } from "./project-status-select";

interface PageParams {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: PageParams): Promise<Metadata> {
  const { id } = await params;
  const project = await prisma.project.findUnique({ where: { id }, select: { name: true } });
  return { title: project ? `${project.name} | My Projects` : "Project" };
}

const STATUS_STYLES: Record<string, string> = {
  planning: "bg-blue-100 text-blue-700",
  quoted: "bg-amber-100 text-amber-700",
  in_progress: "bg-green-100 text-green-700",
  completed: "bg-gray-100 text-gray-600",
};

export default async function ProjectDetailPage({ params }: PageParams) {
  const session = await getSession();
  if (!session) redirect("/login?redirect=/dashboard");

  const { id } = await params;

  const project = await prisma.project.findFirst({
    where: { id, userId: session.userId },
    include: {
      items: {
        orderBy: { sortOrder: "asc" },
        include: {
          design: {
            select: {
              id: true,
              slug: true,
              title: true,
              images: true,
              estimatedCost: true,
              category: { select: { label: true } },
            },
          },
          estimate: {
            select: {
              id: true,
              grade: true,
              costMin: true,
              costMax: true,
              layout: true,
            },
          },
        },
      },
    },
  });

  if (!project) notFound();

  const totalCostMin = project.items.reduce((sum, i) => sum + (i.estimate?.costMin ?? 0), 0);
  const totalCostMax = project.items.reduce((sum, i) => sum + (i.estimate?.costMax ?? 0), 0);

  function formatCost(v: number) {
    return v >= 100000
      ? `₹${(v / 100000).toFixed(1)}L`
      : `₹${(v / 1000).toFixed(0)}K`;
  }

  return (
    <div className="container mx-auto max-w-4xl px-4 py-10">
      {/* ── Header ── */}
      <div className="mb-6">
        <Button variant="ghost" size="sm" className="mb-4 -ml-2" asChild>
          <Link href="/dashboard">
            <ArrowLeft className="mr-2 h-4 w-4" /> Back to Dashboard
          </Link>
        </Button>

        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <div className="flex items-center gap-3">
              <FolderOpen className="h-6 w-6 text-muted-foreground" />
              <h1 className="text-2xl font-bold">{project.name}</h1>
            </div>
            {project.description && (
              <p className="mt-1 pl-9 text-sm text-muted-foreground">{project.description}</p>
            )}
          </div>
          <ProjectStatusSelect projectId={id} currentStatus={project.status} />
        </div>
      </div>

      {/* ── Cost summary ── */}
      {totalCostMin > 0 && (
        <div className="mb-6 flex items-center gap-4 rounded-xl border bg-muted/30 px-5 py-4">
          <Tag className="h-5 w-5 shrink-0 text-primary" />
          <div>
            <p className="text-sm text-muted-foreground">Estimated total range</p>
            <p className="text-xl font-semibold">
              {formatCost(totalCostMin)} – {formatCost(totalCostMax)}
            </p>
          </div>
        </div>
      )}

      {/* ── Items list ── */}
      <div className="mb-8 space-y-4">
        <h2 className="text-lg font-semibold">{project.items.length} Item{project.items.length !== 1 ? "s" : ""}</h2>

        {project.items.length === 0 ? (
          <div className="rounded-2xl border bg-muted/20 py-12 text-center">
            <p className="text-muted-foreground">No items yet.</p>
            <p className="mt-1 text-sm text-muted-foreground">
              Browse designs and click &ldquo;Add to project&rdquo; to add items here.
            </p>
            <Button size="sm" variant="outline" className="mt-4" asChild>
              <Link href="/designs">Browse Designs</Link>
            </Button>
          </div>
        ) : (
          project.items.map((item) => (
            <Card key={item.id}>
              <CardContent className="flex gap-4 p-4">
                {item.design?.images[0] && (
                  <div className="relative h-20 w-28 shrink-0 overflow-hidden rounded-lg bg-muted">
                    <Image
                      alt={item.design.title}
                      src={item.design.images[0]}
                      fill
                      className="object-cover"
                      sizes="112px"
                    />
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  {item.design && (
                    <>
                      <Badge variant="outline" className="mb-1 text-xs">
                        {item.design.category.label}
                      </Badge>
                      <h3 className="font-semibold leading-tight">
                        <Link href={`/designs/${item.design.slug}`} className="hover:underline">
                          {item.design.title}
                        </Link>
                      </h3>
                      <p className="text-sm text-muted-foreground">{item.design.estimatedCost}</p>
                    </>
                  )}
                  {item.estimate && (
                    <div className="mt-1 flex flex-wrap gap-2">
                      <Badge variant="secondary" className="text-xs">{item.estimate.grade}</Badge>
                      <Badge variant="secondary" className="text-xs">{item.estimate.layout.replace(/_/g, " ")}</Badge>
                      <span className="text-sm font-medium text-primary">
                        {formatCost(item.estimate.costMin)} – {formatCost(item.estimate.costMax)}
                      </span>
                    </div>
                  )}
                  {item.notes && (
                    <p className="mt-1 text-sm text-muted-foreground italic">{item.notes}</p>
                  )}
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* ── Request project quote ── */}
      {project.items.length > 0 && (
        <>
          <Separator className="mb-8" />
          <div className="rounded-2xl border bg-primary/5 p-6">
            <h2 className="mb-1 text-xl font-bold">Request Project Quote</h2>
            <p className="mb-5 text-sm text-muted-foreground">
              Get a single comprehensive quote covering all {project.items.length} items in this project.
            </p>
            <ProjectQuoteForm projectId={id} />
          </div>
        </>
      )}
    </div>
  );
}

import { NextResponse } from "next/server";
import { prisma } from "@repo/database";
import { rateLimit } from "@/lib/rate-limit";
import { getSessionUser } from "@/lib/auth";
import { projectSchema } from "@/lib/validations";

interface RouteContext {
  params: Promise<{ id: string }>;
}

/** GET /api/projects/[id] — project detail with all items */
export async function GET(req: Request, { params }: RouteContext) {
  const user = await getSessionUser(req);
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;

  const project = await prisma.project.findFirst({
    where: { id, userId: user.userId },
    include: {
      items: {
        orderBy: { sortOrder: "asc" },
        include: {
          design: {
            select: { id: true, slug: true, title: true, images: true, estimatedCost: true, category: { select: { label: true } } },
          },
          estimate: {
            select: { id: true, grade: true, costMin: true, costMax: true, layout: true },
          },
        },
      },
    },
  });

  if (!project) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(project);
}

/** PATCH /api/projects/[id] — update name, description, or status */
export async function PATCH(req: Request, { params }: RouteContext) {
  const user = await getSessionUser(req);
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const body = await req.json();
  const result = projectSchema.partial().safeParse(body);
  if (!result.success) {
    return NextResponse.json({ error: "Invalid input" }, { status: 422 });
  }

  const project = await prisma.project.findFirst({ where: { id, userId: user.userId } });
  if (!project) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const updated = await prisma.project.update({
    where: { id },
    data: {
      ...(result.data.name && { name: result.data.name }),
      ...(result.data.description !== undefined && { description: result.data.description }),
      // status can be passed outside schema — allow it directly
      ...(body.status && { status: body.status }),
    },
  });
  return NextResponse.json(updated);
}

/** DELETE /api/projects/[id] — delete project + cascade items */
export async function DELETE(req: Request, { params }: RouteContext) {
  const user = await getSessionUser(req);
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const project = await prisma.project.findFirst({ where: { id, userId: user.userId } });
  if (!project) return NextResponse.json({ error: "Not found" }, { status: 404 });

  await prisma.project.delete({ where: { id } });
  return NextResponse.json({ deleted: true });
}

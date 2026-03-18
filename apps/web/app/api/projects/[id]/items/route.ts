import { NextResponse } from "next/server";
import { prisma } from "@repo/database";
import { rateLimit } from "@/lib/rate-limit";
import { getSessionUser } from "@/lib/auth";
import { projectItemSchema } from "@/lib/validations";

interface RouteContext {
  params: Promise<{ id: string }>;
}

/** POST /api/projects/[id]/items — add design or estimate to project */
export async function POST(req: Request, { params }: RouteContext) {
  const limit = rateLimit(req, { limit: 30, windowMs: 60_000 });
  if (!limit.success) return NextResponse.json({ error: "Too many requests" }, { status: 429 });

  const user = await getSessionUser(req);
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const project = await prisma.project.findFirst({ where: { id, userId: user.userId } });
  if (!project) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const body = await req.json();
  const result = projectItemSchema.safeParse(body);
  if (!result.success) {
    return NextResponse.json({ error: "Invalid input", issues: result.error.flatten().fieldErrors }, { status: 422 });
  }

  // Find current highest sortOrder so new item appears at end
  const lastItem = await prisma.projectItem.findFirst({
    where: { projectId: id },
    orderBy: { sortOrder: "desc" },
    select: { sortOrder: true },
  });

  const item = await prisma.projectItem.create({
    data: {
      projectId: id,
      designId: result.data.designId,
      estimateId: result.data.estimateId,
      notes: result.data.notes,
      sortOrder: (lastItem?.sortOrder ?? 0) + 1,
    },
  });

  // Touch project updatedAt
  await prisma.project.update({ where: { id }, data: { updatedAt: new Date() } });

  return NextResponse.json(item, { status: 201 });
}

/** DELETE /api/projects/[id]/items?itemId=xxx — remove an item from the project */
export async function DELETE(req: Request, { params }: RouteContext) {
  const user = await getSessionUser(req);
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const { searchParams } = new URL(req.url);
  const itemId = searchParams.get("itemId");
  if (!itemId) return NextResponse.json({ error: "itemId is required" }, { status: 400 });

  // Verify ownership via the project
  const item = await prisma.projectItem.findFirst({
    where: { id: itemId, project: { id, userId: user.userId } },
  });
  if (!item) return NextResponse.json({ error: "Not found" }, { status: 404 });

  await prisma.projectItem.delete({ where: { id: itemId } });
  return NextResponse.json({ deleted: true });
}

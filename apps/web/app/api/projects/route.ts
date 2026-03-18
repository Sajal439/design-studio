import { NextResponse } from "next/server";
import { prisma } from "@repo/database";
import { rateLimit } from "@/lib/rate-limit";
import { getSessionUser } from "@/lib/auth";
import { projectSchema } from "@/lib/validations";

/**
 * GET /api/projects
 * Returns all projects for the authenticated user.
 */
export async function GET(req: Request) {
  const user = await getSessionUser(req);
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const projects = await prisma.project.findMany({
    where: { userId: user.userId },
    include: {
      _count: { select: { items: true } },
    },
    orderBy: { updatedAt: "desc" },
  });

  return NextResponse.json(projects);
}

/**
 * POST /api/projects
 * Body: { name: string, description?: string }
 * Creates a new project for the user.
 */
export async function POST(req: Request) {
  const limit = rateLimit(req, { limit: 20, windowMs: 60_000 });
  if (!limit.success) {
    return NextResponse.json({ error: "Too many requests" }, { status: 429 });
  }

  const user = await getSessionUser(req);
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const result = projectSchema.safeParse(body);
  if (!result.success) {
    return NextResponse.json(
      { error: "Invalid input", issues: result.error.flatten().fieldErrors },
      { status: 422 },
    );
  }

  const project = await prisma.project.create({
    data: {
      userId: user.userId,
      name: result.data.name,
      description: result.data.description,
    },
  });

  return NextResponse.json(project, { status: 201 });
}

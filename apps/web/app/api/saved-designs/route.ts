import { NextResponse } from "next/server";
import { prisma } from "@repo/database";
import { rateLimit } from "@/lib/rate-limit";
import { getSessionUser } from "@/lib/auth";

/**
 * GET /api/saved-designs
 * Returns all saved designs for the authenticated user.
 */
export async function GET(req: Request) {
  const user = await getSessionUser(req);
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const saved = await prisma.savedDesign.findMany({
    where: { userId: user.userId },
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
  });

  return NextResponse.json(saved);
}

/**
 * POST /api/saved-designs
 * Body: { designId: string }
 * Toggles the bookmark — creates if not exists, deletes if already saved.
 * Returns { saved: boolean }
 */
export async function POST(req: Request) {
  const limit = rateLimit(req, { limit: 30, windowMs: 60_000 });
  if (!limit.success) {
    return NextResponse.json({ error: "Too many requests" }, { status: 429 });
  }

  const user = await getSessionUser(req);
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { designId } = (await req.json()) as { designId?: string };
  if (!designId) {
    return NextResponse.json({ error: "designId is required" }, { status: 400 });
  }

  // Toggle: try to delete first; if nothing deleted, create.
  const existing = await prisma.savedDesign.findUnique({
    where: { userId_designId: { userId: user.userId, designId } },
  });

  if (existing) {
    await prisma.savedDesign.delete({
      where: { id: existing.id },
    });
    return NextResponse.json({ saved: false });
  }

  await prisma.savedDesign.create({
    data: { userId: user.userId, designId },
  });
  return NextResponse.json({ saved: true }, { status: 201 });
}

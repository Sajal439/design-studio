import { NextResponse } from "next/server";
import { prisma } from "@repo/database";
import { getSessionUser } from "@/lib/auth";

interface RouteContext {
  params: Promise<{ id: string }>;
}

/**
 * POST /api/projects/[id]/quote
 * Aggregates all design items in a project into a single QuoteRequest.
 * Body: { name: string; phone: string; location: string }
 */
export async function POST(req: Request, { params }: RouteContext) {
  const user = await getSessionUser(req);
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;

  const project = await prisma.project.findFirst({
    where: { id, userId: user.userId },
    include: {
      items: {
        include: {
          design: { select: { title: true, slug: true, category: { select: { label: true } } } },
          estimate: { select: { grade: true, costMin: true, costMax: true, layout: true } },
        },
      },
    },
  });

  if (!project) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const body = (await req.json()) as { name?: string; phone?: string; location?: string };
  if (!body.name || !body.phone || !body.location) {
    return NextResponse.json({ error: "name, phone, location are required" }, { status: 400 });
  }

  // Build a descriptive message aggregating all items
  const itemLines = project.items.map((item, i) => {
    const parts: string[] = [`${i + 1}.`];
    if (item.design) parts.push(`${item.design.category?.label ?? "Design"}: ${item.design.title}`);
    if (item.estimate) {
      const range = `₹${(item.estimate.costMin / 100000).toFixed(1)}L – ₹${(item.estimate.costMax / 100000).toFixed(1)}L`;
      parts.push(`(${item.estimate.grade} grade, ${range})`);
    }
    if (item.notes) parts.push(`— ${item.notes}`);
    return parts.join(" ");
  });

  const message =
    `Project: ${project.name}\n\n` +
    (project.description ? `${project.description}\n\n` : "") +
    `Items:\n${itemLines.join("\n")}`;

  const quote = await prisma.quoteRequest.create({
    data: {
      name: body.name,
      phone: body.phone,
      projectType: "Full Project",
      location: body.location,
      message,
      source: `project:${id}`,
      userId: user.userId,
      status: "new",
    },
  });

  // Mark project as quoted
  await prisma.project.update({ where: { id }, data: { status: "quoted" } });

  return NextResponse.json({ quoteId: quote.id }, { status: 201 });
}

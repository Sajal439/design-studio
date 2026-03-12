import { NextResponse } from "next/server";
import { prisma } from "@repo/database";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;

  const design = await prisma.design.findUnique({
    where: { slug },
    include: {
      category: true,
      materials: true,
    },
  });

  if (!design) {
    return NextResponse.json({ error: "Design not found" }, { status: 404 });
  }

  return NextResponse.json(design);
}

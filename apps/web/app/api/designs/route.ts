import { NextResponse } from "next/server";
import { prisma } from "@repo/database";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const category = searchParams.get("category");

  const where = category && category !== "all"
    ? { category: { slug: category } }
    : {};

  const designs = await prisma.design.findMany({
    where,
    include: {
      category: true,
      materials: true,
    },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(designs);
}

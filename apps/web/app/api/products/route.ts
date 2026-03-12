import { NextResponse } from "next/server";
import { prisma } from "@repo/database";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const category = searchParams.get("category");

  const where = category && category !== "all"
    ? { category: { slug: category } }
    : {};

  const products = await prisma.product.findMany({
    where,
    include: {
      category: true,
      specifications: true,
    },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(products);
}

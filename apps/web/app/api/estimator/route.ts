export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import { prisma } from "@repo/database";

export async function GET() {
  try {
    const designs = await prisma.design.findMany({
      include: {
        category: true,
        materials: true,
      },
      orderBy: { title: "asc" },
    });

    // Group designs by category
    const categories = await prisma.category.findMany({
      where: { type: "design" },
      orderBy: { label: "asc" },
    });

    const grouped = categories.map((cat) => ({
      slug: cat.slug,
      label: cat.label,
      designs: designs
        .filter((d) => d.categoryId === cat.id)
        .map((d) => ({
          title: d.title,
          slug: d.slug,
          roomSize: d.roomSize,
          style: d.style,
          estimatedCost: d.estimatedCost,
          materials: d.materials.map((m) => ({
            name: m.name,
            quantity: m.quantity,
            unit: m.unit,
          })),
        })),
    }));

    return NextResponse.json(grouped);
  } catch (error) {
    console.error("Estimator API error:", error);
    return NextResponse.json(
      { error: "Failed to load design data" },
      { status: 500 }
    );
  }
}

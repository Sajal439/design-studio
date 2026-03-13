import { revalidatePath } from "next/cache";
import { NextResponse } from "next/server";
import { prisma } from "@repo/database";
import { z } from "zod";

const materialSchema = z.object({ name: z.string().min(1), quantity: z.number().positive(), unit: z.string().min(1) });
const designSchema = z.object({
  title: z.string().min(1),
  slug: z.string().min(1),
  categorySlug: z.string().min(1),
  description: z.string().min(1),
  estimatedCost: z.string().min(1),
  roomSize: z.string().min(1),
  style: z.string().min(1),
  images: z.array(z.string().min(1)).min(1),
  materials: z.array(materialSchema).min(1),
});

function revalidateDesignPaths() {
  revalidatePath("/admin/designs");
  revalidatePath("/designs");
  revalidatePath("/admin");
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const result = designSchema.safeParse(body);
    if (!result.success) {
      return NextResponse.json({ error: "Invalid design payload", details: result.error.flatten() }, { status: 400 });
    }

    const category = await prisma.category.findFirst({ where: { slug: result.data.categorySlug, type: "design" } });
    if (!category) {
      return NextResponse.json({ error: "Design category not found" }, { status: 400 });
    }

    const created = await prisma.design.create({
      data: {
        title: result.data.title,
        slug: result.data.slug,
        description: result.data.description,
        estimatedCost: result.data.estimatedCost,
        roomSize: result.data.roomSize,
        style: result.data.style,
        images: result.data.images,
        categoryId: category.id,
        materials: { create: result.data.materials },
      },
    });

    revalidateDesignPaths();
    return NextResponse.json(created, { status: 201 });
  } catch (error) {
    console.error("Create design error:", error);
    return NextResponse.json({ error: "Unable to create design" }, { status: 500 });
  }
}

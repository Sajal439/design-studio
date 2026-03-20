import { revalidatePath, revalidateTag } from "next/cache";
import { NextResponse } from "next/server";
import { prisma } from "@repo/database";
import { designSchema } from "@/lib/admin-validations";

function revalidateDesignPaths() {
  revalidatePath("/admin/designs");
  revalidatePath("/designs");
  revalidatePath("/admin");
  revalidateTag("designs", "max");
  revalidateTag("categories", "max");
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const result = designSchema.safeParse(body);
    if (!result.success) {
      return NextResponse.json(
        { error: "Invalid design payload", details: result.error.flatten() },
        { status: 400 },
      );
    }
    const category = await prisma.category.findFirst({
      where: { slug: result.data.categorySlug, type: "design" },
    });
    if (!category) {
      return NextResponse.json(
        { error: "Design category not found" },
        { status: 400 },
      );
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
      },
    });
    revalidateDesignPaths();
    return NextResponse.json(created, { status: 201 });
  } catch (error) {
    console.error("Create design error:", error);
    return NextResponse.json(
      { error: "Unable to create design" },
      { status: 500 },
    );
  }
}

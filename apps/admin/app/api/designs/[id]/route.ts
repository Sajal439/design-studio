import { revalidatePath, revalidateTag } from "next/cache";
import { NextResponse } from "next/server";
import { prisma } from "@repo/database";
import { designSchema } from "@/lib/admin-validations";

function revalidateDesignPaths() {
  revalidatePath("/designs");
  revalidatePath("/designs");
  revalidatePath("/");
  revalidateTag("designs", "max");
  revalidateTag("categories", "max");
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const body = await request.json();
    const result = designSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        { error: "Invalid design payload", details: result.error.flatten() },
        { status: 400 },
      );
    }

    const { id } = await params;

    const category = await prisma.category.findFirst({
      where: { slug: result.data.categorySlug, type: "design" },
    });

    if (!category) {
      return NextResponse.json(
        { error: "Design category not found" },
        { status: 400 },
      );
    }

    const updated = await prisma.design.update({
      where: { id },
      data: {
        title: result.data.title,
        slug: result.data.slug,
        description: result.data.description || null,
        estimatedCost: result.data.estimatedCost || null,
        roomSize: result.data.roomSize || null,
        style: result.data.style || null,
        images: result.data.images || [],
        tags: result.data.tags || [],
        isRealWork: result.data.isRealWork ?? false,
        location: result.data.location || null,
        priceRange: result.data.priceRange || null,
        badge: result.data.badge || null,
        waText: result.data.waText || null,
        categoryId: category.id,
        isPublished: result.data.isPublished ?? true,
      } as any,
    });

    revalidateDesignPaths();
    revalidatePath(`/designs/${updated.slug}`);
    return NextResponse.json(updated);
  } catch (error) {
    console.error("Update design error:", error);
    return NextResponse.json(
      { error: "Unable to update design" },
      { status: 500 },
    );
  }
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    await prisma.design.delete({ where: { id } });
    revalidateDesignPaths();
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Delete design error:", error);
    return NextResponse.json(
      { error: "Unable to delete design" },
      { status: 500 },
    );
  }
}

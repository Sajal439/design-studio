import { revalidatePath, revalidateTag } from "next/cache";
import { NextResponse } from "next/server";
import { prisma } from "@repo/database";
import { productSchema } from "@/lib/admin-validations";

function revalidateProductPaths() {
  revalidatePath("/admin/products");
  revalidatePath("/products");
  revalidatePath("/admin");
  revalidateTag("products", "max");
  revalidateTag("categories", "max");
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const body = await request.json();
    const result = productSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        { error: "Invalid product payload", details: result.error.flatten() },
        { status: 400 },
      );
    }

    const { id } = await params;

    const category = await prisma.category.findFirst({
      where: { slug: result.data.categorySlug, type: "product" },
    });

    if (!category) {
      return NextResponse.json(
        { error: "Product category not found" },
        { status: 400 },
      );
    }

    const [, updated] = await prisma.$transaction([
      prisma.productSpec.deleteMany({ where: { productId: id } }),
      prisma.product.update({
        where: { id },
        data: {
          name: result.data.name,
          slug: result.data.slug,
          brand: result.data.brand,
          description: result.data.description,
          priceRange: result.data.priceRange,
          unit: result.data.unit,
          inStock: result.data.inStock,
          images: result.data.images,
          categoryId: category.id,
          specifications: { create: result.data.specifications },
        },
      }),
    ]);

    revalidateProductPaths();
    revalidatePath(`/products/${updated.slug}`);
    return NextResponse.json(updated);
  } catch (error) {
    console.error("Update product error:", error);
    return NextResponse.json(
      { error: "Unable to update product" },
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
    await prisma.product.delete({ where: { id } });
    revalidateProductPaths();
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Delete product error:", error);
    return NextResponse.json(
      { error: "Unable to delete product" },
      { status: 500 },
    );
  }
}

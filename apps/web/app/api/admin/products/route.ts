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

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const result = productSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        { error: "Invalid product payload", details: result.error.flatten() },
        { status: 400 },
      );
    }

    const category = await prisma.category.findFirst({
      where: { slug: result.data.categorySlug, type: "product" },
    });

    if (!category) {
      return NextResponse.json(
        { error: "Product category not found" },
        { status: 400 },
      );
    }

    const created = await prisma.product.create({
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
    });

    revalidateProductPaths();
    return NextResponse.json(created, { status: 201 });
  } catch (error) {
    console.error("Create product error:", error);
    return NextResponse.json(
      { error: "Unable to create product" },
      { status: 500 },
    );
  }
}

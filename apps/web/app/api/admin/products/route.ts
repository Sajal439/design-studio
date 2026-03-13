import { revalidatePath } from "next/cache";
import { NextResponse } from "next/server";
import { prisma } from "@repo/database";
import { z } from "zod";

const specificationSchema = z.object({ label: z.string().min(1), value: z.string().min(1) });
const productSchema = z.object({
  name: z.string().min(1),
  slug: z.string().min(1),
  categorySlug: z.string().min(1),
  brand: z.string().min(1),
  description: z.string().min(1),
  priceRange: z.string().min(1),
  unit: z.string().min(1),
  inStock: z.boolean(),
  images: z.array(z.string().min(1)).min(1),
  specifications: z.array(specificationSchema).min(1),
});

function revalidateProductPaths() {
  revalidatePath("/admin/products");
  revalidatePath("/products");
  revalidatePath("/admin");
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const result = productSchema.safeParse(body);
    if (!result.success) {
      return NextResponse.json({ error: "Invalid product payload", details: result.error.flatten() }, { status: 400 });
    }

    const category = await prisma.category.findFirst({ where: { slug: result.data.categorySlug, type: "product" } });
    if (!category) {
      return NextResponse.json({ error: "Product category not found" }, { status: 400 });
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
    return NextResponse.json({ error: "Unable to create product" }, { status: 500 });
  }
}

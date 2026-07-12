import { NextResponse } from "next/server";
import { prisma } from "@repo/database";
import { z } from "zod";
import { revalidatePath } from "next/cache";

const createSchema = z.object({
  name: z.string().min(1, "Name is required"),
  brand: z.string().optional(),
  description: z.string().optional(),
  category: z.string().min(1, "Category is required"),
  tier: z.enum(["BUDGET", "STANDARD", "PREMIUM"]),
  price: z.number().positive("Price must be positive"),
  isDefault: z.boolean().default(false),
});

export async function POST(req: Request) {
  const body = await req.json();
  const result = createSchema.safeParse(body);

  if (!result.success) {
    return NextResponse.json(
      { error: result.error.flatten().fieldErrors },
      { status: 400 },
    );
  }

  const { isDefault, category, tier, ...rest } = result.data;

  // If this will be the default, clear existing defaults for this category+tier
  if (isDefault) {
    await prisma.product.updateMany({
      where: { category, tier, isDefault: true },
      data: { isDefault: false },
    });
  }

  const product = await prisma.product.create({
    data: { ...rest, category, tier, isDefault },
  });

  revalidatePath("/products");
  return NextResponse.json(product, { status: 201 });
}

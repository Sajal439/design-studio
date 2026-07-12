import { NextResponse } from "next/server";
import { prisma } from "@repo/database";
import { z } from "zod";
import { revalidatePath } from "next/cache";

const patchSchema = z.object({
  name: z.string().min(1).optional(),
  brand: z.string().nullable().optional(),
  description: z.string().nullable().optional(),
  price: z.number().positive().optional(),
  isDefault: z.boolean().optional(),
  active: z.boolean().optional(),
});

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const body = await req.json();
  const result = patchSchema.safeParse(body);

  if (!result.success) {
    return NextResponse.json(
      { error: result.error.flatten().fieldErrors },
      { status: 400 },
    );
  }

  // If setting as default, clear existing defaults for the same category+tier first
  if (result.data.isDefault === true) {
    const existing = await prisma.product.findUnique({ where: { id } });
    if (existing) {
      await prisma.product.updateMany({
        where: { category: existing.category, tier: existing.tier, isDefault: true, id: { not: id } },
        data: { isDefault: false },
      });
    }
  }

  const updated = await prisma.product.update({
    where: { id },
    data: result.data,
  });

  revalidatePath("/products");
  return NextResponse.json(updated);
}

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;

  // Soft delete — keeps the row for audit trail
  const updated = await prisma.product.update({
    where: { id },
    data: { active: false, isDefault: false },
  });

  revalidatePath("/products");
  return NextResponse.json(updated);
}

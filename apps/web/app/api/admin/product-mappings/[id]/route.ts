import { revalidatePath } from "next/cache";
import { NextResponse } from "next/server";
import { prisma } from "@repo/database";
import { z } from "zod";

const schema = z.object({
  pattern: z.string().min(1).optional(),
  productSlugs: z.array(z.string().min(1)).min(1).optional(),
  reason: z.string().min(1).optional(),
  priority: z.number().int().min(0).optional(),
  active: z.boolean().optional(),
});

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const body = await req.json();
  const result = schema.safeParse(body);
  if (!result.success) {
    return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
  }
  const updated = await prisma.productMapping.update({
    where: { id },
    data: result.data,
  });
  revalidatePath("/estimator");
  revalidatePath("/admin/product-mappings");
  return NextResponse.json(updated);
}

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  await prisma.productMapping.delete({ where: { id } });
  revalidatePath("/estimator");
  revalidatePath("/admin/product-mappings");
  return NextResponse.json({ success: true });
}

import { revalidatePath } from "next/cache";
import { NextResponse } from "next/server";
import { prisma } from "@repo/database";
import { z } from "zod";

const schema = z.object({
  pattern: z.string().min(1),
  productSlugs: z.array(z.string().min(1)).min(1),
  reason: z.string().min(1),
  priority: z.number().int().min(0),
  active: z.boolean(),
});

export async function POST(req: Request) {
  const body = await req.json();
  const result = schema.safeParse(body);
  if (!result.success) {
    return NextResponse.json(
      { error: "Invalid payload", details: result.error.flatten() },
      { status: 400 },
    );
  }
  const created = await prisma.productMapping.create({ data: result.data });
  revalidatePath("/estimator");
  revalidatePath("/admin/product-mappings");
  return NextResponse.json(created, { status: 201 });
}

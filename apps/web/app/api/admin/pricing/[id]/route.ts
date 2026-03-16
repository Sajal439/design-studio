import { revalidatePath } from "next/cache";
import { NextResponse } from "next/server";
import { prisma } from "@repo/database";
import { z } from "zod";

const schema = z.object({
  value: z.number().nonnegative(),
});

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const body = await req.json();
  const result = schema.safeParse(body);

  if (!result.success) {
    return NextResponse.json(
      { error: "Value must be a non-negative number" },
      { status: 400 },
    );
  }

  const updated = await prisma.priceBookEntry.update({
    where: { id },
    data: { value: result.data.value },
  });

  // Bust the estimator page cache — next visitor gets fresh prices
  revalidatePath("/estimator");
  revalidatePath("/admin/pricing");

  return NextResponse.json(updated);
}

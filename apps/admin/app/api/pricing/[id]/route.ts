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

  // Refresh the admin pricing page so the editor sees the new value.
  // Note: the public estimator page (apps/web) uses force-dynamic and
  // always reads fresh from the DB — no cross-app revalidation needed.
  revalidatePath("/pricing");

  return NextResponse.json(updated);
}

import { revalidatePath } from "next/cache";
import { NextResponse } from "next/server";
import { prisma } from "@repo/database";
import { z } from "zod";

const schema = z.object({ status: z.enum(["new", "contacted", "quoted", "closed"]) });

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const body = await request.json();
    const result = schema.safeParse(body);
    if (!result.success) return NextResponse.json({ error: "Invalid status" }, { status: 400 });

    const { id } = await params;
    const updated = await prisma.quoteRequest.update({ where: { id }, data: { status: result.data.status } });
    revalidatePath("/admin/quotes");
    revalidatePath("/admin");
    return NextResponse.json(updated);
  } catch (error) {
    console.error("Quote status update error:", error);
    return NextResponse.json({ error: "Unable to update quote status" }, { status: 500 });
  }
}

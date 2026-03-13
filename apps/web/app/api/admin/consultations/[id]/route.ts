import { revalidatePath } from "next/cache";
import { NextResponse } from "next/server";
import { prisma } from "@repo/database";
import { z } from "zod";

const schema = z.object({ status: z.enum(["new", "confirmed", "completed", "cancelled"]) });

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const body = await request.json();
    const result = schema.safeParse(body);
    if (!result.success) return NextResponse.json({ error: "Invalid status" }, { status: 400 });

    const { id } = await params;
    const updated = await prisma.consultation.update({ where: { id }, data: { status: result.data.status } });
    revalidatePath("/admin/consultations");
    revalidatePath("/admin");
    return NextResponse.json(updated);
  } catch (error) {
    console.error("Consultation status update error:", error);
    return NextResponse.json({ error: "Unable to update consultation status" }, { status: 500 });
  }
}

import { NextResponse } from "next/server";
import { prisma } from "@repo/database";
import { z } from "zod";

const updateSchema = z.object({
  status: z.enum(["PENDING", "CONTACTED", "COMPLETED", "CANCELLED"]),
});

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const data = updateSchema.parse(body);

    const updated = await prisma.consultation.update({
      where: { id },
      data: { status: data.status },
    });

    return NextResponse.json({ success: true, consultation: updated });
  } catch (error) {
    console.error("Consultation update error:", error);
    return NextResponse.json(
      { error: "Failed to update consultation" },
      { status: 500 }
    );
  }
}

import { NextResponse } from "next/server";
import { prisma } from "@repo/database";
import { consultationSchema } from "@/lib/validations";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const data = consultationSchema.parse(body);

    await prisma.consultation.create({
      data: {
        name: data.name,
        phone: data.phone,
        type: data.consultationType,
        projectType: data.projectType || null,
        location: data.location || null,
        source: data.source || null,
        status: "PENDING",
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Consultation booking error:", error);
    return NextResponse.json(
      { error: "Failed to book consultation" },
      { status: 500 }
    );
  }
}

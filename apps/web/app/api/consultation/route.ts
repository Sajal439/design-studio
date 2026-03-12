import { NextResponse } from "next/server";
import { prisma } from "@repo/database";
import { consultationSchema } from "@/lib/validations";

export async function POST(request: Request) {
  try {
    const body = await request.json();

    // Validate with Zod
    const result = consultationSchema.safeParse(body);
    if (!result.success) {
      return NextResponse.json(
        { error: "Validation failed", details: result.error.flatten() },
        { status: 400 }
      );
    }

    // Save to database
    const consultation = await prisma.consultation.create({
      data: result.data,
    });

    return NextResponse.json(
      { message: "Consultation booked", id: consultation.id },
      { status: 201 }
    );
  } catch (error) {
    console.error("Consultation API error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

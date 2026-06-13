import { NextResponse } from "next/server";
import { prisma } from "@repo/database";
import { z } from "zod";

const consultationSchema = z.object({
  name: z.string().min(2),
  email: z.string().email().or(z.literal("")),
  phone: z.string().min(10),
  consultationType: z.string(),
  message: z.string().optional(),
});

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const data = consultationSchema.parse(body);

    await prisma.consultation.create({
      data: {
        name: data.name,
        email: data.email || null,
        phone: data.phone,
        type: data.consultationType,
        message: data.message || null,
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

import { revalidatePath } from "next/cache";
import { NextResponse } from "next/server";
import { prisma } from "@repo/database";
import { consultationSchema } from "@/lib/validations";
import { sendConsultationNotification } from "@/lib/email";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const result = consultationSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        { error: "Validation failed", details: result.error.flatten() },
        { status: 400 }
      );
    }

    const user = await prisma.user.upsert({
      where: { phone: result.data.phone },
      update: {
        name: result.data.name,
      },
      create: {
        name: result.data.name,
        phone: result.data.phone,
      },
    });

    const consultation = await prisma.consultation.create({
      data: {
        ...result.data,
        userId: user.id,
      },
    });

    revalidatePath("/admin/consultations");
    revalidatePath("/admin/users");
    revalidatePath("/admin");

    // Send email notification (wait for it in serverless environment)
    try {
      await sendConsultationNotification(consultation);
    } catch (emailError) {
      console.error("Non-fatal: Failed to send consultation email", emailError);
    }

    return NextResponse.json(
      { message: "Consultation booked", id: consultation.id },
      { status: 201 }
    );
  } catch (error) {
    console.error("Consultation API error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

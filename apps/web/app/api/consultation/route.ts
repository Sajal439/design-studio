import { revalidatePath } from "next/cache";
import { NextResponse } from "next/server";
import { prisma } from "@repo/database";
import { consultationSchema } from "@/lib/validations";
import { sendConsultationNotification, notifyAdminConsultation } from "@/lib/email";
import { rateLimit } from "@/lib/rate-limit";

export async function POST(request: Request) {
  const limit = rateLimit(request, { limit: 5, windowMs: 60 * 60 * 1000 });
  if (!limit.success) {
    return NextResponse.json(
      { error: "Too many requests. Please wait before submitting again." },
      {
        status: 429,
        headers: { "Retry-After": String(limit.retryAfterSeconds) },
      },
    );
  }
  try {
    const body = await request.json();
    const result = consultationSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        { error: "Validation failed", details: result.error.flatten() },
        { status: 400 },
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

    // Fire-and-forget WhatsApp alert to admin
    notifyAdminConsultation({
      name: result.data.name,
      phone: result.data.phone,
      consultationType: result.data.consultationType,
      projectType: result.data.projectType,
      source: result.data.source,
    }).catch(() => {}); // non-blocking

    return NextResponse.json(
      { message: "Consultation booked", id: consultation.id },
      { status: 201 },
    );
  } catch (error) {
    console.error("Consultation API error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}

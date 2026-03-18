import { revalidatePath } from "next/cache";
import { NextResponse } from "next/server";
import { prisma } from "@repo/database";
import { quoteRequestSchema } from "@/lib/validations";
import { sendQuoteNotification, notifyAdminQuote } from "@/lib/email";
import { rateLimit } from "@/lib/rate-limit";

export async function POST(request: Request) {
  // 10 quote submissions per IP per hour
  const limit = rateLimit(request, { limit: 10, windowMs: 60 * 60 * 1000 });
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
    const result = quoteRequestSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        { error: "Validation failed", details: result.error.flatten() },
        { status: 400 },
      );
    }

    const { name, phone, email: rawEmail, ...rest } = result.data;
    const email = rawEmail || null;

    const user = await prisma.user.upsert({
      where: { phone },
      update: { name, email },
      create: {
        name,
        email,
        phone,
      },
    });

    const quote = await prisma.quoteRequest.create({
      data: {
        ...rest,
        name,
        phone,
        email,
        userId: user.id,
      },
    });

    revalidatePath("/admin/quotes");
    revalidatePath("/admin/users");
    revalidatePath("/admin");

    try {
      await sendQuoteNotification(quote);
    } catch (emailError) {
      console.error("Non-fatal: Failed to send quote email", emailError);
    }

    // Fire-and-forget WhatsApp alert to admin
    notifyAdminQuote({
      name,
      phone,
      projectType: rest.projectType,
      location: rest.location,
      source: rest.source,
    }).catch(() => {}); // non-blocking, swallow error

    return NextResponse.json(
      { message: "Quote request submitted", id: quote.id },
      { status: 201 },
    );
  } catch (error) {
    console.error("Quote API error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}

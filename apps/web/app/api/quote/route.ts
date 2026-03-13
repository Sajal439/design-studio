import { revalidatePath } from "next/cache";
import { NextResponse } from "next/server";
import { prisma } from "@repo/database";
import { quoteRequestSchema } from "@/lib/validations";
import { sendQuoteNotification } from "@/lib/email";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const result = quoteRequestSchema.safeParse(body);

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
        email: result.data.email,
      },
      create: {
        name: result.data.name,
        email: result.data.email,
        phone: result.data.phone,
      },
    });

    const quote = await prisma.quoteRequest.create({
      data: {
        ...result.data,
        userId: user.id,
      },
    });

    revalidatePath("/admin/quotes");
    revalidatePath("/admin/users");
    revalidatePath("/admin");

    // Send email notification (wait for it in serverless environment)
    try {
      await sendQuoteNotification(quote);
    } catch (emailError) {
      console.error("Non-fatal: Failed to send quote email", emailError);
    }

    return NextResponse.json(
      { message: "Quote request submitted", id: quote.id },
      { status: 201 }
    );
  } catch (error) {
    console.error("Quote API error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

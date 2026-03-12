import { NextResponse } from "next/server";
import { prisma } from "@repo/database";
import { quoteRequestSchema } from "@/lib/validations";

export async function POST(request: Request) {
  try {
    const body = await request.json();

    // Validate with Zod
    const result = quoteRequestSchema.safeParse(body);
    if (!result.success) {
      return NextResponse.json(
        { error: "Validation failed", details: result.error.flatten() },
        { status: 400 }
      );
    }

    // Save to database
    const quote = await prisma.quoteRequest.create({
      data: result.data,
    });

    return NextResponse.json(
      { message: "Quote request submitted", id: quote.id },
      { status: 201 }
    );
  } catch (error) {
    console.error("Quote API error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

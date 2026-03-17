/**
 * apps/web/app/api/auth/register/route.ts
 *
 * Changes from original:
 *   - Rate limited: 3 registrations per IP per hour
 *   - Uses shared prisma singleton from @repo/database
 *   - Typed — no more `any`
 */

import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@repo/database";
import { signToken, SESSION_COOKIE_NAME } from "@/lib/auth";
import { rateLimit } from "@/lib/rate-limit";

export async function POST(req: Request) {
  // 3 registrations per IP per hour — prevents account farming
  const limit = rateLimit(req, { limit: 3, windowMs: 60 * 60 * 1000 });
  if (!limit.success) {
    return NextResponse.json(
      { message: "Too many registration attempts. Please try again later." },
      {
        status: 429,
        headers: { "Retry-After": String(limit.retryAfterSeconds) },
      },
    );
  }

  try {
    const { name, email, phone, password } = (await req.json()) as {
      name?: string;
      email?: string;
      phone?: string;
      password?: string;
    };

    if (!name || !phone || !password) {
      return NextResponse.json(
        { message: "Name, phone, and password are required" },
        { status: 400 },
      );
    }

    const existingUser = await prisma.user.findFirst({
      where: {
        OR: [...(email ? [{ email }] : []), { phone }],
      },
    });

    if (existingUser) {
      return NextResponse.json(
        { message: "User with this email or phone already exists" },
        { status: 409 },
      );
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
      data: {
        name,
        email: email || null,
        phone,
        password: hashedPassword,
      },
    });

    const token = await signToken({
      userId: user.id,
      email: user.email ?? "",
      role: user.role,
    });

    const response = NextResponse.json(
      { message: "Registration successful" },
      { status: 201 },
    );

    response.cookies.set({
      name: SESSION_COOKIE_NAME,
      value: token,
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: 60 * 60 * 24 * 7,
      path: "/",
    });

    return response;
  } catch (error) {
    console.error("Registration error:", error);
    return NextResponse.json(
      { message: "Something went wrong" },
      { status: 500 },
    );
  }
}

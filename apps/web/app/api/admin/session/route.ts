import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { ADMIN_SESSION_COOKIE, isValidAdminPassword } from "@/lib/admin-auth";
import { SESSION_COOKIE_NAME, signToken } from "@/lib/auth";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const password = String(body?.password ?? "");

    if (!isValidAdminPassword(password)) {
      return NextResponse.json({ error: "Invalid password" }, { status: 401 });
    }

    const token = await signToken({
      userId: "admin",
      email: "admin@goeltraders.local",
      role: "admin",
    });
    const cookieStore = await cookies();

    cookieStore.set(SESSION_COOKIE_NAME, token, {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: 60 * 60 * 8,
    });
    cookieStore.delete(ADMIN_SESSION_COOKIE);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Admin session error:", error);
    return NextResponse.json({ error: "Unable to create session" }, { status: 500 });
  }
}

export async function DELETE() {
  const cookieStore = await cookies();
  cookieStore.delete(SESSION_COOKIE_NAME);
  cookieStore.delete(ADMIN_SESSION_COOKIE);
  return NextResponse.json({ success: true });
}

import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import { signToken } from "@/lib/auth";

const prisma = new PrismaClient();

export async function POST(req: Request) {
  try {
    const { email, phone, password } = await req.json();

    if ((!email && !phone) || !password) {
      return NextResponse.json(
        { message: "Missing email/phone or password" },
        { status: 400 }
      );
    }

    // --- HARCODED ADMIN FALLBACK ---
    const adminPassword = process.env.ADMIN_PASSWORD;
    if ((email === "admin" || phone === "admin") && adminPassword && password === adminPassword) {
      // Generate Admin JWT
      const payload = {
        userId: "admin-system",
        email: "admin",
        role: "admin",
      };
      const token = await signToken(payload);

      const response = NextResponse.json(
        { message: "Login successful", user: { id: "admin-system", name: "Admin", email: "admin", role: "admin" } },
        { status: 200 }
      );
      
      response.cookies.set({
        name: "session",
        value: token,
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        maxAge: 60 * 60 * 24 * 7, // 1 week
        path: "/",
      });

      // Maintain legacy admin session cookie alongside JWT for seamless compatibility
      const { getAdminSessionToken } = await import("@/lib/admin-auth");
      const legacyToken = await getAdminSessionToken();
      response.cookies.set({
        name: "admin_session",
        value: legacyToken,
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        maxAge: 60 * 60 * 24 * 7,
        path: "/",
      });

      return response;
    }

    // Find user in database
    const user = await prisma.user.findFirst({
      where: {
        OR: [
          ...(email ? [{ email }] : []),
          ...(phone ? [{ phone }] : []),
        ],
      },
    });

    if (!user || (!user.password)) {
      return NextResponse.json(
        { message: "Invalid credentials" },
        { status: 401 }
      );
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      return NextResponse.json(
        { message: "Invalid credentials" },
        { status: 401 }
      );
    }

    // Generate JWT
    const payload = {
      userId: user.id,
      email: user.email || "",
      role: user.role,
    };
    
    const token = await signToken(payload);

    // Set cookie
    const response = NextResponse.json(
      { message: "Login successful", user: { id: user.id, name: user.name, email: user.email, role: user.role } },
      { status: 200 }
    );
    
    response.cookies.set({
      name: "session",
      value: token,
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: 60 * 60 * 24 * 7, // 1 week
      path: "/",
    });

    return response;
  } catch (error) {
    console.error("Login error:", error);
    return NextResponse.json(
      { message: "Something went wrong" },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}

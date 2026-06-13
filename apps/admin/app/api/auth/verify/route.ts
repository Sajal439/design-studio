import { NextResponse } from "next/server";
import { jwtVerify } from "jose";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const token = body.token;

    if (!token) {
      return NextResponse.json({ error: "No token provided" }, { status: 400, headers: { "Access-Control-Allow-Origin": "*" } });
    }

    const secret = process.env.JWT_SECRET_KEY;
    if (!secret) {
      throw new Error("JWT_SECRET_KEY environment variable is not set.");
    }
    const encodedKey = new TextEncoder().encode(secret);

    // Verify token
    const { payload } = await jwtVerify(token, encodedKey, {
      algorithms: ["HS256"],
    });

    // In a real application, you might want to double-check the database here
    // to ensure the user wasn't deactivated recently.
    // e.g., const user = await prisma.user.findUnique({ where: { id: payload.userId } })

    return NextResponse.json({ 
      valid: true,
      user: {
        userId: payload.userId,
        email: payload.email,
        role: payload.role
      }
    }, {
      headers: {
        "Access-Control-Allow-Origin": "*",
      }
    });
  } catch (error) {
    return NextResponse.json({ error: "Invalid token" }, { status: 401, headers: { "Access-Control-Allow-Origin": "*" } });
  }
}

// Handle preflight requests for CORS
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 204,
    headers: {
      "Access-Control-Allow-Origin": "*", // In production, restrict to billing.goeltraders.in
      "Access-Control-Allow-Methods": "POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type, Authorization",
    },
  });
}

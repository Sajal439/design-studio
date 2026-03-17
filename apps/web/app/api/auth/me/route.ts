/**
 * apps/web/app/api/auth/me/route.ts
 *
 * Changes: uses shared @repo/database prisma, no raw PrismaClient.
 */

import { NextResponse } from "next/server";
import { prisma } from "@repo/database";
import { getSession } from "@/lib/auth";

export async function GET() {
  try {
    const session = await getSession();

    if (!session?.userId) {
      return NextResponse.json({ user: null }, { status: 401 });
    }

    // admin-system is the hardcoded fallback — no DB row exists for it
    if (session.userId === "admin-system") {
      return NextResponse.json({
        user: {
          id: "admin-system",
          name: "Admin",
          email: "admin",
          phone: null,
          role: "admin",
          isActive: true,
        },
      });
    }

    const user = await prisma.user.findUnique({
      where: { id: session.userId },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        role: true,
        isActive: true,
      },
    });

    if (!user) {
      return NextResponse.json({ user: null }, { status: 401 });
    }

    return NextResponse.json({ user });
  } catch (error) {
    console.error("Auth session error:", error);
    return NextResponse.json({ user: null }, { status: 500 });
  }
}
  
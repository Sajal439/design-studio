import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { ADMIN_SESSION_COOKIE, getAdminSessionToken } from "@/lib/admin-auth";
import { jwtVerify } from "jose";

const secretKey = process.env.JWT_SECRET_KEY || "fallback_secret_for_development_only";
const encodedKey = new TextEncoder().encode(secretKey);

const publicAdminPaths = new Set(["/admin/login", "/api/admin/session"]);

export async function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // --- 1. LEGACY ADMIN AUTH (Phase 2) ---
  const isAdminPath = pathname.startsWith("/admin") || pathname.startsWith("/api/admin");
  if (isAdminPath && !publicAdminPaths.has(pathname)) {
    const legacyToken = req.cookies.get(ADMIN_SESSION_COOKIE)?.value;
    const expectedToken = await getAdminSessionToken();
    
    // We will still strictly enforce the legacy admin password check for /admin routes
    if (legacyToken !== expectedToken) {
      if (pathname.startsWith("/api/admin")) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
      }
      const loginUrl = new URL("/admin/login", req.url);
      loginUrl.searchParams.set("next", pathname);
      return NextResponse.redirect(loginUrl);
    }
  }

  // --- 2. NEW JWT AUTH (Phase 3B) ---
  const sessionCookie = req.cookies.get("session")?.value;
  let sessionPayload = null;

  if (sessionCookie) {
    try {
      const { payload } = await jwtVerify(sessionCookie, encodedKey, {
        algorithms: ["HS256"],
      });
      sessionPayload = payload;
    } catch (err) {
      console.error("Middleware JWT verification failed");
    }
  }

  // Protect Admin routes (JWT)
  if (pathname.startsWith("/admin")) {
    if (!sessionPayload) {
      return NextResponse.redirect(new URL(`/login?redirect=${encodeURIComponent(pathname)}`, req.url));
    }
    if (sessionPayload.role !== "admin") {
      return NextResponse.redirect(new URL("/", req.url)); // Forbidden
    }
  }

  // Protect User Dashboard (future dashboard routes)
  if (pathname.startsWith("/dashboard")) {
    if (!sessionPayload) {
      return NextResponse.redirect(new URL(`/login?redirect=${encodeURIComponent(pathname)}`, req.url));
    }
  }

  // Prevent logged-in users from seeing login/register
  if (pathname === "/login" || pathname === "/register") {
    if (sessionPayload) {
      if (sessionPayload.role === "admin") {
        return NextResponse.redirect(new URL("/admin", req.url));
      }
      return NextResponse.redirect(new URL("/", req.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)"],
};

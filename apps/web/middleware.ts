import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { jwtVerify } from "jose";

// ── Secret ────────────────────────────────────────────────────────────────────
// Throws at boot if the variable is not set — see Critical 2 for lib/auth.ts.
const secret = process.env.JWT_SECRET_KEY;
if (!secret) throw new Error("JWT_SECRET_KEY environment variable is not set.");
const encodedKey = new TextEncoder().encode(secret);

// ── Route sets ────────────────────────────────────────────────────────────────
// Auth pages — logged-in users should be redirected away from these.
const AUTH_PAGES = new Set(["/login", "/register"]);

// ── JWT verification ───────────────────────────────────────────────────────────
async function verifySession(
  token: string,
): Promise<{ userId: string; role: string } | null> {
  try {
    const { payload } = await jwtVerify(token, encodedKey, {
      algorithms: ["HS256"],
    });
    return payload as { userId: string; role: string };
  } catch {
    return null;
  }
}

// ── Middleware ─────────────────────────────────────────────────────────────────
export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const lowercasePath = pathname.toLowerCase();

  // Read JWT session cookie only — legacy admin_session cookie is no longer
  // used for route protection. It will be cleared on next login.
  const sessionToken = req.cookies.get("session")?.value;
  const session = sessionToken ? await verifySession(sessionToken) : null;

  // ── 1. Admin routes ────────────────────────────────────────────────────────
  // Robust check: catch /admin, /Admin, /admin/, etc.
  const isAdminPath =
    lowercasePath === "/admin" ||
    lowercasePath.startsWith("/admin/") ||
    lowercasePath.startsWith("/api/admin");

  // We check against the normalized lowercase path for public routes as well
  const isPublicAdminPath =
    lowercasePath === "/admin/login" || 
    lowercasePath === "/api/admin/session";

  if (isAdminPath && !isPublicAdminPath) {
    // No session at all → redirect to admin login
    if (!session) {
      if (lowercasePath.startsWith("/api/")) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
      }
      const loginUrl = new URL("/admin/login", req.url);
      loginUrl.searchParams.set("next", pathname);
      return NextResponse.redirect(loginUrl);
    }

    // Session exists but role is not admin → forbidden
    if (session.role !== "admin") {
      if (lowercasePath.startsWith("/api/")) {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 });
      }
      return NextResponse.redirect(new URL("/", req.url));
    }
  }

  // ── 2. Protected user routes (future dashboard, saved estimates, etc.) ─────
  if (
    lowercasePath.startsWith("/dashboard") ||
    lowercasePath.startsWith("/account")
  ) {
    if (!session) {
      return NextResponse.redirect(
        new URL(`/login?redirect=${encodeURIComponent(pathname)}`, req.url),
      );
    }
  }

  // ── 3. Auth pages — redirect logged-in users away ─────────────────────────
  if (AUTH_PAGES.has(lowercasePath) && session) {
    return NextResponse.redirect(
      new URL(session.role === "admin" ? "/admin" : "/", req.url),
    );
  }

  return NextResponse.next();
}

// ── Matcher ────────────────────────────────────────────────────────────────────
// Runs on every request except static files and Next.js internals.
export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};

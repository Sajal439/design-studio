import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";

// ── Secret ─────────────────────────────────────────────────────────────────────
// Throws at startup if the environment variable is not set.
// Never falls back to a hardcoded string.
const secretKey = process.env.JWT_SECRET_KEY;
if (!secretKey) {
  throw new Error(
    "JWT_SECRET_KEY environment variable is not set. " +
      "Set it in .env.local for development and in Vercel environment variables for production.",
  );
}
const encodedKey = new TextEncoder().encode(secretKey);

// ── Types ──────────────────────────────────────────────────────────────────────
export type SessionPayload = {
  userId: string;
  email: string;
  role: string;
};

export const SESSION_COOKIE_NAME = "session";

// ── Token utilities ────────────────────────────────────────────────────────────
export async function signToken(payload: SessionPayload): Promise<string> {
  return new SignJWT({ ...payload })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("7d")
    .sign(encodedKey);
}

export async function verifyToken(
  session: string | undefined,
): Promise<SessionPayload | null> {
  if (!session) return null;

  try {
    const { payload } = await jwtVerify(session, encodedKey, {
      algorithms: ["HS256"],
    });

    // Validate shape — don't trust raw payload
    const { userId, email, role } = payload as Record<string, unknown>;
    if (
      typeof userId !== "string" ||
      typeof email !== "string" ||
      typeof role !== "string"
    ) {
      return null;
    }

    return { userId, email, role };
  } catch {
    // Token expired, tampered, or signed with a different key
    return null;
  }
}

export async function getSession(): Promise<SessionPayload | null> {
  const cookieStore = await cookies();
  const session = cookieStore.get(SESSION_COOKIE_NAME)?.value;
  return verifyToken(session);
}

export async function clearSession(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete(SESSION_COOKIE_NAME);
}

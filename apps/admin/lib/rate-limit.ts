/**
 * apps/web/lib/rate-limit.ts
 *
 * Lightweight in-memory rate limiter for Next.js API routes.
 * Uses a sliding window per IP address.
 *
 * For production at scale, replace the Map with a Redis-backed
 * store (e.g. @upstash/ratelimit). For a single-region Vercel
 * deployment serving a local retail store, this is sufficient.
 *
 * Usage:
 *   import { rateLimit } from "@/lib/rate-limit";
 *
 *   export async function POST(req: Request) {
 *     const result = await rateLimit(req, { limit: 5, windowMs: 60_000 });
 *     if (!result.success) {
 *       return NextResponse.json(
 *         { error: "Too many requests. Please wait before trying again." },
 *         { status: 429, headers: { "Retry-After": String(result.retryAfterSeconds) } },
 *       );
 *     }
 *     // ... rest of handler
 *   }
 */

type Window = {
  count: number;
  resetTime: number;
};

// Module-level store — persists across requests within a single serverless
// function instance. Each cold start gets a fresh store, which is acceptable
// for a low-traffic deployment.
const store = new Map<string, Window>();

// Clean up expired entries every 5 minutes to prevent unbounded growth.
setInterval(
  () => {
    const now = Date.now();
    for (const [key, window] of store) {
      if (now > window.resetTime) store.delete(key);
    }
  },
  5 * 60 * 1000,
);

export interface RateLimitOptions {
  // Maximum number of requests allowed in the window.
  limit: number;
  // Window duration in milliseconds.
  windowMs: number;
}

export interface RateLimitResult {
  success: boolean;
  remaining: number;
  retryAfterSeconds: number;
}

export function rateLimit(
  req: Request,
  options: RateLimitOptions,
): RateLimitResult {
  const { limit, windowMs } = options;
  const ip = getClientIp(req);
  const key = `${ip}:${new URL(req.url).pathname}`;
  const now = Date.now();

  const existing = store.get(key);

  if (!existing || now > existing.resetTime) {
    // First request in this window
    store.set(key, { count: 1, resetTime: now + windowMs });
    return { success: true, remaining: limit - 1, retryAfterSeconds: 0 };
  }

  if (existing.count >= limit) {
    const retryAfterSeconds = Math.ceil((existing.resetTime - now) / 1000);
    return { success: false, remaining: 0, retryAfterSeconds };
  }

  existing.count += 1;
  return {
    success: true,
    remaining: limit - existing.count,
    retryAfterSeconds: 0,
  };
}

// ── IP extraction ──────────────────────────────────────────────────────────────
// Vercel forwards the real client IP in x-forwarded-for.
function getClientIp(req: Request): string {
  const forwarded = req.headers.get("x-forwarded-for");
  if (forwarded) return forwarded.split(",")[0]?.trim() ?? "unknown";

  const realIp = req.headers.get("x-real-ip");
  if (realIp) return realIp.trim();

  return "unknown";
}

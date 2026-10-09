import { createHash } from "node:crypto";

type Bucket = { count: number; resetAt: number };
type RateLimitResult = { allowed: boolean; retryAfterSeconds: number };

const buckets = new Map<string, Bucket>();
const MAX_BUCKETS = 10_000;

function digestKey(key: string): string {
  return createHash("sha256").update(key).digest("hex");
}

/**
 * Process-local fixed-window limiter.
 *
 * This is useful as a baseline for local/single-instance deployments only.
 * Multi-instance production deployments must replace the store with a shared
 * atomic store (for example, Redis or a database-backed limiter).
 */
export function consumeRateLimit(
  key: string,
  limit: number,
  windowMs: number,
  now = Date.now(),
): RateLimitResult {
  if (!key || !Number.isInteger(limit) || limit < 1 || !Number.isFinite(windowMs) || windowMs < 1) {
    throw new Error("A rate-limit key, positive integer limit, and positive window are required.");
  }

  const hashedKey = digestKey(key);
  const current = buckets.get(hashedKey);

  if (!current || current.resetAt <= now) {
    if (buckets.size >= MAX_BUCKETS) {
      for (const [storedKey, bucket] of buckets) {
        if (bucket.resetAt <= now) buckets.delete(storedKey);
      }
      if (buckets.size >= MAX_BUCKETS) {
        const oldestKey = buckets.keys().next().value as string | undefined;
        if (oldestKey) buckets.delete(oldestKey);
      }
    }
    buckets.set(hashedKey, { count: 1, resetAt: now + windowMs });
    return { allowed: true, retryAfterSeconds: 0 };
  }

  if (current.count >= limit) {
    return {
      allowed: false,
      retryAfterSeconds: Math.max(1, Math.ceil((current.resetAt - now) / 1000)),
    };
  }

  current.count += 1;
  return { allowed: true, retryAfterSeconds: 0 };
}

export function getRequestClientKey(headers: Headers): string | null {
  // Only trust forwarding headers when the hosting platform overwrites them.
  // The hosting configuration must document and enforce that trust boundary.
  const forwardedFor = headers.get("x-forwarded-for")?.split(",")[0]?.trim();
  const realIp = headers.get("x-real-ip")?.trim();
  return forwardedFor || realIp || null;
}

export function rateLimitResponse(retryAfterSeconds: number): Response {
  return Response.json(
    { error: "Too many attempts. Please try again later." },
    {
      status: 429,
      headers: {
        "Retry-After": String(Math.max(1, Math.floor(retryAfterSeconds))),
        "Cache-Control": "no-store",
      },
    },
  );
}

/** Test isolation only. Do not call from application routes. */
export function resetRateLimitsForTests(): void {
  buckets.clear();
}

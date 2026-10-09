import { afterEach, describe, expect, it } from "vitest";
import {
  consumeRateLimit,
  getRequestClientKey,
  rateLimitResponse,
  resetRateLimitsForTests,
} from "@/lib/rate-limit";

afterEach(() => resetRateLimitsForTests());

describe("rate limiting", () => {
  it("allows the configured number of attempts and blocks the next", () => {
    expect(consumeRateLimit("login:account-a", 2, 60_000, 1000).allowed).toBe(true);
    expect(consumeRateLimit("login:account-a", 2, 60_000, 2000).allowed).toBe(true);
    expect(consumeRateLimit("login:account-a", 2, 60_000, 3000)).toEqual({
      allowed: false,
      retryAfterSeconds: 58,
    });
  });

  it("resets an expired window and isolates different keys", () => {
    expect(consumeRateLimit("register:one", 1, 1000, 100).allowed).toBe(true);
    expect(consumeRateLimit("register:two", 1, 1000, 200).allowed).toBe(true);
    expect(consumeRateLimit("register:one", 1, 1000, 1100).allowed).toBe(true);
  });

  it("rejects invalid limiter configuration", () => {
    expect(() => consumeRateLimit("", 3, 1000)).toThrow();
    expect(() => consumeRateLimit("x", 0, 1000)).toThrow();
    expect(() => consumeRateLimit("x", 3, 0)).toThrow();
  });

  it("derives a client key from the first forwarded address", () => {
    const headers = new Headers({ "x-forwarded-for": "192.0.2.1, 10.0.0.2" });
    expect(getRequestClientKey(headers)).toBe("192.0.2.1");
  });

  it("does not collapse requests into a shared fake IP when no trusted address is present", () => {
    expect(getRequestClientKey(new Headers())).toBeNull();
  });

  it("returns 429 with Retry-After and no-store headers", async () => {
    const response = rateLimitResponse(15);
    expect(response.status).toBe(429);
    expect(response.headers.get("Retry-After")).toBe("15");
    expect(response.headers.get("Cache-Control")).toBe("no-store");
    await expect(response.json()).resolves.toEqual({
      error: "Too many attempts. Please try again later.",
    });
  });
});

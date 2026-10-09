import { afterEach, describe, expect, it, vi } from "vitest";
import nextConfig from "../../next.config";

afterEach(() => {
  vi.unstubAllEnvs();
});

async function configuredHeaders() {
  const rules = await nextConfig.headers?.();
  const rule = rules?.find((item) => item.source === "/:path*");
  if (!rule) throw new Error("Global security headers are not configured.");
  return new Map(rule.headers.map((header) => [header.key.toLowerCase(), header.value]));
}

describe("security headers", () => {
  it("sets browser security headers on all routes", async () => {
    vi.stubEnv("NODE_ENV", "test");
    const headers = await configuredHeaders();
    expect(headers.get("x-content-type-options")).toBe("nosniff");
    expect(headers.get("x-frame-options")).toBe("DENY");
    expect(headers.get("referrer-policy")).toBe("strict-origin-when-cross-origin");
    expect(headers.get("permissions-policy")).toBe("camera=(), microphone=(), geolocation=(self)");
    expect(headers.has("strict-transport-security")).toBe(false);
  });

  it("adds HSTS only for production", async () => {
    vi.stubEnv("NODE_ENV", "production");
    const headers = await configuredHeaders();
    expect(headers.get("strict-transport-security")).toBe("max-age=63072000");
  });
});

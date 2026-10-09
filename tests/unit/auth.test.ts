import { afterEach, describe, expect, it } from "vitest";
import { createSessionToken, hashPassword, verifyPassword, verifySessionToken } from "@/lib/auth";

const originalSecret = process.env.SESSION_SECRET;

afterEach(() => {
  if (originalSecret === undefined) delete process.env.SESSION_SECRET;
  else process.env.SESSION_SECRET = originalSecret;
});

describe("password hashing", () => {
  it("verifies the original password without storing it in plaintext", async () => {
    const hash = await hashPassword("a-long-test-password-123");
    expect(hash).not.toContain("a-long-test-password-123");
    await expect(verifyPassword("a-long-test-password-123", hash)).resolves.toBe(true);
    await expect(verifyPassword("wrong-password", hash)).resolves.toBe(false);
  });
});

describe("signed sessions", () => {
  it("accepts a valid token and rejects tampered or absent tokens", () => {
    process.env.SESSION_SECRET = "test-secret-with-at-least-32-characters-long";
    const token = createSessionToken("user-123");
    expect(verifySessionToken(token)).toBe("user-123");
    expect(verifySessionToken(`${token}tampered`)).toBeNull();
    expect(verifySessionToken(undefined)).toBeNull();
  });

  it("fails closed when the session secret is not configured", () => {
    delete process.env.SESSION_SECRET;
    expect(verifySessionToken("payload.signature")).toBeNull();
  });
});

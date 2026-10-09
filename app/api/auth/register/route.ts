import { NextRequest, NextResponse } from "next/server";
import { UserRole } from "@prisma/client";
import { assertSessionSecretConfigured, createSessionToken, hashPassword, SESSION_COOKIE, SESSION_MAX_AGE } from "@/lib/auth";
import { consumeRateLimit, getRequestClientKey, rateLimitResponse } from "@/lib/rate-limit";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  const clientKey = getRequestClientKey(request.headers);
  if (clientKey) {
    const ipLimit = consumeRateLimit(`auth:register:ip:${clientKey}`, 10, 60 * 60 * 1000);
    if (!ipLimit.allowed) return rateLimitResponse(ipLimit.retryAfterSeconds);
  }

  let body: unknown;
  try { body = await request.json(); } catch {
    return NextResponse.json({ error: "Request body must be valid JSON." }, { status: 400 });
  }
  if (typeof body !== "object" || body === null) {
    return NextResponse.json({ error: "Invalid registration details." }, { status: 400 });
  }
  const input = body as Record<string, unknown>;
  const email = typeof input.email === "string" ? input.email.trim().toLowerCase() : "";
  const password = typeof input.password === "string" ? input.password : "";
  const name = typeof input.name === "string" ? input.name.trim() : null;
  const role = typeof input.role === "string" ? input.role : "BOTH";
  const allowedRoles = new Set<string>([UserRole.DRIVER, UserRole.OWNER, UserRole.BOTH]);

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || email.length > 254) {
    return NextResponse.json({ error: "Enter a valid email address." }, { status: 400 });
  }
  const emailLimit = consumeRateLimit(`auth:register:email:${email}`, 3, 60 * 60 * 1000);
  if (!emailLimit.allowed) return rateLimitResponse(emailLimit.retryAfterSeconds);

  if (password.length < 12 || password.length > 128) {
    return NextResponse.json({ error: "Password must be between 12 and 128 characters." }, { status: 400 });
  }
  if (name && name.length > 100) {
    return NextResponse.json({ error: "Name must be 100 characters or fewer." }, { status: 400 });
  }
  if (!allowedRoles.has(role)) {
    return NextResponse.json({ error: "Choose a valid account role." }, { status: 400 });
  }

  try {
    assertSessionSecretConfigured();
  } catch {
    return NextResponse.json({ error: "Authentication is not configured on this environment." }, { status: 503 });
  }

  try {
    const user = await prisma.user.create({
      data: { email, name: name || null, role: role as UserRole, passwordHash: await hashPassword(password) },
      select: { id: true, email: true, name: true, role: true },
    });
    const response = NextResponse.json({ user }, { status: 201 });
    response.cookies.set(SESSION_COOKIE, createSessionToken(user.id), {
      httpOnly: true, secure: process.env.NODE_ENV === "production", sameSite: "lax", path: "/", maxAge: SESSION_MAX_AGE,
    });
    return response;
  } catch (error) {
    if (typeof error === "object" && error !== null && "code" in error && error.code === "P2002") {
      return NextResponse.json({ error: "An account with that email already exists." }, { status: 409 });
    }
    return NextResponse.json({ error: "Registration could not be completed." }, { status: 500 });
  }
}

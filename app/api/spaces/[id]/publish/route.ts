import { SpaceStatus, UserRole } from "@prisma/client";
import { NextRequest, NextResponse } from "next/server";
import { SESSION_COOKIE, verifySessionToken } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";

export async function POST(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  const userId = verifySessionToken(request.cookies.get(SESSION_COOKIE)?.value);
  if (!userId) return NextResponse.json({ error: "Sign in to publish a listing." }, { status: 401 });
  const { id } = await context.params;

  try {
    const user = await prisma.user.findUnique({ where: { id: userId }, select: { role: true } });
    if (!user || ![UserRole.OWNER, UserRole.BOTH].includes(user.role)) {
      return NextResponse.json({ error: "An owner account is required to publish listings." }, { status: 403 });
    }
    const space = await prisma.parkingSpace.findFirst({
      where: { id, ownerId: userId },
      select: { id: true, status: true, availability: { where: { isAvailable: true, endAt: { gt: new Date() } }, select: { id: true }, take: 1 } },
    });
    if (!space) return NextResponse.json({ error: "Listing not found." }, { status: 404 });
    if (space.status === SpaceStatus.BLOCKED) {
      return NextResponse.json({ error: "This listing cannot be published. Contact support." }, { status: 403 });
    }
    if (space.status === SpaceStatus.ACTIVE) {
      return NextResponse.json({ error: "This listing is already published." }, { status: 409 });
    }
    if (space.availability.length === 0) {
      return NextResponse.json({ error: "Add a future availability window before publishing." }, { status: 400 });
    }
    const published = await prisma.parkingSpace.update({
      where: { id: space.id },
      data: { status: SpaceStatus.ACTIVE },
      select: { id: true, title: true, status: true },
    });
    return NextResponse.json({ space: published });
  } catch {
    return NextResponse.json({ error: "Listing could not be published right now." }, { status: 503 });
  }
}

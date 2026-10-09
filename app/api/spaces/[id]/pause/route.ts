import { SpaceStatus, UserRole } from "@prisma/client";
import { NextRequest, NextResponse } from "next/server";
import { SESSION_COOKIE, verifySessionToken } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";

export async function POST(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  const userId = verifySessionToken(request.cookies.get(SESSION_COOKIE)?.value);
  if (!userId) return NextResponse.json({ error: "Sign in to pause a listing." }, { status: 401 });
  const { id } = await context.params;

  try {
    const user = await prisma.user.findUnique({ where: { id: userId }, select: { role: true } });
    if (!user || (user.role !== UserRole.OWNER && user.role !== UserRole.BOTH)) {
      return NextResponse.json({ error: "An owner account is required to pause listings." }, { status: 403 });
    }

    const ownedSpace = await prisma.parkingSpace.findFirst({
      where: { id, ownerId: userId },
      select: { id: true, status: true },
    });
    if (!ownedSpace) return NextResponse.json({ error: "Listing not found." }, { status: 404 });
    if (ownedSpace.status !== SpaceStatus.ACTIVE) {
      return NextResponse.json({ error: "Only active listings can be paused." }, { status: 409 });
    }

    const updated = await prisma.parkingSpace.updateMany({
      where: { id, ownerId: userId, status: SpaceStatus.ACTIVE },
      data: { status: SpaceStatus.PAUSED },
    });
    if (updated.count === 0) {
      return NextResponse.json({ error: "Listing status changed. Refresh and try again." }, { status: 409 });
    }
    return NextResponse.json({ space: { id, status: SpaceStatus.PAUSED } });
  } catch {
    return NextResponse.json({ error: "Listing could not be paused right now." }, { status: 503 });
  }
}

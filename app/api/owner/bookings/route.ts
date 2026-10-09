import { BookingStatus, PaymentStatus, UserRole } from "@prisma/client";
import { NextRequest, NextResponse } from "next/server";
import { SESSION_COOKIE, verifySessionToken } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";

export async function GET(request: NextRequest) {
  const userId = verifySessionToken(request.cookies.get(SESSION_COOKIE)?.value);
  if (!userId) return NextResponse.json({ error: "Sign in to view owner bookings." }, { status: 401 });

  try {
    const user = await prisma.user.findUnique({ where: { id: userId }, select: { role: true } });
    if (!user || (user.role !== UserRole.OWNER && user.role !== UserRole.BOTH)) {
      return NextResponse.json({ error: "An owner account is required to view incoming bookings." }, { status: 403 });
    }

    await prisma.booking.updateMany({
      where: { status: BookingStatus.PENDING_PAYMENT, paymentStatus: PaymentStatus.PENDING, holdExpiresAt: { lte: new Date() } },
      data: { status: BookingStatus.EXPIRED },
    });

    const bookings = await prisma.booking.findMany({
      where: { space: { ownerId: userId } },
      orderBy: { createdAt: "desc" },
      take: 50,
      select: {
        id: true,
        startAt: true,
        endAt: true,
        totalMinor: true,
        currency: true,
        status: true,
        paymentStatus: true,
        holdExpiresAt: true,
        createdAt: true,
        driver: { select: { name: true } },
        space: { select: { title: true, locality: true, city: true } },
      },
    });

    return NextResponse.json({ bookings });
  } catch {
    return NextResponse.json({ error: "Incoming bookings could not be loaded right now." }, { status: 503 });
  }
}

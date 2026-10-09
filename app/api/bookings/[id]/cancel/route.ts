import { BookingStatus, PaymentStatus } from "@prisma/client";
import { NextRequest, NextResponse } from "next/server";
import { SESSION_COOKIE, verifySessionToken } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";

export async function POST(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  const userId = verifySessionToken(request.cookies.get(SESSION_COOKIE)?.value);
  if (!userId) return NextResponse.json({ error: "Sign in to manage your bookings." }, { status: 401 });
  const { id } = await context.params;
  try {
    const result = await prisma.booking.updateMany({
      where: { id, driverId: userId, status: BookingStatus.PENDING_PAYMENT, paymentStatus: PaymentStatus.PENDING },
      data: { status: BookingStatus.CANCELLED },
    });
    if (result.count === 0) {
      return NextResponse.json({ error: "Pending booking not found or it can no longer be cancelled." }, { status: 404 });
    }
    return NextResponse.json({ success: true, message: "Booking hold cancelled." });
  } catch {
    return NextResponse.json({ error: "Booking could not be cancelled right now." }, { status: 503 });
  }
}

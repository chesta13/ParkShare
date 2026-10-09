import { BookingStatus, PaymentStatus, Prisma, SpaceStatus, UserRole } from "@prisma/client";
import { NextRequest, NextResponse } from "next/server";
import { SESSION_COOKIE, verifySessionToken } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { calculateBookingPrice, MAX_BOOKING_HOURS } from "@/lib/booking";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
const HOLD_MINUTES = 10;

class BookingRequestError extends Error {
  constructor(message: string, readonly status: number) {
    super(message);
  }
}

export async function GET(request: NextRequest) {
  const userId = verifySessionToken(request.cookies.get(SESSION_COOKIE)?.value);
  if (!userId) return NextResponse.json({ error: "Sign in to view your bookings." }, { status: 401 });
  try {
    const bookings = await prisma.booking.findMany({
      where: { driverId: userId },
      select: {
        id: true, startAt: true, endAt: true, subtotalMinor: true, platformFeeMinor: true,
        totalMinor: true, currency: true, status: true, paymentStatus: true, holdExpiresAt: true,
        space: { select: { title: true, locality: true, city: true } },
      },
      orderBy: { createdAt: "desc" },
      take: 100,
    });
    return NextResponse.json({ bookings });
  } catch {
    return NextResponse.json({ error: "Your bookings are temporarily unavailable." }, { status: 503 });
  }
}

export async function POST(request: NextRequest) {
  const userId = verifySessionToken(request.cookies.get(SESSION_COOKIE)?.value);
  if (!userId) return NextResponse.json({ error: "Sign in before booking a space." }, { status: 401 });
  let body: unknown;
  try { body = await request.json(); } catch {
    return NextResponse.json({ error: "Request body must be valid JSON." }, { status: 400 });
  }
  if (typeof body !== "object" || body === null) {
    return NextResponse.json({ error: "Invalid booking details." }, { status: 400 });
  }
  const input = body as Record<string, unknown>;
  const spaceId = typeof input.spaceId === "string" ? input.spaceId.trim() : "";
  const startAt = typeof input.startAt === "string" ? new Date(input.startAt) : new Date(Number.NaN);
  const endAt = typeof input.endAt === "string" ? new Date(input.endAt) : new Date(Number.NaN);
  const now = new Date();
  if (!spaceId || spaceId.length > 100) {
    return NextResponse.json({ error: "Choose a valid parking space." }, { status: 400 });
  }
  if (Number.isNaN(startAt.getTime()) || Number.isNaN(endAt.getTime()) || startAt <= now || endAt <= startAt) {
    return NextResponse.json({ error: "Choose a valid future start and end time." }, { status: 400 });
  }
  const durationMs = endAt.getTime() - startAt.getTime();
  if (durationMs > MAX_BOOKING_HOURS * 60 * 60 * 1000) {
    return NextResponse.json({ error: `Bookings are limited to ${MAX_BOOKING_HOURS} hours in this MVP.` }, { status: 400 });
  }

  try {
    const user = await prisma.user.findUnique({ where: { id: userId }, select: { role: true } });
    if (!user || (user.role !== UserRole.DRIVER && user.role !== UserRole.BOTH)) {
      return NextResponse.json({ error: "A driver account is required to book a space." }, { status: 403 });
    }

    const booking = await prisma.$transaction(async (tx) => {
      const space = await tx.parkingSpace.findUnique({
        where: { id: spaceId },
        select: { id: true, ownerId: true, status: true, hourlyRateMinor: true, currency: true },
      });
      if (!space || space.status !== SpaceStatus.ACTIVE) {
        throw new BookingRequestError("This parking space is not available for booking.", 404);
      }
      if (space.ownerId === userId) {
        throw new BookingRequestError("You cannot book your own parking space.", 400);
      }

      const availability = await tx.availabilityWindow.findFirst({
        where: { parkingSpaceId: space.id, isAvailable: true, startAt: { lte: startAt }, endAt: { gte: endAt } },
        select: { id: true },
      });
      if (!availability) {
        throw new BookingRequestError("The selected time is outside this space's availability window.", 409);
      }

      const overlap = await tx.booking.findFirst({
        where: {
          spaceId: space.id,
          startAt: { lt: endAt },
          endAt: { gt: startAt },
          OR: [
            { status: { in: [BookingStatus.CONFIRMED, BookingStatus.ACTIVE] } },
            { status: BookingStatus.PENDING_PAYMENT, holdExpiresAt: { gt: now } },
          ],
        },
        select: { id: true },
      });
      if (overlap) throw new BookingRequestError("That time window was just taken. Please search again.", 409);

      const price = calculateBookingPrice(space.hourlyRateMinor, { startAt, endAt });
      if (!price) throw new BookingRequestError("The calculated price or booking duration is outside the supported range.", 400);
      const { subtotalMinor, platformFeeMinor, totalMinor } = price;

      return tx.booking.create({
        data: {
          spaceId: space.id, driverId: userId, startAt, endAt,
          subtotalMinor, platformFeeMinor, totalMinor, currency: space.currency,
          status: BookingStatus.PENDING_PAYMENT,
          paymentStatus: PaymentStatus.PENDING,
          holdExpiresAt: new Date(now.getTime() + HOLD_MINUTES * 60 * 1000),
        },
        select: {
          id: true, startAt: true, endAt: true, subtotalMinor: true, platformFeeMinor: true,
          totalMinor: true, currency: true, status: true, paymentStatus: true, holdExpiresAt: true,
        },
      });
    }, { isolationLevel: Prisma.TransactionIsolationLevel.Serializable });

    return NextResponse.json({
      booking: {
        ...booking,
        subtotal: booking.subtotalMinor / 100,
        platformFee: booking.platformFeeMinor / 100,
        total: booking.totalMinor / 100,
      },
      paymentRequired: true,
      message: "A 10-minute booking hold was created. Payment is not integrated yet; no charge has been taken.",
    }, { status: 201 });
  } catch (error) {
    if (error instanceof BookingRequestError) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }
    if (typeof error === "object" && error !== null && "code" in error && error.code === "P2034") {
      return NextResponse.json({ error: "Another booking was created at the same time. Please search again." }, { status: 409 });
    }
    return NextResponse.json({ error: "Booking could not be created right now." }, { status: 503 });
  }
}

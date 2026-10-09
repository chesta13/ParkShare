import { BookingStatus, SpaceStatus, UserRole } from "@prisma/client";
import { NextRequest, NextResponse } from "next/server";
import { SESSION_COOKIE, verifySessionToken } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const params = request.nextUrl.searchParams;
  if (params.get("mine") === "1") {
    const userId = verifySessionToken(request.cookies.get(SESSION_COOKIE)?.value);
    if (!userId) return NextResponse.json({ error: "Sign in to view your listings." }, { status: 401 });
    try {
      const ownSpaces = await prisma.parkingSpace.findMany({
        where: { ownerId: userId },
        select: { id: true, title: true, locality: true, city: true, status: true, hourlyRateMinor: true, currency: true, createdAt: true },
        orderBy: { createdAt: "desc" },
        take: 100,
      });
      return NextResponse.json({ spaces: ownSpaces.map((space) => ({ ...space, hourlyRate: space.hourlyRateMinor / 100 })) });
    } catch {
      return NextResponse.json({ error: "Your listings are temporarily unavailable." }, { status: 503 });
    }
  }
  const city = params.get("city")?.trim();
  const locality = params.get("locality")?.trim();
  const startText = params.get("startAt");
  const endText = params.get("endAt");
  let startAt: Date | undefined;
  let endAt: Date | undefined;

  if (startText || endText) {
    startAt = startText ? new Date(startText) : undefined;
    endAt = endText ? new Date(endText) : undefined;
    if (!startAt || !endAt || Number.isNaN(startAt.getTime()) || Number.isNaN(endAt.getTime()) || startAt >= endAt) {
      return NextResponse.json({ error: "Provide a valid startAt and endAt time range." }, { status: 400 });
    }
    if (startAt.getTime() < Date.now() - 60_000) {
      return NextResponse.json({ error: "The requested start time must be in the future." }, { status: 400 });
    }
  }

  try {
    const spaces = await prisma.parkingSpace.findMany({
      where: {
        status: SpaceStatus.ACTIVE,
        ...(city ? { city: { contains: city, mode: "insensitive" as const } } : {}),
        ...(locality ? { locality: { contains: locality, mode: "insensitive" as const } } : {}),
        ...(startAt && endAt ? {
          bookings: { none: {
            OR: [
              { status: { in: [BookingStatus.CONFIRMED, BookingStatus.ACTIVE] } },
              { status: BookingStatus.PENDING_PAYMENT, holdExpiresAt: { gt: new Date() } },
            ],
            startAt: { lt: endAt },
            endAt: { gt: startAt },
          } },
          availability: { some: { isAvailable: true, startAt: { lte: startAt }, endAt: { gte: endAt } } },
        } : {}),
      },
      select: {
        id: true, title: true, description: true, locality: true, city: true,
        latitude: true, longitude: true, vehicleTypes: true, hourlyRateMinor: true,
        currency: true, owner: { select: { name: true } },
      },
      orderBy: [{ hourlyRateMinor: "asc" }, { createdAt: "desc" }],
      take: 100,
    });
    return NextResponse.json({ spaces: spaces.map((space) => ({
      ...space,
      latitude: space.latitude?.toString() ?? null,
      longitude: space.longitude?.toString() ?? null,
      hourlyRate: space.hourlyRateMinor / 100,
    })) });
  } catch {
    return NextResponse.json({ error: "Parking search is temporarily unavailable." }, { status: 503 });
  }
}

export async function POST(request: NextRequest) {
  const userId = verifySessionToken(request.cookies.get(SESSION_COOKIE)?.value);
  if (!userId) return NextResponse.json({ error: "Sign in before creating a listing." }, { status: 401 });

  let user;
  try {
    user = await prisma.user.findUnique({ where: { id: userId }, select: { role: true } });
  } catch {
    return NextResponse.json({ error: "Listing service is temporarily unavailable." }, { status: 503 });
  }
  if (!user || (user.role !== UserRole.OWNER && user.role !== UserRole.BOTH)) {
    return NextResponse.json({ error: "An owner account is required to create a listing." }, { status: 403 });
  }

  let body: unknown;
  try { body = await request.json(); } catch {
    return NextResponse.json({ error: "Request body must be valid JSON." }, { status: 400 });
  }
  if (typeof body !== "object" || body === null) {
    return NextResponse.json({ error: "Invalid listing details." }, { status: 400 });
  }
  const input = body as Record<string, unknown>;
  const title = typeof input.title === "string" ? input.title.trim() : "";
  const locality = typeof input.locality === "string" ? input.locality.trim() : "";
  const city = typeof input.city === "string" ? input.city.trim() : "";
  const addressLine = typeof input.addressLine === "string" ? input.addressLine.trim() : "";
  const description = typeof input.description === "string" ? input.description.trim() : "";
  const vehicleType = typeof input.vehicleType === "string" ? input.vehicleType : "";
  const hourlyRate = input.hourlyRate;
  const availableFromText = typeof input.availableFrom === "string" ? input.availableFrom : "";
  const availableToText = typeof input.availableTo === "string" ? input.availableTo : "";
  const availableFrom = new Date(availableFromText);
  const availableTo = new Date(availableToText);

  if (!title || title.length > 120 || !locality || locality.length > 120 || !city || city.length > 120) {
    return NextResponse.json({ error: "Title, locality and city are required and must be 120 characters or fewer." }, { status: 400 });
  }
  if (!addressLine || addressLine.length > 500) {
    return NextResponse.json({ error: "An access description is required and must be 500 characters or fewer." }, { status: 400 });
  }
  if (!["car", "suv", "bike", "any"].includes(vehicleType)) {
    return NextResponse.json({ error: "Choose a supported vehicle type." }, { status: 400 });
  }
  if (typeof hourlyRate !== "number" || !Number.isFinite(hourlyRate) || hourlyRate < 1 || hourlyRate > 100000) {
    return NextResponse.json({ error: "Hourly price must be between ₹1 and ₹100,000." }, { status: 400 });
  }
  if (!availableFromText || !availableToText || Number.isNaN(availableFrom.getTime()) || Number.isNaN(availableTo.getTime()) || availableFrom >= availableTo || availableFrom.getTime() <= Date.now()) {
    return NextResponse.json({ error: "Provide a future availability start and an end time after it." }, { status: 400 });
  }

  try {
    const space = await prisma.parkingSpace.create({
      data: {
        ownerId: userId, title, locality, city, addressLine,
        description: description || null,
        vehicleTypes: vehicleType === "any" ? ["car", "suv", "bike"] : [vehicleType],
        hourlyRateMinor: Math.round(hourlyRate * 100),
        status: SpaceStatus.DRAFT,
        availability: { create: { startAt: availableFrom, endAt: availableTo, isAvailable: true } },
      },
      select: { id: true, title: true, status: true, hourlyRateMinor: true, currency: true },
    });
    return NextResponse.json({ space: { ...space, hourlyRate: space.hourlyRateMinor / 100 } }, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Listing could not be saved." }, { status: 503 });
  }
}

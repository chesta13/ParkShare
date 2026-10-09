import { describe, expect, it } from "vitest";
import { bookingWindowsOverlap, calculateBookingPrice } from "@/lib/booking";

describe("bookingWindowsOverlap", () => {
  it("detects overlapping bookings", () => {
    expect(
      bookingWindowsOverlap(
        { startAt: new Date("2026-09-14T10:00:00Z"), endAt: new Date("2026-09-14T12:00:00Z") },
        { startAt: new Date("2026-09-14T11:00:00Z"), endAt: new Date("2026-09-14T13:00:00Z") },
      ),
    ).toBe(true);
  });

  it("allows adjacent bookings", () => {
    expect(
      bookingWindowsOverlap(
        { startAt: new Date("2026-09-14T10:00:00Z"), endAt: new Date("2026-09-14T12:00:00Z") },
        { startAt: new Date("2026-09-14T12:00:00Z"), endAt: new Date("2026-09-14T14:00:00Z") },
      ),
    ).toBe(false);
  });

  it("detects an enclosing booking", () => {
    expect(
      bookingWindowsOverlap(
        { startAt: new Date("2026-09-14T10:00:00Z"), endAt: new Date("2026-09-14T15:00:00Z") },
        { startAt: new Date("2026-09-14T11:00:00Z"), endAt: new Date("2026-09-14T12:00:00Z") },
      ),
    ).toBe(true);
  });
});


describe("calculateBookingPrice", () => {
  it("rounds a partial hour up and calculates the platform fee in paise", () => {
    expect(calculateBookingPrice(6000, {
      startAt: new Date("2026-10-10T10:00:00Z"),
      endAt: new Date("2026-10-10T11:01:00Z"),
    })).toEqual({ billableHours: 2, subtotalMinor: 12000, platformFeeMinor: 1800, totalMinor: 13800 });
  });

  it("rejects invalid or overlong booking windows", () => {
    const startAt = new Date("2026-10-10T10:00:00Z");
    expect(calculateBookingPrice(6000, { startAt, endAt: startAt })).toBeNull();
    expect(calculateBookingPrice(6000, { startAt, endAt: new Date("2026-10-11T11:00:00Z") })).toBeNull();
    expect(calculateBookingPrice(0, { startAt, endAt: new Date("2026-10-10T11:00:00Z") })).toBeNull();
  });
});

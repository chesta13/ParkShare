import { describe, expect, it } from "vitest";
import { bookingWindowsOverlap } from "@/lib/booking";

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

export type TimeRange = {
  startAt: Date;
  endAt: Date;
};

export const MAX_BOOKING_HOURS = 24;
const HOUR_MS = 60 * 60 * 1000;

/** Returns true when two booking windows overlap. Endpoints may touch. */
export function bookingWindowsOverlap(a: TimeRange, b: TimeRange): boolean {
  return a.startAt < b.endAt && b.startAt < a.endAt;
}

export type BookingPrice = {
  billableHours: number;
  subtotalMinor: number;
  platformFeeMinor: number;
  totalMinor: number;
};

/** Prices whole billable hours in integer minor currency units. Returns null for invalid input. */
export function calculateBookingPrice(hourlyRateMinor: number, range: TimeRange): BookingPrice | null {
  const durationMs = range.endAt.getTime() - range.startAt.getTime();
  if (
    !Number.isSafeInteger(hourlyRateMinor) || hourlyRateMinor < 1 ||
    !Number.isFinite(range.startAt.getTime()) || !Number.isFinite(range.endAt.getTime()) ||
    durationMs <= 0 || durationMs > MAX_BOOKING_HOURS * HOUR_MS
  ) return null;

  const billableHours = Math.ceil(durationMs / HOUR_MS);
  const subtotalMinor = hourlyRateMinor * billableHours;
  const platformFeeMinor = Math.round(subtotalMinor * 0.15);
  const totalMinor = subtotalMinor + platformFeeMinor;
  if (![subtotalMinor, platformFeeMinor, totalMinor].every(Number.isSafeInteger)) return null;
  return { billableHours, subtotalMinor, platformFeeMinor, totalMinor };
}

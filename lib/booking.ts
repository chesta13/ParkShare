export type TimeRange = {
  startAt: Date;
  endAt: Date;
};

/** Returns true when two booking windows overlap. Endpoints may touch. */
export function bookingWindowsOverlap(a: TimeRange, b: TimeRange): boolean {
  return a.startAt < b.endAt && b.startAt < a.endAt;
}

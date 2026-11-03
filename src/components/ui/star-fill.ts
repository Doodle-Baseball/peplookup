/**
 * How full each of the five stars is (0-1) for a rating out of 5: 4.3 gives
 * [1, 1, 1, 1, 0.3]. Shared by every star display so none can round a 4.3 up
 * to five stars.
 */
export function starFills(rating: number): number[] {
  const clamped = Number.isFinite(rating) ? Math.min(5, Math.max(0, rating)) : 0;
  return [0, 1, 2, 3, 4].map((index) => Math.round(Math.min(1, Math.max(0, clamped - index)) * 100) / 100);
}

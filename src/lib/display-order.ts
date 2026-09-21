/**
 * Manual display order, set by dragging cards in the admin and stored as
 * `position` on the `suppliers` and `products` tables (0013_display_order.sql).
 *
 * Sorting happens here rather than in the query because `position` only exists
 * once that migration has run: ordering by a missing column fails the whole
 * request, while reading a missing field just yields `null` and falls back to
 * the previous order.
 */

/** Gap left between consecutive positions so a row can be inserted without renumbering. */
export const POSITION_STEP = 10;

export interface Positioned {
  position: number | null;
}

/**
 * Placed rows first, in position order; unplaced rows keep `fallback`'s order
 * after them, so a row that has never been dragged still appears.
 */
export function byPosition<T extends Positioned>(fallback: (a: T, b: T) => number = () => 0) {
  return (a: T, b: T): number => {
    if (a.position === null && b.position === null) return fallback(a, b);
    if (a.position === null) return 1;
    if (b.position === null) return -1;
    return a.position - b.position || fallback(a, b);
  };
}

/** Sorts a copy, leaving the caller's array untouched. */
export function sortByPosition<T extends Positioned>(
  rows: readonly T[],
  fallback: (a: T, b: T) => number = () => 0,
): T[] {
  return [...rows].sort(byPosition(fallback));
}

/** Position values for a reordered list of slugs, spaced by `POSITION_STEP`. */
export function positionsForOrder(slugs: readonly string[]): { slug: string; position: number }[] {
  return slugs.map((slug, index) => ({ slug, position: (index + 1) * POSITION_STEP }));
}

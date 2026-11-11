/** Sort state for the supplier page's market table, kept apart from the row maths so the client bundle stays small. */

export const MARKET_SORT_KEYS = ['compound', 'size', 'price', 'market'] as const;
export type MarketSortKey = (typeof MARKET_SORT_KEYS)[number];
export type MarketSortDirection = 'asc' | 'desc';
export type MarketSort = { key: MarketSortKey; direction: MarketSortDirection };

/** The query parameter the table keeps its sort in, so a sorted table can be shared as a link. */
export const MARKET_SORT_PARAM = 'msort';

/** Reads "price-asc" style values; anything else is null, the most-wanted-first order. */
export function parseMarketSort(value: string | undefined): MarketSort | null {
  const [key, direction] = (value ?? '').split('-');
  const sortKey = MARKET_SORT_KEYS.find((candidate) => candidate === key);
  if (!sortKey || (direction !== 'asc' && direction !== 'desc')) return null;
  return { key: sortKey, direction };
}

import { type Cents, type Currency } from './money';

/** Dosage is stored as integer micrograms for the same reason money is cents. */
export type Micrograms = number & { readonly __brand: 'Micrograms' };

export function mcg(value: number): Micrograms {
  if (!Number.isFinite(value)) throw new RangeError(`Not a finite dose: ${value}`);
  return Math.round(value) as Micrograms;
}

export function mgToMcg(milligrams: number): Micrograms {
  return mcg(milligrams * 1000);
}

export interface Listing {
  readonly supplierSlug: string;
  readonly productSlug: string;
  /** Undiscounted price the vendor advertises. */
  readonly listPrice: Cents;
  /** Price after the site's coupon, when one applies. Distinct field, never overwrites listPrice. */
  readonly salePrice: Cents | null;
  readonly currency: Currency;
  /** Strength of a single vial. */
  readonly vialSize: Micrograms;
  /** Vials in the pack. A 10-vial kit must divide by 10 or bulk ranks wrong. */
  readonly vialCount: number;
  readonly inStock: boolean;
  readonly scrapedAt: string;
  readonly url: string;
}

/** The price a buyer actually pays today. */
export function effectivePrice(listing: Listing): Cents {
  return listing.salePrice ?? listing.listPrice;
}

export function hasDiscount(listing: Listing): boolean {
  return listing.salePrice !== null && listing.salePrice < listing.listPrice;
}

export function discountPercent(listing: Listing): number | null {
  if (!hasDiscount(listing) || listing.listPrice <= 0) return null;
  const sale = listing.salePrice as Cents;
  return Math.round(((listing.listPrice - sale) / listing.listPrice) * 100);
}

export function totalMicrograms(listing: Listing): Micrograms {
  return mcg(listing.vialSize * listing.vialCount);
}

/**
 * Cost per mg at full precision, in cents. Returns null rather than Infinity or
 * NaN when the listing cannot support the calculation, so callers must handle
 * the missing case instead of rendering "$NaN/mg".
 */
export function pricePerMg(listing: Listing): number | null {
  const totalMcg = totalMicrograms(listing);
  if (totalMcg <= 0 || listing.vialCount <= 0) return null;
  const price = effectivePrice(listing);
  if (price <= 0) return null;
  return price / (totalMcg / 1000);
}

export function listPricePerMg(listing: Listing): number | null {
  return pricePerMg({ ...listing, salePrice: null });
}

export interface RankedListing {
  readonly listing: Listing;
  readonly perMg: number;
}

/**
 * Rank by cost per mg, cheapest first.
 *
 * Out-of-stock listings are dropped before ranking, never after: a dead listing
 * must not win "best price". Listings whose per-mg cannot be computed are also
 * dropped rather than sorted to an arbitrary end.
 */
export function rankByPricePerMg(listings: readonly Listing[]): RankedListing[] {
  const ranked: RankedListing[] = [];
  for (const listing of listings) {
    if (!listing.inStock) continue;
    const perMg = pricePerMg(listing);
    if (perMg === null) continue;
    ranked.push({ listing, perMg });
  }
  // Compare at full precision; a stable tiebreak on slug keeps render order
  // deterministic between server and client.
  return ranked.sort(
    (a, b) => a.perMg - b.perMg || a.listing.supplierSlug.localeCompare(b.listing.supplierSlug),
  );
}

export function bestListing(listings: readonly Listing[]): RankedListing | null {
  return rankByPricePerMg(listings)[0] ?? null;
}

/**
 * Comparing across currencies without a conversion rate would silently rank a
 * €66 listing against a $66 one. Until a rate source exists, callers group by
 * currency and rank within each group.
 */
export function groupByCurrency(
  listings: readonly Listing[],
): ReadonlyMap<Currency, readonly Listing[]> {
  const groups = new Map<Currency, Listing[]>();
  for (const listing of listings) {
    const bucket = groups.get(listing.currency);
    if (bucket) bucket.push(listing);
    else groups.set(listing.currency, [listing]);
  }
  return groups;
}

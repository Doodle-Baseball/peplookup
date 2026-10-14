import type { ProductOfferSummary } from '@/lib/structured-data/graph';

export interface DisplayedOffer {
  /** The price the page shows for this listing, in integer cents. */
  priceCents: number;
  currency: string;
  inStock: boolean;
}

/**
 * Low and high price across the in-stock USD listings a compound page shows,
 * or null when there are none: a Product with no offers is a Search Console
 * error, and an out-of-stock listing must never set the low price.
 */
export function summarizeOffers(
  product: { name: string; description: string },
  offers: readonly DisplayedOffer[],
): ProductOfferSummary | null {
  const prices = offers
    .filter((offer) => offer.inStock && offer.currency === 'USD' && offer.priceCents > 0)
    .map((offer) => offer.priceCents);
  if (prices.length === 0) return null;
  return {
    name: product.name,
    description: product.description,
    lowPriceCents: Math.min(...prices),
    highPriceCents: Math.max(...prices),
    offerCount: prices.length,
  };
}

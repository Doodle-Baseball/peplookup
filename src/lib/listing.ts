import type { Offer } from './schema';
import { type Listing, mcg } from './price';
import { cents } from './money';

/**
 * Adapt a stored offer into the shape the price math consumes. Kept free of
 * server imports so the product page's client-side filters can rank prices
 * with exactly the same math as the server.
 */
export function toListing(offer: Offer): Listing {
  return {
    supplierSlug: offer.supplierSlug,
    productSlug: offer.productSlug,
    listPrice: cents(offer.listPrice),
    salePrice: offer.salePrice === null ? null : cents(offer.salePrice),
    currency: offer.currency,
    vialSize: mcg(offer.vialSize),
    vialCount: offer.vialCount,
    inStock: offer.inStock,
    scrapedAt: offer.scrapedAt,
    url: offer.productUrl,
  };
}

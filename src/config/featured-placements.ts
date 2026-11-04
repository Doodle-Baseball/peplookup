import { PROMOTED_SUPPLIER } from '@/config/highlights-bar';

/**
 * Homepage product cards where the promoted partner is placed among the five
 * suppliers shown, whatever its price. Its row is always labelled "Featured"
 * so the placement is disclosed, and the cheapest supplier keeps the "best
 * price" highlight. Edit the product slugs here; remove them all to stop.
 */
export const FEATURED_CARD_PLACEMENT = {
  supplierSlug: PROMOTED_SUPPLIER?.slug ?? null,
  productSlugs: new Set(['tirzepatide', 'ipamorelin', 'mots-c', 'nad', 'pt-141']),
};

/**
 * Where the featured row goes in a card's top five (0-4). Spread across the
 * five positions by product, but fixed for each product, so the server and the
 * browser render the same order and a page never reshuffles on reload.
 */
export function featuredPositionFor(productSlug: string, rowCount: number): number {
  // FNV-1a over a salted slug: spreads the five products across different positions.
  let hash = 0x811c9dc5;
  for (const character of `featured${productSlug}`) {
    hash ^= character.charCodeAt(0);
    hash = Math.imul(hash, 0x01000193) >>> 0;
  }
  return hash % Math.max(1, Math.min(5, rowCount));
}

export function isFeaturedPlacement(productSlug: string, supplierSlug: string): boolean {
  return (
    FEATURED_CARD_PLACEMENT.supplierSlug !== null &&
    supplierSlug === FEATURED_CARD_PLACEMENT.supplierSlug &&
    FEATURED_CARD_PLACEMENT.productSlugs.has(productSlug)
  );
}

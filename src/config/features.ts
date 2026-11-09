/**
 * Phase 2 structured data: a Product node with AggregateOffer pricing on
 * compound pages. On by default: the low/high prices are worked out from the
 * same in-stock USD listings the page shows, so the markup always matches the
 * visible prices. Set PRODUCT_OFFER_SCHEMA=off to turn it off.
 */
export const PRODUCT_OFFER_SCHEMA_ENABLED = process.env.PRODUCT_OFFER_SCHEMA !== 'off';

/**
 * Phase 2 structured data: a Product node with AggregateOffer pricing on
 * compound pages. Off by default; set PRODUCT_OFFER_SCHEMA=on to turn it on
 * once the prices it reports have been checked against the live pages.
 */
export const PRODUCT_OFFER_SCHEMA_ENABLED = process.env.PRODUCT_OFFER_SCHEMA === 'on';

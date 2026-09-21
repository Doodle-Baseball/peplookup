import { offerListSchema, type Offer } from '@/lib/schema';

/**
 * Vendor price observations.
 *
 * Empty by design. Every row here must come from our own crawl of a vendor's
 * live product page, carrying the timestamp it was observed. Seeding invented
 * or second-hand prices would put wrong numbers in front of somebody about to
 * spend money, so the site ships empty states until the crawler runs.
 */
const seed: Offer[] = [];

export const offers: readonly Offer[] = offerListSchema.parse(seed);

import type { AffiliateClickSource } from '@/lib/extension/schema';

/**
 * A supplier's shop link through /go, by slug. /go looks up the affiliate link
 * saved in the admin and counts the click against `source`, so the admin can
 * compare website and extension clicks. Product links that go to a specific
 * product page keep the `/go?to=<url>` form instead.
 */
export function supplierGoPath(slug: string, source: AffiliateClickSource): string {
  return `/go?to=${encodeURIComponent(slug)}&src=${source}`;
}

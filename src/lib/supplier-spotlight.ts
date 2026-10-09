import type { Supplier } from '@/lib/schema';
import { formatReviewCount } from '@/lib/format';
import type { SpotlightSupplier } from '@/components/layout/supplier-spotlight';

/** Names the review platform from the reviews link, so the score is attributed, never bare. */
function reviewSourceName(url: string | null): string | null {
  if (!url) return null;
  try {
    const host = new URL(url).hostname.replace(/^www\./, '');
    if (host.endsWith('trustpilot.com')) return 'Trustpilot';
    return null;
  } catch {
    return null;
  }
}

/**
 * The featured supplier's card content, from data held for it. A missing
 * coupon or rating is left out of the card, never filled with a placeholder.
 */
export function buildSupplierSpotlight(supplier: Supplier): SpotlightSupplier {
  return {
    slug: supplier.slug,
    name: supplier.name,
    logoUrl: supplier.logoUrl ?? supplier.faviconUrl,
    shopUrl: supplier.affiliateUrl || supplier.homepageUrl,
    coupon: supplier.coupon ? { code: supplier.coupon.code, percentOff: supplier.coupon.percentOff } : null,
    rating:
      supplier.reviewRating !== null
        ? {
            value: supplier.reviewRating,
            reviewCountText: formatReviewCount(supplier.reviewCount),
            sourceName: reviewSourceName(supplier.reviewsUrl),
            url: supplier.reviewsUrl,
          }
        : null,
  };
}

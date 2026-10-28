import type { Supplier } from '@/lib/schema';
import { supplierGoPath } from '@/lib/go-links';

/** Bumped only on a breaking change to the shape below; the extension checks it before reading. */
export const EXTENSION_FEED_VERSION = 1;

/** The per-supplier columns the admin edits for the extension (0029_chrome_extension.sql). */
export interface SupplierExtensionSettings {
  slug: string;
  storeDomains: readonly string[];
  showInExtension: boolean;
  /** The supplier row's updated_at, so the feed can say when it last changed. */
  updatedAt: string;
}

export type ExtensionFeedSupplierSource = Pick<
  Supplier,
  'slug' | 'name' | 'logoUrl' | 'faviconUrl' | 'coupon' | 'reviewRating' | 'reviewCount' | 'isActive'
> & { reviewsUrl?: string | null };

export interface ExtensionFeedEntry {
  id: string;
  name: string;
  domains: string[];
  discount: string;
  code: string;
  offerUrl: string;
  profileUrl: string;
  logoUrl: string | null;
  trustpilot: { rating: number; reviews: number | null } | null;
}

/**
 * Public by design: everything here is already shown on /coupons and the
 * supplier pages. It is built field by field from an allow-list, never by
 * spreading a supplier record, so a private column added later can't leak.
 */
export interface ExtensionFeed {
  version: typeof EXTENSION_FEED_VERSION;
  updated: string | null;
  count: number;
  suppliers: ExtensionFeedEntry[];
}

/** The badge text /coupons shows on each card, so the extension reads exactly the same offer. */
export function couponDiscountText(percentOff: number): string {
  return `${percentOff}% Off Sitewide`;
}

export function extensionOfferPath(slug: string): string {
  return supplierGoPath(slug, 'extension');
}

function absoluteUrl(origin: string, url: string | null): string | null {
  if (!url) return null;
  if (/^https?:\/\//i.test(url)) return url;
  return url.startsWith('/') ? `${origin}${url}` : null;
}

/** A reviews link that points somewhere other than Trustpilot (PepReviewPro, say). */
function reviewsFromAnotherPlatform(url: string | null | undefined): boolean {
  if (!url) return false;
  try {
    return !/(^|\.)trustpilot\.com$/.test(new URL(url).hostname.replace(/^www\./, ''));
  } catch {
    return false;
  }
}

function trustpilotFor(supplier: ExtensionFeedSupplierSource): ExtensionFeedEntry['trustpilot'] {
  // The extension labels this score "Trustpilot", so a rating taken from
  // another review platform is left out rather than mislabelled.
  if (reviewsFromAnotherPlatform(supplier.reviewsUrl)) return null;
  const rating = supplier.reviewRating;
  if (rating === null || !Number.isFinite(rating) || rating < 0 || rating > 5) return null;
  // "50+" can't be written as a number without overstating it, so only an exact count is passed on.
  const reviews = supplier.reviewCount?.kind === 'exact' ? supplier.reviewCount.value : null;
  return { rating: Math.round(rating * 10) / 10, reviews };
}

function latest(dates: readonly string[]): string | null {
  const times = dates.map((date) => Date.parse(date)).filter((time) => !Number.isNaN(time));
  return times.length > 0 ? new Date(Math.max(...times)).toISOString() : null;
}

/**
 * Suppliers the extension shows: active, with a coupon code and percentage
 * (what /coupons lists), switched on for the extension, and with at least one
 * store domain to match against. Biggest discount first, then by name.
 */
export function buildExtensionFeed(
  suppliers: readonly ExtensionFeedSupplierSource[],
  settings: readonly SupplierExtensionSettings[],
  origin: string,
): ExtensionFeed {
  const settingsBySlug = new Map(settings.map((entry) => [entry.slug, entry]));

  const included = suppliers.flatMap((supplier) => {
    const entry = settingsBySlug.get(supplier.slug);
    const code = supplier.coupon?.code.trim() ?? '';
    if (!supplier.isActive || !supplier.coupon || !code || !entry?.showInExtension) return [];
    if (entry.storeDomains.length === 0) return [];
    return [{ supplier, coupon: supplier.coupon, code, entry }];
  });

  included.sort(
    (a, b) => b.coupon.percentOff - a.coupon.percentOff || a.supplier.name.localeCompare(b.supplier.name),
  );

  const entries = included.map(({ supplier, coupon, code, entry }) => ({
    id: supplier.slug,
    name: supplier.name,
    domains: [...entry.storeDomains],
    discount: couponDiscountText(coupon.percentOff),
    code,
    offerUrl: `${origin}${extensionOfferPath(supplier.slug)}`,
    profileUrl: `${origin}/suppliers/${supplier.slug}`,
    logoUrl: absoluteUrl(origin, supplier.logoUrl) ?? absoluteUrl(origin, supplier.faviconUrl),
    trustpilot: trustpilotFor(supplier),
  }));

  return {
    version: EXTENSION_FEED_VERSION,
    updated: latest(settings.map((entry) => entry.updatedAt)),
    count: entries.length,
    suppliers: entries,
  };
}

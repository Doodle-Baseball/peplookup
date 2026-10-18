/**
 * Placeholders for admin-written text (SEO titles and descriptions, FAQs,
 * supplier / review / coupon page copy), filled with live counts so a figure
 * written once can never drift from the directory as vendors come and go:
 *
 * - `{vendorCount}`: every supplier in the directory ("across 90 suppliers").
 * - `{otherVendorCount}`: all of them but the one a page is about
 *   ("vs. 89 other suppliers").
 *
 * Case and inner spaces are forgiven: `{ VendorCount }` works too.
 */
export const VENDOR_COUNT_TOKEN = '{vendorCount}';
export const OTHER_VENDOR_COUNT_TOKEN = '{otherVendorCount}';

const VENDOR_COUNT_PATTERN = /\{\s*vendor\s*count\s*\}/gi;
const OTHER_VENDOR_COUNT_PATTERN = /\{\s*other\s*vendor\s*count\s*\}/gi;

/** A string count is a stand-in (e.g. "all") for when the real number couldn't be read. */
export function fillVendorCount(text: string, vendorCount: number | string): string {
  const total = typeof vendorCount === 'number' ? vendorCount.toLocaleString('en-US') : vendorCount;
  const others = typeof vendorCount === 'number' ? Math.max(0, vendorCount - 1).toLocaleString('en-US') : vendorCount;
  return text.replace(OTHER_VENDOR_COUNT_PATTERN, others).replace(VENDOR_COUNT_PATTERN, total);
}

/** {@link fillVendorCount} applied to every string inside plain objects and arrays. */
export function fillVendorCountDeep<T>(value: T, vendorCount: number | string): T {
  return fillDeep(value, vendorCount) as T;
}

function fillDeep(value: unknown, vendorCount: number | string): unknown {
  if (typeof value === 'string') return fillVendorCount(value, vendorCount);
  if (Array.isArray(value)) return value.map((item) => fillDeep(item, vendorCount));
  if (value !== null && typeof value === 'object') {
    return Object.fromEntries(Object.entries(value).map(([key, item]) => [key, fillDeep(item, vendorCount)]));
  }
  return value;
}

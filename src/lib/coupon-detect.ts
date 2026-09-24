/**
 * Query parameters that carry a checkout coupon code. Deliberately narrow:
 * `ref`, `aff`, `afref` and the like are affiliate IDs (often numeric, e.g.
 * `?ref=74`), and reading one as a discount code would show a coupon the
 * vendor never offered.
 */
const COUPON_PARAMS = new Set([
  'code',
  'coupon',
  'coupon_code',
  'couponcode',
  'discount',
  'discount_code',
  'promo',
  'promo_code',
  'promocode',
]);

/**
 * The coupon code already embedded in a vendor's saved links, checked in the
 * order given (affiliate link first). Null when none of them carries one.
 */
export function couponCodeFromLinks(urls: readonly (string | null | undefined)[]): string | null {
  for (const raw of urls) {
    if (!raw) continue;
    let url: URL;
    try {
      url = new URL(raw);
    } catch {
      continue;
    }
    for (const [key, value] of url.searchParams) {
      const code = value.trim();
      if (code && COUPON_PARAMS.has(key.toLowerCase())) return code;
    }
  }
  return null;
}

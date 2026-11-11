/**
 * The site's five section roots changed from plural to singular. Each old root still answers with a
 * 301 to the new one (see middleware.ts), so an old link, bookmark or search result lands on the
 * right page.
 *
 *   /suppliers -> /supplier   /products -> /product   /coupons -> /coupon
 *   /reviews   -> /review     /guides   -> /guide
 *
 * No imports, so the Edge middleware can use it.
 */
export const SECTION_RENAMES: readonly (readonly [oldRoot: string, newRoot: string])[] = [
  ['/suppliers', '/supplier'],
  ['/products', '/product'],
  ['/coupons', '/coupon'],
  ['/reviews', '/review'],
  ['/guides', '/guide'],
];

/**
 * The new address of an old-style path ("/suppliers/amino-club" becomes "/supplier/amino-club"; the
 * bare "/guides" becomes "/guide"), or null when the path is not under one of the five old roots.
 * Anything after the root (the slug, a sub-path) is kept as it is.
 */
export function singularPath(path: string): string | null {
  for (const [oldRoot, newRoot] of SECTION_RENAMES) {
    if (path === oldRoot || path.startsWith(`${oldRoot}/`)) return `${newRoot}${path.slice(oldRoot.length)}`;
  }
  return null;
}

/** Where a supplier's profile page lives. */
export function supplierPath(slug: string): string {
  return `/supplier/${slug}`;
}

/**
 * Supplier review pages were folded into the supplier profile, so each old address answers with a
 * 301 to it: "/review/amino-club-reviews" (and the bare "/review/amino-club") become
 * "/supplier/amino-club". The /review index itself is not matched; it still lists every supplier.
 */
export function reviewPageRedirect(path: string): string | null {
  const match = /^\/review\/([^/]+?)(?:-reviews)?\/?$/.exec(path);
  return match ? supplierPath(match[1]!) : null;
}

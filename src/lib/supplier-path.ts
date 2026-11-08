/**
 * A one-page test: the American Peptides profile lives at /supplier/american-peptides
 * instead of /suppliers/american-peptides. Every other supplier stays under /suppliers/.
 *
 * The page is still one route, /suppliers/[slug]; next.config.mjs rewrites the new address to
 * it and redirects the old one. Everything the site keys by path (the saved SEO text, FAQs,
 * indexing decisions, renamed-slug redirects) keeps the /suppliers/<slug> path as its key, so
 * the page's content cannot change. Only the address people and search engines see does, and
 * that is converted here, where a link, canonical, sitemap entry or JSON-LD URL is written.
 *
 * No imports, so the Edge middleware can use it. next.config.mjs repeats the slug list because
 * it cannot import TypeScript; a test keeps the two in step.
 */
export const MOVED_SUPPLIER_SLUGS: ReadonlySet<string> = new Set(['american-peptides']);

const KEYED_PREFIX = '/suppliers/';
const MOVED_PREFIX = '/supplier/';

/** Where a supplier's profile page lives: the link every card, table and breadcrumb points to. */
export function supplierPath(slug: string): string {
  return MOVED_SUPPLIER_SLUGS.has(slug) ? `${MOVED_PREFIX}${slug}` : `${KEYED_PREFIX}${slug}`;
}

function swapPrefix(path: string, from: string, to: string, isMoved: (slug: string) => boolean): string {
  if (!path.startsWith(from)) return path;
  const rest = path.slice(from.length);
  const slug = rest.split(/[/?#]/)[0] ?? '';
  return isMoved(slug) ? `${to}${rest}` : path;
}

/** The address a page is served at, from the /suppliers/<slug> path the site keys it by. Other paths pass through. */
export function publicPath(path: string): string {
  return swapPrefix(path, KEYED_PREFIX, MOVED_PREFIX, (slug) => MOVED_SUPPLIER_SLUGS.has(slug));
}

/** The key a page is stored under, from the address it is served at. The reverse of publicPath. */
export function keyedPath(path: string): string {
  return swapPrefix(path, MOVED_PREFIX, KEYED_PREFIX, (slug) => MOVED_SUPPLIER_SLUGS.has(slug));
}

/** publicPath for a canonical that may be a path ("/suppliers/x") or a full URL on this site. */
export function publicCanonical(value: string): string {
  const absolute = value.match(/^(https?:\/\/[^/]+)(\/.*)$/);
  return absolute ? `${absolute[1]}${publicPath(absolute[2]!)}` : publicPath(value);
}

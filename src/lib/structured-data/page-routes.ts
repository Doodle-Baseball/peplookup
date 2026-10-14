/**
 * Which structured-data template a URL gets, decided from the path alone so a
 * route nobody has wired up yet still lands on a sensible type. Exact paths
 * win over section prefixes, and anything unmatched is DEFAULT.
 */
export type PageKind =
  | 'home'
  | 'collection'
  | 'compound'
  | 'supplier'
  | 'coupon'
  | 'review'
  | 'tool'
  | 'article'
  | 'about'
  | 'contact'
  | 'default';

export type WebPageType = 'WebPage' | 'CollectionPage' | 'ProfilePage' | 'AboutPage' | 'ContactPage';

/** Pages that never carry structured data: personal or redirect-only. */
const EXCLUDED_PATHS = new Set(['/watchlist', '/go']);

const EXACT_KINDS: Readonly<Record<string, PageKind>> = {
  '/': 'home',
  '/suppliers': 'collection',
  '/coupons': 'collection',
  '/reviews': 'collection',
  '/products': 'collection',
  '/lab-reports': 'collection',
  '/labs': 'collection',
  '/tools': 'collection',
  '/guides': 'collection',
  // An explainer, not a calculator, so it is an article despite living under /tools/.
  '/tools/coa-reader': 'article',
  '/about': 'about',
  '/contact': 'contact',
};

/** New routes under these sections inherit the section's type automatically. */
const PREFIX_KINDS: readonly (readonly [string, PageKind])[] = [
  ['/products/', 'compound'],
  ['/suppliers/', 'supplier'],
  ['/coupons/', 'coupon'],
  ['/reviews/', 'review'],
  ['/tools/', 'tool'],
  ['/guides/', 'article'],
  ['/blog/', 'article'],
];

const WEB_PAGE_TYPES: Readonly<Record<PageKind, WebPageType>> = {
  home: 'WebPage',
  collection: 'CollectionPage',
  compound: 'WebPage',
  supplier: 'ProfilePage',
  coupon: 'WebPage',
  review: 'WebPage',
  tool: 'WebPage',
  article: 'WebPage',
  about: 'AboutPage',
  contact: 'ContactPage',
  default: 'WebPage',
};

/**
 * The middle breadcrumb for pages inside a section. Compound pages sit under
 * the price checker, which is the site's index of compounds.
 */
const SECTIONS: readonly { prefix: string; name: string; path: string }[] = [
  { prefix: '/products/', name: 'Price Checker', path: '/price-checker' },
  { prefix: '/suppliers/', name: 'Suppliers', path: '/suppliers' },
  { prefix: '/coupons/', name: 'Coupons', path: '/coupons' },
  { prefix: '/reviews/', name: 'Reviews', path: '/reviews' },
  { prefix: '/tools/', name: 'Tools', path: '/tools' },
  { prefix: '/guides/', name: 'Guides', path: '/guides' },
];

/** Strips the query, hash and any trailing slash, so one page has one canonical path. */
export function cleanPath(path: string): string {
  const withoutSuffix = path.split(/[?#]/)[0] ?? '/';
  const trimmed = withoutSuffix.replace(/\/+$/, '');
  return trimmed === '' ? '/' : trimmed;
}

export function isSchemaExcluded(path: string): boolean {
  return EXCLUDED_PATHS.has(cleanPath(path));
}

export function pageKindForPath(path: string): PageKind {
  const clean = cleanPath(path);
  const exact = EXACT_KINDS[clean];
  if (exact) return exact;
  const prefixed = PREFIX_KINDS.find(([prefix]) => clean.startsWith(prefix));
  return prefixed ? prefixed[1] : 'default';
}

export function webPageTypeFor(kind: PageKind): WebPageType {
  return WEB_PAGE_TYPES[kind];
}

export interface BreadcrumbItem {
  name: string;
  /** Absent on the last crumb, which is the page itself. */
  path?: string;
}

/**
 * A heading such as "Supplier reviews." reads oddly as a breadcrumb, so a
 * single trailing full stop is dropped. Both the visible trail and the
 * BreadcrumbList use this same label.
 */
function crumbLabel(heading: string): string {
  return heading.trim().replace(/\.$/, '');
}

/** Home, then the section when the page is inside one, then the page. Empty on the homepage. */
export function breadcrumbTrail(path: string, heading: string): BreadcrumbItem[] {
  const clean = cleanPath(path);
  if (clean === '/') return [];
  const section = SECTIONS.find((candidate) => clean.startsWith(candidate.prefix));
  return [
    { name: 'Home', path: '/' },
    ...(section ? [{ name: section.name, path: section.path }] : []),
    { name: crumbLabel(heading) },
  ];
}

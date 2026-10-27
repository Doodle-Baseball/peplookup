import { site } from '@/config/site';
import {
  breadcrumbTrail,
  cleanPath,
  pageKindForPath,
  webPageTypeFor,
  type BreadcrumbItem,
  type PageKind,
} from '@/lib/structured-data/page-routes';

export const SITE_URL = `https://${site.domain}`;
const ORGANIZATION_ID = `${SITE_URL}/#organization`;
const WEBSITE_ID = `${SITE_URL}/#website`;

/** The public description used for the Organization node, distinct from the homepage meta description. */
const ORGANIZATION_DESCRIPTION =
  'Independent research peptide price comparison: cost per mg, coupons and published lab reports across suppliers.';

/** Admin country names (src/lib/countries.ts) to ISO 3166-1 alpha-2. Anything else is left out, never guessed. */
const COUNTRY_CODES: Readonly<Record<string, string>> = {
  'United States': 'US',
  Canada: 'CA',
  'United Kingdom': 'GB',
  Germany: 'DE',
  France: 'FR',
  Netherlands: 'NL',
  Ireland: 'IE',
  Switzerland: 'CH',
  Poland: 'PL',
  Spain: 'ES',
  Italy: 'IT',
  Sweden: 'SE',
  Australia: 'AU',
  'New Zealand': 'NZ',
  Singapore: 'SG',
  'Hong Kong': 'HK',
  Japan: 'JP',
  'South Korea': 'KR',
  India: 'IN',
  China: 'CN',
  'United Arab Emirates': 'AE',
  Israel: 'IL',
  'South Africa': 'ZA',
  Brazil: 'BR',
  Mexico: 'MX',
};

type JsonLdNode = Record<string, unknown>;

export interface JsonLdGraph {
  '@context': 'https://schema.org';
  '@graph': JsonLdNode[];
}

export function absoluteUrl(path: string): string {
  const clean = cleanPath(path);
  return clean === '/' ? `${SITE_URL}/` : `${SITE_URL}${clean}`;
}

export function supplierNodeId(slug: string): string {
  return `${absoluteUrl(`/suppliers/${slug}`)}#supplier`;
}

export interface SupplierSubject {
  slug: string;
  name: string;
  /** The supplier's own site, never our affiliate redirect. */
  homepageUrl: string;
  foundedYear: number | null;
  country: string | null;
}

export interface ItemListEntry {
  name: string;
  /** A site path ("/suppliers/x") or an absolute URL. */
  url: string;
}

/** Phase 2 compound pricing. Prices are integer cents, as everywhere else in the app. */
export interface ProductOfferSummary {
  name: string;
  description: string;
  lowPriceCents: number;
  highPriceCents: number;
  offerCount: number;
}

export interface PageGraphInput {
  path: string;
  /** Absolute canonical URL; defaults to the site URL plus the clean path. */
  canonicalUrl?: string;
  title: string;
  description: string;
  heading: string;
  /** Latest ISO date the page's own data changed, when one is known. */
  dateModified?: string | null;
  itemList?: readonly ItemListEntry[];
  supplier?: SupplierSubject;
  article?: { datePublished?: string | null; dateModified?: string | null; image?: string | null };
  /** A crumb between the section and the page, such as a guide's category. */
  subsection?: Required<BreadcrumbItem>;
  product?: ProductOfferSummary | null;
}

function organizationNode(): JsonLdNode {
  return {
    '@type': 'Organization',
    '@id': ORGANIZATION_ID,
    name: site.name,
    url: `${SITE_URL}/`,
    logo: { '@type': 'ImageObject', url: `${SITE_URL}/logo.png` },
    email: site.contactEmail,
    description: ORGANIZATION_DESCRIPTION,
    sameAs: [site.communityUrl],
  };
}

function websiteNode(): JsonLdNode {
  return {
    '@type': 'WebSite',
    '@id': WEBSITE_ID,
    name: site.name,
    url: `${SITE_URL}/`,
    publisher: { '@id': ORGANIZATION_ID },
  };
}

function breadcrumbNode(id: string, trail: readonly BreadcrumbItem[]): JsonLdNode {
  return {
    '@type': 'BreadcrumbList',
    '@id': id,
    itemListElement: trail.map((crumb, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: crumb.name,
      ...(crumb.path ? { item: absoluteUrl(crumb.path) } : {}),
    })),
  };
}

function itemListNode(id: string, items: readonly ItemListEntry[]): JsonLdNode {
  return {
    '@type': 'ItemList',
    '@id': id,
    numberOfItems: items.length,
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      url: item.url.startsWith('/') ? absoluteUrl(item.url) : item.url,
      name: item.name,
    })),
  };
}

/**
 * The supplier's own site root. Stored homepage URLs sometimes carry a
 * referral path (".../ref/peplookup/"), which is a tracking link, not the
 * homepage, so only the origin is kept.
 */
export function supplierHomepage(homepageUrl: string): string {
  try {
    return `${new URL(homepageUrl).origin}/`;
  } catch {
    // The schema validates homepageUrl as a URL, so this only guards bad legacy rows.
    return homepageUrl;
  }
}

export function supplierNode(supplier: SupplierSubject): JsonLdNode {
  const countryCode = supplier.country ? COUNTRY_CODES[supplier.country.trim()] : undefined;
  return {
    '@type': 'Organization',
    '@id': supplierNodeId(supplier.slug),
    name: supplier.name,
    url: supplierHomepage(supplier.homepageUrl),
    ...(supplier.foundedYear ? { foundingDate: String(supplier.foundedYear) } : {}),
    ...(countryCode ? { address: { '@type': 'PostalAddress', addressCountry: countryCode } } : {}),
  };
}

function webApplicationNode(canonical: string, input: PageGraphInput): JsonLdNode {
  return {
    '@type': 'WebApplication',
    '@id': `${canonical}#app`,
    name: input.heading,
    url: canonical,
    applicationCategory: 'UtilitiesApplication',
    operatingSystem: 'Any',
    description: input.description,
    offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
    publisher: { '@id': ORGANIZATION_ID },
  };
}

function articleNode(canonical: string, input: PageGraphInput): JsonLdNode {
  const datePublished = input.article?.datePublished ?? null;
  const dateModified = input.article?.dateModified ?? input.dateModified ?? null;
  return {
    '@type': 'Article',
    '@id': `${canonical}#article`,
    headline: input.heading,
    description: input.description,
    ...(input.article?.image ? { image: input.article.image } : {}),
    ...(datePublished ? { datePublished } : {}),
    ...(dateModified ? { dateModified } : {}),
    author: { '@id': ORGANIZATION_ID },
    publisher: { '@id': ORGANIZATION_ID },
    mainEntityOfPage: { '@id': `${canonical}#webpage` },
  };
}

function centsToPrice(cents: number): string {
  return (cents / 100).toFixed(2);
}

function productNode(canonical: string, product: ProductOfferSummary): JsonLdNode {
  return {
    '@type': 'Product',
    '@id': `${canonical}#product`,
    name: product.name,
    description: product.description,
    offers: {
      '@type': 'AggregateOffer',
      priceCurrency: 'USD',
      lowPrice: centsToPrice(product.lowPriceCents),
      highPrice: centsToPrice(product.highPriceCents),
      offerCount: product.offerCount,
    },
  };
}

/** An empty list says nothing, so a collection with no items gets no ItemList. */
function hasItems(input: PageGraphInput): input is PageGraphInput & { itemList: readonly ItemListEntry[] } {
  return (input.itemList?.length ?? 0) > 0;
}

/** What the page is primarily about, linked from its WebPage node. */
function pageSubject(kind: PageKind, canonical: string, input: PageGraphInput): JsonLdNode {
  if (kind === 'collection' && hasItems(input)) return { mainEntity: { '@id': `${canonical}#itemlist` } };
  if (kind === 'supplier' && input.supplier) return { mainEntity: { '@id': supplierNodeId(input.supplier.slug) } };
  if ((kind === 'coupon' || kind === 'review') && input.supplier) {
    return { about: { '@id': supplierNodeId(input.supplier.slug) } };
  }
  return {};
}

/**
 * The full @graph for one page: Organization, WebSite and the page itself on
 * every page, a BreadcrumbList everywhere but the homepage, and the nodes its
 * route type adds. Every value comes from the caller, which passes the same
 * data the page renders, so nothing here is invented or hard-coded per page.
 */
export function buildPageGraph(input: PageGraphInput): JsonLdGraph {
  const kind = pageKindForPath(input.path);
  const canonical = input.canonicalUrl ?? absoluteUrl(input.path);
  const trail = breadcrumbTrail(input.path, input.heading, input.subsection);
  const breadcrumbId = `${canonical}#breadcrumb`;

  const webPage: JsonLdNode = {
    '@type': webPageTypeFor(kind),
    '@id': `${canonical}#webpage`,
    url: canonical,
    name: input.title,
    description: input.description,
    isPartOf: { '@id': WEBSITE_ID },
    publisher: { '@id': ORGANIZATION_ID },
    ...(trail.length > 0 ? { breadcrumb: { '@id': breadcrumbId } } : {}),
    ...pageSubject(kind, canonical, input),
    ...(input.dateModified ? { dateModified: input.dateModified } : {}),
  };

  const graph: JsonLdNode[] = [organizationNode(), websiteNode(), webPage];
  if (trail.length > 0) graph.push(breadcrumbNode(breadcrumbId, trail));
  if (kind === 'collection' && hasItems(input)) graph.push(itemListNode(`${canonical}#itemlist`, input.itemList));
  if ((kind === 'supplier' || kind === 'coupon' || kind === 'review') && input.supplier) {
    graph.push(supplierNode(input.supplier));
  }
  if (kind === 'tool') graph.push(webApplicationNode(canonical, input));
  if (kind === 'article') graph.push(articleNode(canonical, input));
  // A Product with no offers is a Search Console error, so it needs at least one in-stock listing.
  if (kind === 'compound' && input.product && input.product.offerCount > 0) {
    graph.push(productNode(canonical, input.product));
  }

  return { '@context': 'https://schema.org', '@graph': graph };
}

/** The top-level node types in a graph. */
export function graphTypes(graph: JsonLdGraph): Set<string> {
  return new Set(graph['@graph'].map((node) => node['@type']).filter((type): type is string => typeof type === 'string'));
}

/**
 * Every top-level type the site itself can output on a path, used to drop a
 * hand-pasted copy from /admin/seo. FAQPage counts as owned everywhere: the
 * FAQ editor is its one source, so a pasted FAQPage would always be a second.
 */
export function ownedSchemaTypes(path: string, options: { productOffers: boolean }): Set<string> {
  const kind = pageKindForPath(path);
  const types = new Set(['Organization', 'WebSite', webPageTypeFor(kind), 'FAQPage']);
  if (cleanPath(path) !== '/') types.add('BreadcrumbList');
  if (kind === 'collection') types.add('ItemList');
  if (kind === 'tool') types.add('WebApplication');
  if (kind === 'article') types.add('Article');
  if (kind === 'compound' && options.productOffers) types.add('Product');
  return types;
}

/**
 * Serialised for a <script> tag. Supplier and compound names come from the
 * database, so "<" is escaped to stop a stray "</script>" ending the tag early.
 */
export function serializeGraph(graph: JsonLdGraph): string {
  return JSON.stringify(graph).replace(/</g, '\\u003c');
}

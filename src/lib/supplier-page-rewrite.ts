import { site } from '@/config/site';
import { ratingSourceLabel } from '@/lib/review-pages';
import type { Offer, Supplier } from '@/lib/schema';
import type { SupplierFacts } from '@/lib/supplier-facts';

/**
 * Supplier pages whose content and SEO text were rewritten by hand (a one-page test, starting
 * with American Peptides). Every number in the text comes from the live catalogue and supplier
 * record at render time; nothing is typed in. The page drops the words that belong to the
 * supplier's reviews page, the "Why researchers choose" section and the meta keywords.
 *
 * Kept apart from PROTECTED_SUPPLIERS: a protected page is never touched by content v2, and these
 * pages stay protected from it. This list only switches on the rewritten text.
 */
export const REWRITTEN_SUPPLIER_PAGES: ReadonlySet<string> = new Set(['american-peptides']);

export function isRewrittenSupplierPage(slug: string): boolean {
  return REWRITTEN_SUPPLIER_PAGES.has(slug);
}

export interface RewriteFacts {
  name: string;
  listingCount: number;
  compoundCount: number;
  /** Listings that link a certificate of analysis. */
  coaCount: number;
  inStockCount: number;
  foundedYear: number | null;
  coupon: { code: string; percentOff: number } | null;
  /** True when every listing shows the coupon price, i.e. none has its own sale price for the code to give way to. */
  couponOnEveryPrice: boolean;
  paymentMethods: readonly string[];
  rating: { value: number; source: string; url: string } | null;
  otherSupplierCount: number;
  /** Compounds with an in-stock price here that at least one other supplier also sells in stock. */
  comparableCount: number;
  /** Of those, how many this supplier is the cheapest (or tied cheapest) on. */
  cheapestCount: number;
}

export function rewriteFacts(
  supplier: Pick<Supplier, 'name' | 'coupon' | 'foundedYear' | 'paymentMethods' | 'reviewRating' | 'reviewsUrl'>,
  facts: SupplierFacts,
  ownOffers: readonly Pick<Offer, 'inStock' | 'salePrice'>[],
  activeSupplierCount: number,
): RewriteFacts {
  const comparable = facts.standings.filter((standing) => standing.supplierCount >= 2);
  return {
    name: supplier.name,
    listingCount: facts.listingCount,
    compoundCount: facts.compoundCount,
    coaCount: facts.coaListingCount,
    inStockCount: ownOffers.filter((offer) => offer.inStock).length,
    foundedYear: supplier.foundedYear,
    coupon: supplier.coupon ? { code: supplier.coupon.code, percentOff: supplier.coupon.percentOff } : null,
    couponOnEveryPrice: ownOffers.every((offer) => offer.salePrice === null),
    paymentMethods: supplier.paymentMethods,
    rating:
      supplier.reviewRating !== null && supplier.reviewsUrl
        ? { value: supplier.reviewRating, source: ratingSourceLabel(supplier.reviewsUrl), url: supplier.reviewsUrl }
        : null,
    otherSupplierCount: Math.max(0, activeSupplierCount - 1),
    comparableCount: comparable.length,
    cheapestCount: comparable.filter((standing) => standing.rank === 1).length,
  };
}

function count(value: number, singular: string, plural = `${singular}s`): string {
  return `${value} ${value === 1 ? singular : plural}`;
}

/** "American Peptides'" for a name ending in s, "Kylo's" otherwise. */
function possessive(name: string): string {
  return /s$/i.test(name) ? `${name}'` : `${name}'s`;
}

/** "an" before a name that starts with a vowel sound, by its first letter. */
function article(name: string): string {
  return /^[aeiou]/i.test(name) ? 'an' : 'a';
}

/** "a, b and c" */
export function joinList(items: readonly string[]): string {
  if (items.length <= 1) return items[0] ?? '';
  return `${items.slice(0, -1).join(', ')} and ${items[items.length - 1]}`;
}

export function rewriteSeoTitle(f: RewriteFacts): string {
  const parts = ['Prices', ...(f.coaCount > 0 ? ['COAs'] : []), ...(f.coupon ? ['Coupon Code'] : [])];
  const joined = parts.length > 1 ? `${parts.slice(0, -1).join(', ')} & ${parts[parts.length - 1]}` : parts[0]!;
  return `${f.name} ${joined} | ${site.name}`;
}

export function rewriteSeoDescription(f: RewriteFacts): string {
  const coas = f.coaCount > 0 ? `, with COAs on ${f.coaCount}` : '';
  const code = f.coupon ? ` and use code ${f.coupon.code} for ${f.coupon.percentOff}% off` : '';
  return `${f.name} lists ${count(f.listingCount, 'product')} across ${count(f.compoundCount, 'compound')}${coas}. Compare prices per mg${code}.`;
}

/** The short description under the H1. */
export function rewriteSummary(f: RewriteFacts): string {
  const clauses = [
    `It lists ${count(f.compoundCount, 'compound')}`,
    ...(f.coaCount > 0 ? [`links a lab report (COA) on ${f.coaCount} of its ${count(f.listingCount, 'product')}`] : []),
    ...(f.coupon ? [`has a ${f.coupon.percentOff}% discount code`] : []),
  ];
  const joined = clauses.length > 1 ? `${clauses.slice(0, -1).join(', ')}, and ${clauses[clauses.length - 1]}` : clauses[0]!;
  return `${f.name} is a U.S. research peptide supplier. ${joined}.`;
}

/** "About {name}": one paragraph per entry. */
export function rewriteAbout(f: RewriteFacts): string[] {
  const opening = [
    `${f.name} is a research peptide supplier based in the United States.`,
    ...(f.foundedYear !== null ? [`It started selling in ${f.foundedYear}.`] : []),
    `We track ${f.listingCount} of its products across ${count(f.compoundCount, 'compound')}, and ${f.inStockCount} ${f.inStockCount === 1 ? 'is' : 'are'} in stock right now.`,
  ].join(' ');
  const couponNote = f.coupon
    ? f.couponOnEveryPrice
      ? ` The prices on this page already include the ${f.coupon.percentOff}% code.`
      : ` Prices without a sale of their own already include the ${f.coupon.percentOff}% code.`
    : '';
  const pricing =
    `We take every price straight from ${possessive(f.name)} own product pages and convert it to cost per milligram. ` +
    'That way a single vial and a multi-vial kit can be compared fairly, and also compared with every other supplier we list.' +
    couponNote;
  const coas =
    f.coaCount > 0
      ? `${f.coaCount} of the ${f.listingCount} products link to a certificate of analysis (COA). You can open each one from the product listing. ` +
        'A COA covers one batch only, so always check that the lot number matches what you receive.'
      : null;
  const ordering = `${site.name} does not sell these products. Every order is placed on ${possessive(f.name)} own website, for laboratory research use only.`;
  return [opening, pricing, ...(coas ? [coas] : []), ordering];
}

export interface GlanceRow {
  label: string;
  value: string;
  href?: string;
}

/** "At a glance": a row is left out when its fact isn't held, never shown as zero or a dash. */
export function rewriteGlance(f: RewriteFacts): GlanceRow[] {
  return [
    { label: 'Products tracked', value: String(f.listingCount) },
    { label: 'Compounds', value: String(f.compoundCount) },
    { label: 'In stock now', value: String(f.inStockCount) },
    ...(f.coaCount > 0 ? [{ label: 'COAs linked', value: `${f.coaCount} of ${f.listingCount}` }] : []),
    ...(f.coupon ? [{ label: 'Discount code', value: `${f.coupon.code} (${f.coupon.percentOff}% off)` }] : []),
    ...(f.paymentMethods.length > 0 ? [{ label: 'Payment methods', value: joinList(f.paymentMethods) }] : []),
    ...(f.rating ? [{ label: 'Public rating', value: `${f.rating.value.toFixed(1)}/5 on ${f.rating.source}`, href: f.rating.url }] : []),
  ];
}

/** The text above the price table. Plain about how rarely the supplier is cheapest, when it rarely is. */
export function rewriteComparisonIntro(f: RewriteFacts): string {
  const result =
    f.cheapestCount === 0
      ? `They did not have the lowest cost per mg on any of the ${count(f.comparableCount, 'compound')} we could compare.`
      : `They had the lowest cost per mg on ${f.cheapestCount} of ${count(f.comparableCount, 'compound')}.`;
  return (
    `We compared ${f.name} with the ${count(f.otherSupplierCount, 'other supplier')} we track. ${result} ` +
    'Where they are not the cheapest, the table shows how far off they are. ' +
    "Ranks use each supplier's listed price before any coupon code, and out-of-stock listings are left out before ranking. " +
    'Every listing on this page shows the date we last saw its price.'
  );
}

export function rewriteCouponText(f: RewriteFacts): string | null {
  if (!f.coupon) return null;
  return (
    `Use code ${f.coupon.code} at checkout for ${f.coupon.percentOff}% off. You must enter it at ${possessive(f.name)} checkout; ` +
    'it is not applied automatically. Codes are set by the supplier and can change or expire.'
  );
}

/** At most four questions, each answered with a fact we hold; a question whose fact is missing is left out. */
export function rewriteFaqs(f: RewriteFacts): { question: string; answer: string }[] {
  return [
    ...(f.coaCount > 0
      ? [
          {
            question: `Does ${f.name} publish COAs?`,
            answer:
              `Yes, for ${f.coaCount} of its ${count(f.listingCount, 'product')}. Each COA is linked on the product listing. ` +
              'A COA covers one batch, so check the lot number matches your order.',
          },
        ]
      : []),
    ...(f.coupon
      ? [
          {
            question: `Is there ${article(f.name)} ${f.name} coupon code?`,
            answer:
              `Yes. Use ${f.coupon.code} for ${f.coupon.percentOff}% off at their checkout. ` +
              'We show prices with the code already applied. Codes can expire, so check it at checkout.',
          },
        ]
      : []),
    ...(f.paymentMethods.length > 0
      ? [
          {
            question: `What payment methods does ${f.name} accept?`,
            answer: `${joinList(f.paymentMethods)}. Payment happens on ${possessive(f.name)} own site. ${site.name} never handles payments.`,
          },
        ]
      : []),
    {
      question: `Does ${site.name} sell ${f.name} products?`,
      answer:
        `No. We only compare publicly listed prices. You order directly from ${f.name}, under their terms, ` +
        'and questions about shipping or orders go to them.',
    },
  ].slice(0, 4);
}

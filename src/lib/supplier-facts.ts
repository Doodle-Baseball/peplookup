import { couponAdjustedPrice, effectivePrice, hasDiscount, mcg, pricePerMg, pricePerMgFor, type Listing } from '@/lib/price';
import { cents, formatPerMg, type Cents, type Currency } from '@/lib/money';
import type { Offer, Product, Supplier } from '@/lib/schema';

/**
 * Facts that are true only for one supplier, built from the catalogue we
 * hold (content v2): how much it lists, how its prices rank against every
 * other active supplier on the same compound, and its code. Pure, so the
 * pages, the tests and the similarity check all use the same numbers.
 *
 * Ranks compare in-stock listings only, in the same currency, by the price
 * the listing itself shows (its sale price when it has one): a coupon is a
 * rule, not a recorded price, so it never changes a rank except in the
 * coupon table, which says so in its heading.
 */

export interface CompoundStanding {
  productSlug: string;
  productName: string;
  currency: Currency;
  /** Cents per mg of this supplier's cheapest in-stock listing. */
  ownPerMg: number;
  ownListingCount: number;
  /** 1 is the cheapest; suppliers on the same price share a rank. */
  rank: number;
  supplierCount: number;
  cheapest: { supplierName: string; perMg: number };
  medianPerMg: number;
}

export interface SupplierFacts {
  name: string;
  listingCount: number;
  compoundCount: number;
  /** Listings that link a certificate of analysis. */
  coaListingCount: number;
  /** Every compound with an in-stock price, the supplier's main ones (most listings) first. */
  standings: CompoundStanding[];
  /** The three best ranks among compounds at least two suppliers sell. */
  bestRanks: CompoundStanding[];
  coupon: { code: string; percentOff: number; verifiedAt: string | null } | null;
  foundedYear: number | null;
  country: string | null;
  paymentMethods: readonly string[];
  /** The lab named on the supplier's record as the one behind its COAs. */
  coaLabName: string | null;
}

type SupplierRecord = Pick<
  Supplier,
  'slug' | 'name' | 'coupon' | 'couponVerifiedAt' | 'foundedYear' | 'country' | 'paymentMethods' | 'coaLabName'
>;

function toListing(offer: Offer): Listing {
  return {
    supplierSlug: offer.supplierSlug,
    productSlug: offer.productSlug,
    listPrice: cents(offer.listPrice),
    salePrice: offer.salePrice === null ? null : cents(offer.salePrice),
    currency: offer.currency,
    vialSize: mcg(offer.vialSize),
    vialCount: offer.vialCount,
    inStock: offer.inStock,
    scrapedAt: offer.scrapedAt,
    url: offer.productUrl,
  };
}

function median(values: readonly number[]): number {
  const sorted = [...values].sort((a, b) => a - b);
  const middle = Math.floor(sorted.length / 2);
  return sorted.length % 2 === 1 ? sorted[middle]! : (sorted[middle - 1]! + sorted[middle]!) / 2;
}

/** Each supplier's best in-stock cost per mg for one compound and currency. */
function bestPerSupplier(offers: readonly Offer[]): Map<string, number> {
  const best = new Map<string, number>();
  for (const offer of offers) {
    if (!offer.inStock) continue;
    const perMg = pricePerMg(toListing(offer));
    if (perMg === null) continue;
    const current = best.get(offer.supplierSlug);
    if (current === undefined || perMg < current) best.set(offer.supplierSlug, perMg);
  }
  return best;
}

export function computeSupplierFacts(
  supplier: SupplierRecord,
  activeSuppliers: readonly Pick<Supplier, 'slug' | 'name'>[],
  offers: readonly Offer[],
  products: readonly Pick<Product, 'slug' | 'name'>[],
): SupplierFacts {
  const productName = new Map(products.map((product) => [product.slug, product.name]));
  const supplierName = new Map(activeSuppliers.map((entry) => [entry.slug, entry.name]));
  supplierName.set(supplier.slug, supplier.name);
  const competing = new Set([...activeSuppliers.map((entry) => entry.slug), supplier.slug]);
  const known = offers.filter((offer) => productName.has(offer.productSlug) && competing.has(offer.supplierSlug));
  const own = known.filter((offer) => offer.supplierSlug === supplier.slug);

  const standings: CompoundStanding[] = [];
  for (const productSlug of new Set(own.map((offer) => offer.productSlug))) {
    const ownForProduct = own.filter((offer) => offer.productSlug === productSlug);
    // Ranked within the currency the supplier prices this compound in; never across currencies.
    const currency = ownForProduct.find((offer) => offer.inStock)?.currency ?? ownForProduct[0]!.currency;
    const best = bestPerSupplier(known.filter((offer) => offer.productSlug === productSlug && offer.currency === currency));
    const ownPerMg = best.get(supplier.slug);
    if (ownPerMg === undefined) continue;
    const [cheapestSlug, cheapestPerMg] = [...best].sort((a, b) => a[1] - b[1] || a[0].localeCompare(b[0]))[0]!;
    standings.push({
      productSlug,
      productName: productName.get(productSlug)!,
      currency,
      ownPerMg,
      ownListingCount: ownForProduct.length,
      rank: 1 + [...best.values()].filter((perMg) => perMg < ownPerMg).length,
      supplierCount: best.size,
      cheapest: { supplierName: supplierName.get(cheapestSlug) ?? cheapestSlug, perMg: cheapestPerMg },
      medianPerMg: median([...best.values()]),
    });
  }
  standings.sort(
    (a, b) =>
      b.ownListingCount - a.ownListingCount || b.supplierCount - a.supplierCount || a.productName.localeCompare(b.productName),
  );

  const bestRanks = standings
    .filter((standing) => standing.supplierCount >= 2)
    .sort((a, b) => a.rank - b.rank || b.supplierCount - a.supplierCount || a.productName.localeCompare(b.productName))
    .slice(0, 3);

  return {
    name: supplier.name,
    listingCount: own.length,
    compoundCount: new Set(own.map((offer) => offer.productSlug)).size,
    coaListingCount: own.filter((offer) => offer.labReport !== null || Boolean(offer.coaUrl)).length,
    standings,
    bestRanks,
    coupon: supplier.coupon
      ? { code: supplier.coupon.code, percentOff: supplier.coupon.percentOff, verifiedAt: supplier.couponVerifiedAt ?? null }
      : null,
    foundedYear: supplier.foundedYear,
    country: supplier.country,
    paymentMethods: supplier.paymentMethods,
    coaLabName: supplier.coaLabName,
  };
}

export function ordinal(rank: number): string {
  const tens = rank % 100;
  if (tens >= 11 && tens <= 13) return `${rank}th`;
  return `${rank}${{ 1: 'st', 2: 'nd', 3: 'rd' }[rank % 10] ?? 'th'}`;
}

function plural(count: number, singular: string, pluralForm = `${singular}s`): string {
  return `${count} ${count === 1 ? singular : pluralForm}`;
}

function listPhrase(items: readonly string[]): string {
  if (items.length <= 1) return items[0] ?? '';
  return `${items.slice(0, -1).join(', ')} and ${items[items.length - 1]}`;
}

/** "November 4, 2026" from a YYYY-MM-DD date. */
function longDate(date: string): string | null {
  const parsed = new Date(date.length === 10 ? `${date}T00:00:00Z` : date);
  if (Number.isNaN(parsed.getTime())) return null;
  return new Intl.DateTimeFormat('en-US', { month: 'long', day: 'numeric', year: 'numeric', timeZone: 'UTC' }).format(parsed);
}

/**
 * The "at a glance" paragraph, one sentence per fact we hold. A sentence
 * whose fact is missing (or zero) is left out rather than filled in.
 */
export function supplierSummary(facts: SupplierFacts): string {
  const sentences: string[] = [];
  if (facts.listingCount > 0) {
    // Its largest ranges by number of listings, so two suppliers with the same counts still read differently.
    const ranges = facts.standings
      .filter((standing) => standing.ownListingCount > 1)
      .slice(0, 2)
      .map((standing) => `${standing.ownListingCount} of ${standing.productName}`);
    sentences.push(
      `${facts.name} lists ${plural(facts.listingCount, 'product')} across ${plural(facts.compoundCount, 'compound')}${
        ranges.length > 0 ? `, including ${listPhrase(ranges)}` : ''
      }.`,
    );
  }
  if (facts.bestRanks.length > 0) {
    const parts = facts.bestRanks.map((standing, index) => {
      const place = standing.rank === 1 ? 'the cheapest' : `${ordinal(standing.rank)}${index === 0 ? ' cheapest' : ''}`;
      const field = index === 0 ? `${standing.supplierCount} suppliers per mg` : `${standing.supplierCount}`;
      return `${place} of ${field} for ${standing.productName} at ${formatPerMg(standing.ownPerMg, standing.currency)}`;
    });
    sentences.push(`It is ${listPhrase(parts)}.`);
  }
  if (facts.coaListingCount > 0) {
    // Named only when the record holds a lab's name, not a description such as "Third-party laboratory".
    const labName = facts.coaLabName?.trim() ?? '';
    const lab = labName && !GENERIC_LAB.test(labName) ? ` from ${labName}` : '';
    sentences.push(
      facts.coaListingCount === facts.listingCount && facts.listingCount > 1
        ? `All ${facts.listingCount} listings have a published COA${lab}.`
        : `${facts.coaListingCount} of ${plural(facts.listingCount, 'listing')} ${facts.coaListingCount === 1 ? 'has' : 'have'} a published COA${lab}.`,
    );
  }
  // Saved as typed, so a method can end in its own full stop; it is dropped before the sentence's.
  const payments = facts.paymentMethods.map((method) => method.trim().replace(/[.;,]+$/, '')).filter(Boolean);
  if (payments.length > 0) sentences.push(`It takes ${listPhrase(payments)}.`);
  if (facts.coupon) {
    const tested = facts.coupon.verifiedAt ? longDate(facts.coupon.verifiedAt) : null;
    sentences.push(`Code ${facts.coupon.code} gives ${facts.coupon.percentOff}% off${tested ? ` (last tested ${tested})` : ''}.`);
  }
  const country = facts.country ? countryPhrase(facts.country) : null;
  if (facts.foundedYear && country) sentences.push(`Founded in ${facts.foundedYear}, it operates from ${country}.`);
  else if (facts.foundedYear) sentences.push(`It was founded in ${facts.foundedYear}.`);
  else if (country) sentences.push(`It operates from ${country}.`);
  return sentences.join(' ');
}

const GENERIC_LAB = /^(?:an?\s+)?(?:third[- ]party|independent|accredited|in[- ]house|external)\b/i;

/** "the United States", "Canada": the article that country names written as a plural or a union take. */
function countryPhrase(country: string): string {
  const name = country.trim();
  return /^(?:United|Netherlands|Philippines|Czech Republic|Bahamas)\b/i.test(name) ? `the ${name}` : name;
}

export interface CouponPriceRow {
  productName: string;
  /** "10 mg" or "5 mg × 10". */
  size: string;
  currency: Currency;
  price: Cents;
  priceAfterCode: Cents;
  perMgAfterCode: number;
  /** Rank of the after-code cost per mg against every other supplier's listed price. */
  rank: number;
  supplierCount: number;
}

function sizeOf(offer: Offer): string {
  const mg = offer.vialSize / 1000;
  return offer.vialCount > 1 ? `${mg} mg × ${offer.vialCount}` : `${mg} mg`;
}

/**
 * "Prices after the code": for up to `limit` of the supplier's main
 * compounds, its cheapest in-stock listing with no sale price of its own (a
 * code applies to the list price, as on the rest of the site), the price
 * after the code, and where that lands against every other supplier.
 */
export function couponPriceRows(
  facts: SupplierFacts,
  supplierSlug: string,
  offers: readonly Offer[],
  activeSupplierSlugs: ReadonlySet<string>,
  limit = 5,
): CouponPriceRow[] {
  if (!facts.coupon) return [];
  const { percentOff } = facts.coupon;
  const rows: CouponPriceRow[] = [];
  for (const standing of facts.standings) {
    if (rows.length >= limit) break;
    const candidates = offers
      .filter(
        (offer) =>
          offer.supplierSlug === supplierSlug &&
          offer.productSlug === standing.productSlug &&
          offer.currency === standing.currency &&
          offer.inStock &&
          !hasDiscount(toListing(offer)),
      )
      .map((offer) => {
        const listing = toListing(offer);
        const price = effectivePrice(listing);
        const priceAfterCode = couponAdjustedPrice(price, percentOff);
        return { offer, price, priceAfterCode, perMgAfterCode: pricePerMgFor(priceAfterCode, listing) };
      })
      .filter((row): row is typeof row & { perMgAfterCode: number } => row.perMgAfterCode !== null)
      .sort((a, b) => a.perMgAfterCode - b.perMgAfterCode);
    const pick = candidates[0];
    if (!pick) continue;
    const others = bestPerSupplier(
      offers.filter(
        (offer) =>
          offer.productSlug === standing.productSlug &&
          offer.currency === standing.currency &&
          offer.supplierSlug !== supplierSlug &&
          activeSupplierSlugs.has(offer.supplierSlug),
      ),
    );
    rows.push({
      productName: standing.productName,
      size: sizeOf(pick.offer),
      currency: standing.currency,
      price: pick.price,
      priceAfterCode: pick.priceAfterCode,
      perMgAfterCode: pick.perMgAfterCode,
      rank: 1 + [...others.values()].filter((perMg) => perMg < pick.perMgAfterCode).length,
      supplierCount: others.size + 1,
    });
  }
  return rows;
}

/**
 * Content v2 FAQ order: answers that state one of this supplier's own facts
 * (a number, date, code, place, payment or shipping method, lab) first, at
 * most four, and the rest hidden. Nothing is deleted; this only picks.
 */
export function supplierSpecificFaqs<T extends { answer: string }>(
  faqs: readonly T[],
  supplier: Pick<Supplier, 'country' | 'paymentMethods' | 'coaLabName' | 'coupon'>,
  limit = 4,
): T[] {
  const escape = (term: string) => term.trim().replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const terms = [supplier.country, supplier.coaLabName, ...supplier.paymentMethods, 'FedEx', 'USPS', 'UPS', 'DHL']
    .filter((term): term is string => Boolean(term && term.trim()))
    .map((term) => new RegExp(`\\b${escape(term)}\\b`, 'i'));
  // The code is matched exactly: most codes are "PEPLOOKUP", which every mention of the site's name would match otherwise.
  const code = supplier.coupon?.code.trim() ? new RegExp(`\\b${escape(supplier.coupon.code)}\\b`) : null;
  const specific = (answer: string) =>
    /\d/.test(answer) || (code !== null && code.test(answer)) || terms.some((term) => term.test(answer));
  return faqs.filter((faq) => specific(faq.answer)).slice(0, limit);
}

/** The "PepLookup is a comparison tool" answer, which content v2 moves to the bottom of the page instead of the FAQ. */
export function isComparisonToolAnswer(answer: string): boolean {
  return /is a comparison tool/i.test(answer);
}

const SITE_SUFFIX = ' | PepLookup';
const MAX_TITLE_CHARACTERS = 60;
/** Stands in for a removed phrase while the joiners around it are tidied. */
const GAP = '⁣';

/**
 * A supplier page title without "Review(s)", "Coupon" or "Discount", so it
 * stops competing with the supplier's reviews and coupon pages. A coupon or
 * discount phrase goes as a whole ("and 10% Coupon Code", "Coupon Code
 * PEPLOOKUP", "15% Off"), the joiners left behind are tidied, and every other
 * word is kept. " | PepLookup" is added when it fits in 60 characters.
 * Returns the title unchanged when none of the words is in it.
 */
export function supplierTitleWithoutCompetingWords(title: string): string {
  if (!/\b(reviews?|coupons?|discounts?)\b/i.test(title)) return title;
  const removed = title
    .replace(/\s+Reviews?\b/gi, '')
    .replace(
      /\s*(?:,|&|\+|\band\b|\bwith\b)?\s*(?:\d+%\s*(?:Off\s*)?)?\b(?:Coupons?|Discounts?)\b(?:\s+Codes?)?(?:\s+[A-Z0-9]{4,}\b)?/g,
      ` ${GAP}`,
    )
    .replace(/\s*(?:,|&|\+|\band\b)?\s*\d+%\s*Off\b(?:\s+Codes?)?/gi, ` ${GAP}`);
  let tidy = removed
    // A phrase removed straight after the name ("Eon Peptides Coupon Code X + Prices") leaves a joiner: it becomes ": ".
    .replace(new RegExp(`\\s*${GAP}\\s*[+&,]\\s*`, 'g'), (_match, offset: number) =>
      removed.slice(0, offset).includes(':') ? ' ' : ': ',
    )
    .replace(new RegExp(`\\s*${GAP}`, 'g'), '')
    .replace(/:\s*[+&,]\s*/g, ': ')
    .replace(/\s+([,:])/g, '$1')
    .replace(/\s*\|\s*/g, ' | ')
    .replace(/\(\s*\)/g, '')
    .replace(/[\s,&+:]+$/g, '')
    .replace(/\s{2,}/g, ' ')
    .trim();
  if (!tidy.includes('|') && [...`${tidy}${SITE_SUFFIX}`].length <= MAX_TITLE_CHARACTERS) tidy += SITE_SUFFIX;
  return tidy;
}

import type { Metadata } from 'next';
import { site } from '@/config/site';
import { couponPagePath } from '@/lib/coupon-pages';
import { ratingSourceLabel, reviewsPagePath } from '@/lib/review-pages';
import { characterCount } from '@/lib/seo-status';
import { formatReviewCount } from '@/lib/format';
import type { ReviewCount } from '@/lib/schema';

/**
 * The SEO a page has before anyone edits it in /admin/seo. Pages build their
 * metadata from these, and the dashboard shows the same values as each card's
 * starting point, so the two can never drift apart.
 */
export interface SeoDefaults {
  path: string;
  title: string;
  description: string;
  h1: string;
  /** Only the generated coupon and review pages carry default keywords. */
  keywords?: readonly string[];
}

export function pageMetadata(defaults: SeoDefaults): Metadata {
  return {
    // Absolute: the stored title is already the full string shown in search results.
    title: { absolute: defaults.title },
    description: defaults.description,
    ...(defaults.keywords?.length ? { keywords: [...defaults.keywords] } : {}),
    alternates: { canonical: defaults.path },
  };
}

/** Search results cut titles and descriptions off past these lengths, so the generated ones stay within them. */
const MAX_TITLE_CHARACTERS = 60;
const MAX_DESCRIPTION_CHARACTERS = 160;
/** A description shorter than this reads as thin in a search result, so a closing sentence is added. */
const MIN_DESCRIPTION_CHARACTERS = 70;

/**
 * The first candidate that fits, so a long supplier name falls back to a
 * shorter wording instead of being cut off mid-word. When none fits (a name
 * longer than any wording can carry) the shortest one is used as it is.
 */
function firstWithin(max: number, candidates: readonly string[]): string {
  return candidates.find((candidate) => characterCount(candidate) <= max) ?? candidates[candidates.length - 1]!;
}

/** Tops a short description up past the minimum with a plain closing sentence. */
function atLeastMinimum(description: string, closing: string): string {
  return characterCount(description) >= MIN_DESCRIPTION_CHARACTERS ? description : `${description} ${closing}`;
}

/** "November 2026" from a YYYY-MM-DD date, or null when it can't be read. */
function monthYear(date: string | null | undefined): string | null {
  if (!date) return null;
  const parsed = new Date(date.length === 10 ? `${date}T00:00:00Z` : date);
  if (Number.isNaN(parsed.getTime())) return null;
  return new Intl.DateTimeFormat('en-US', { month: 'long', year: 'numeric', timeZone: 'UTC' }).format(parsed);
}

/** Distinct keywords only, so two templates that land on the same phrase never repeat it. */
function distinctKeywords(keywords: readonly string[]): string[] {
  return [...new Set(keywords.map((keyword) => keyword.trim()).filter(Boolean))];
}

export function compoundSeoDefaults(compound: { slug: string; name: string }): SeoDefaults {
  return {
    path: `/product/${compound.slug}`,
    title: `${compound.name} | Compare Prices, Suppliers & COA | ${site.name}`,
    description: `Compare ${compound.name} prices per mg across verified suppliers, with stock status, shipping and lab-verification data.`,
    h1: compound.name,
  };
}

/** What the supplier template can state about a supplier without inventing it. */
export interface SupplierSeoFacts {
  /** Distinct products listed with a price. */
  productCount: number;
  /** COA documents we link for this supplier. */
  coaCount: number;
}

export function supplierSeoDefaults(
  supplier: { slug: string; name: string; coupon?: { code: string } | null },
  facts: SupplierSeoFacts = { productCount: 0, coaCount: 0 },
): SeoDefaults {
  const { name } = supplier;
  const hasCoupon = Boolean(supplier.coupon);
  const hasCoas = facts.coaCount > 0;
  // Each part of the template is only claimed when the supplier has it.
  const titleParts = ['Prices per mg', ...(hasCoas ? ['COAs'] : []), ...(hasCoupon ? ['Coupon'] : [])];
  const joined = titleParts.length > 1 ? `${titleParts.slice(0, -1).join(', ')} & ${titleParts.at(-1)}` : titleParts[0]!;
  const across = facts.productCount > 0 ? ` across ${facts.productCount} ${facts.productCount === 1 ? 'product' : 'products'}` : '';
  const clauses = [
    `Compare ${name} prices per mg${across}`,
    ...(hasCoas ? ['see published COAs'] : []),
    ...(hasCoupon ? [`get the latest ${name} coupon code`] : []),
  ];
  const sentence = clauses.length > 1 ? `${clauses.slice(0, -1).join(', ')} and ${clauses.at(-1)}.` : `${clauses[0]}.`;
  return {
    path: `/supplier/${supplier.slug}`,
    title: firstWithin(MAX_TITLE_CHARACTERS, [
      `${name}: ${joined} | ${site.name}`,
      `${name}: Prices per mg${hasCoas ? ' & COAs' : ''} | ${site.name}`,
      `${name} Prices per mg | ${site.name}`,
      `${name} | ${site.name}`,
    ]),
    description: firstWithin(MAX_DESCRIPTION_CHARACTERS, [
      atLeastMinimum(sentence, `Prices are read from ${name}'s own product pages.`),
      atLeastMinimum(`Compare ${name} prices per mg${across}.`, "Prices are read from the supplier's own pages."),
    ]),
    h1: supplier.name,
  };
}

export function guideSeoDefaults(guide: { slug: string; title: string; excerpt: string; seoTitle?: string }): SeoDefaults {
  return {
    path: `/guide/${guide.slug}`,
    // The guide's H1 is written as its search title already, e.g. "… Sizes, Price & Facts (2026)",
    // unless the guide gives a separate search title.
    title: guide.seoTitle ?? guide.title,
    description: guide.excerpt,
    h1: guide.title,
  };
}

export function couponPageSeoDefaults(
  supplier: { slug: string; name: string; couponVerifiedAt?: string | null },
  coupon: { percentOff: number; code?: string } | null,
): SeoDefaults {
  const { name } = supplier;
  const path = couponPagePath(supplier.slug);
  if (!coupon) {
    return {
      path,
      title: `${name} Coupon Code & Discounts`,
      description: atLeastMinimum(
        `${name} coupon codes and discounts listed on ${site.name}, with how to apply them at checkout.`,
        `Codes are set by ${name} and can change.`,
      ),
      h1: `${name} Coupon Code`,
      keywords: distinctKeywords([`${name} coupon code`, `${name} discount code`]),
    };
  }
  const { percentOff } = coupon;
  // The month is when the code was last tested; an untested code gets no date, so the title never implies a check.
  const tested = monthYear(supplier.couponVerifiedAt);
  const withCode = coupon.code ? ` with code ${coupon.code}` : '';
  return {
    path,
    title: firstWithin(MAX_TITLE_CHARACTERS, [
      ...(tested ? [`${name} Coupon Code: ${percentOff}% Off (${tested})`] : []),
      `${name} Coupon Code: ${percentOff}% Off`,
      `${name} Coupon Code`,
    ]),
    description: firstWithin(MAX_DESCRIPTION_CHARACTERS, [
      tested
        ? `${percentOff}% off at ${name}${withCode}. How to apply it, exclusions, and when it was last tested.`
        : `${percentOff}% off at ${name}${withCode}. How to apply it at checkout, exclusions and stacking rules.`,
      `${percentOff}% off at ${name}${withCode}. How to apply it and what it excludes.`,
      `${percentOff}% off at ${name}. How to apply the code at checkout.`,
    ]),
    h1: `${name} Coupon Code`,
    keywords: distinctKeywords([`${name} coupon code`, `${name} discount code`]),
  };
}

export function reviewsPageSeoDefaults(supplier: {
  slug: string;
  name: string;
  reviewRating?: number | null;
  reviewCount?: ReviewCount | null;
  reviewsUrl?: string | null;
}): SeoDefaults {
  const { name } = supplier;
  const rating = supplier.reviewRating ?? null;
  const source = ratingSourceLabel(supplier.reviewsUrl ?? null);
  const count = formatReviewCount(supplier.reviewCount ?? null);
  return {
    path: reviewsPagePath(supplier.slug),
    // A supplier with no rating gets no number anywhere, not even a default.
    title: firstWithin(
      MAX_TITLE_CHARACTERS,
      rating !== null
        ? [`${name} Reviews: ${source} Rating & Summary`, `${name} Reviews: ${source} Rating`, `${name} Reviews`]
        : [`${name} Reviews & Customer Feedback`, `${name} Reviews`],
    ),
    description: firstWithin(
      MAX_DESCRIPTION_CHARACTERS,
      rating !== null
        ? [
            `${name} has a ${source} rating of ${rating.toFixed(1)}/5${count ? ` from ${count} reviews` : ''}. Read our summary of what customers say.`,
            `${name} has a ${source} rating of ${rating.toFixed(1)}/5. Read our summary of what customers say.`,
            `${name}: ${rating.toFixed(1)}/5 on ${source}, with our summary of what customers say.`,
          ]
        : [
            `Customer reviews of ${name}, each excerpt linked to its original source, with our summary of what reviewers say.`,
            `Customer reviews of ${name}, each linked to its original source.`,
          ],
    ),
    h1: `${name} Reviews`,
    keywords: distinctKeywords([`${name} reviews`, `${name} rating`]),
  };
}

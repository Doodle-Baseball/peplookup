import type { Metadata } from 'next';
import { site } from '@/config/site';
import { couponPagePath } from '@/lib/coupon-pages';
import { reviewsPagePath } from '@/lib/review-pages';
import { characterCount } from '@/lib/seo-status';

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

/** Search results cut titles and descriptions off past these lengths, so the generated ones stay under them. */
const MAX_TITLE_CHARACTERS = 59;
const MAX_DESCRIPTION_CHARACTERS = 149;

/**
 * The first candidate that fits, so a long supplier name falls back to a
 * shorter wording instead of being cut off mid-word. When none fits (a name
 * longer than any wording can carry) the shortest one is used as it is.
 */
function firstWithin(max: number, candidates: readonly string[]): string {
  return candidates.find((candidate) => characterCount(candidate) <= max) ?? candidates[candidates.length - 1]!;
}

/** Distinct keywords only, so two templates that land on the same phrase never repeat it. */
function distinctKeywords(keywords: readonly string[]): string[] {
  return [...new Set(keywords.map((keyword) => keyword.trim()).filter(Boolean))];
}

export function compoundSeoDefaults(compound: { slug: string; name: string }): SeoDefaults {
  return {
    path: `/products/${compound.slug}`,
    title: `${compound.name} | Compare Prices, Suppliers & COA | ${site.name}`,
    description: `Compare ${compound.name} prices per mg across verified suppliers, with stock status, shipping and lab-verification data.`,
    h1: compound.name,
  };
}

export function supplierSeoDefaults(supplier: { slug: string; name: string }): SeoDefaults {
  return {
    path: `/suppliers/${supplier.slug}`,
    title: `${supplier.name} | Supplier Profile, Prices & Coupons | ${site.name}`,
    description: `Prices, shipping, payment methods, lab verification status and discount codes for ${supplier.name}.`,
    h1: supplier.name,
  };
}

export function guideSeoDefaults(guide: { slug: string; title: string; excerpt: string }): SeoDefaults {
  return {
    path: `/guides/${guide.slug}`,
    title: `${guide.title} | ${site.name}`,
    description: guide.excerpt,
    h1: guide.title,
  };
}

export function couponPageSeoDefaults(
  supplier: { slug: string; name: string },
  coupon: { percentOff: number },
): SeoDefaults {
  const { name } = supplier;
  const { percentOff } = coupon;
  return {
    path: couponPagePath(supplier.slug),
    title: firstWithin(MAX_TITLE_CHARACTERS, [
      `${name} Coupon Code: ${percentOff}% Off | ${site.name}`,
      `${name} Coupon Code | ${site.name}`,
    ]),
    description: firstWithin(MAX_DESCRIPTION_CHARACTERS, [
      `Get the ${name} coupon code for ${percentOff}% off eligible orders. Offer details, how to apply it at checkout, shipping and payment.`,
      `${name} coupon code: ${percentOff}% off eligible orders. See offer details and how to apply it at checkout.`,
    ]),
    h1: `${name} Coupon Code`,
    keywords: distinctKeywords([
      `${name} coupon code`,
      `${name} discount code`,
      `${name} ${percentOff}% off`,
      `${name} code not working`,
      `${name} peptide prices`,
      `${name} shipping and payment`,
      `${name} supplier`,
    ]),
  };
}

export function reviewsPageSeoDefaults(supplier: { slug: string; name: string }): SeoDefaults {
  const { name } = supplier;
  return {
    path: reviewsPagePath(supplier.slug),
    title: firstWithin(MAX_TITLE_CHARACTERS, [
      `${name} Reviews 2026: Rating & Lab Reports | ${site.name}`,
      `${name} Reviews 2026: Rating & COA | ${site.name}`,
      `${name} Reviews 2026 | ${site.name}`,
    ]),
    description: firstWithin(MAX_DESCRIPTION_CHARACTERS, [
      `${name} reviews and overall rating, with its product catalog, lab report coverage, shipping and payment details on ${site.name}.`,
      `${name} reviews and overall rating, with its product catalog, lab reports, shipping and payment details.`,
      `${name} reviews and overall rating, plus its products, lab reports, shipping and payment details.`,
    ]),
    h1: `${name} Reviews`,
    keywords: distinctKeywords([
      `${name} reviews`,
      `${name} reviews 2026`,
      `${name} rating`,
      `${name} lab reports`,
      `${name} COA`,
      `${name} shipping and payment`,
      `${name} supplier`,
    ]),
  };
}

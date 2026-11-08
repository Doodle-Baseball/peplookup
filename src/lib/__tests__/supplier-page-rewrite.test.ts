import { describe, expect, it } from 'vitest';
import {
  isRewrittenSupplierPage,
  rewriteAbout,
  rewriteComparisonIntro,
  rewriteCouponText,
  rewriteFaqs,
  rewriteGlance,
  rewriteSeoDescription,
  rewriteSeoTitle,
  rewriteSummary,
  type RewriteFacts,
} from '../supplier-page-rewrite';

const AP: RewriteFacts = {
  name: 'American Peptides',
  listingCount: 53,
  compoundCount: 29,
  coaCount: 47,
  inStockCount: 48,
  foundedYear: 2026,
  coupon: { code: 'peplookup', percentOff: 10 },
  couponOnEveryPrice: true,
  paymentMethods: ['Visa card', 'Mastercard', 'Crypto'],
  rating: { value: 3.4, source: 'Trustpilot', url: 'https://www.trustpilot.com/review/americanpeptides.us' },
  otherSupplierCount: 84,
  comparableCount: 29,
  cheapestCount: 0,
};

const everyText = (f: RewriteFacts) =>
  [
    rewriteSeoTitle(f),
    rewriteSeoDescription(f),
    rewriteSummary(f),
    ...rewriteAbout(f),
    ...rewriteGlance(f).map((row) => `${row.label} ${row.value}`),
    rewriteComparisonIntro(f),
    rewriteCouponText(f) ?? '',
    ...rewriteFaqs(f).flatMap((faq) => [faq.question, faq.answer]),
  ].join('\n');

describe('the rewritten American Peptides page', () => {
  it('is the only rewritten page', () => {
    expect(isRewrittenSupplierPage('american-peptides')).toBe(true);
    expect(isRewrittenSupplierPage('kylo-peptides')).toBe(false);
  });

  it('uses the agreed title and a description within 155 characters', () => {
    expect(rewriteSeoTitle(AP)).toBe('American Peptides Prices, COAs & Coupon Code | PepLookup');
    expect(rewriteSeoTitle(AP).length).toBeLessThanOrEqual(60);
    expect(rewriteSeoDescription(AP)).toBe(
      'American Peptides lists 53 products across 29 compounds, with COAs on 47. Compare prices per mg and use code peplookup for 10% off.',
    );
    expect(rewriteSeoDescription(AP).length).toBeLessThanOrEqual(155);
  });

  it('never says review, legit, best, or anything about dosing', () => {
    const text = everyText(AP).replace(/https?:\/\/\S+/g, '');
    expect(text).not.toMatch(/review|legit|\bbest\b|dos(e|ing)/i);
  });

  it('takes every number from the facts', () => {
    const other = { ...AP, listingCount: 7, compoundCount: 3, coaCount: 2, inStockCount: 5, comparableCount: 3, coupon: { code: 'X1', percentOff: 15 } };
    const text = everyText(other);
    for (const stale of ['53', '29', '47', '48', '10%', 'peplookup']) expect(text).not.toContain(stale);
    expect(text).toContain('15% off');
  });

  it('says plainly when the supplier is never the cheapest, and counts it when it is', () => {
    expect(rewriteComparisonIntro(AP)).toContain('did not have the lowest cost per mg on any of the 29 compounds');
    expect(rewriteComparisonIntro({ ...AP, cheapestCount: 4 })).toContain('lowest cost per mg on 4 of 29 compounds');
  });

  it('leaves out what it cannot state: no coupon, no COAs, no rating', () => {
    const bare = { ...AP, coupon: null, coaCount: 0, rating: null, foundedYear: null, paymentMethods: [] };
    expect(rewriteSeoTitle(bare)).toBe('American Peptides Prices | PepLookup');
    expect(rewriteCouponText(bare)).toBeNull();
    expect(everyText(bare)).not.toMatch(/coupon code\?|COAs linked|Public rating|started selling/);
    expect(rewriteFaqs(bare)).toHaveLength(1);
  });

  it('only claims the code is in every price when no listing has its own sale price', () => {
    expect(rewriteAbout(AP).join(' ')).toContain('The prices on this page already include the 10% code.');
    expect(rewriteAbout({ ...AP, couponOnEveryPrice: false }).join(' ')).not.toContain('The prices on this page already include');
  });

  it('asks at most four questions', () => {
    expect(rewriteFaqs(AP)).toHaveLength(4);
  });
});

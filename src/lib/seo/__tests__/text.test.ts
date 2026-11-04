import { describe, expect, it } from 'vitest';
import {
  cleanSeoText,
  deliveryWindow,
  hasStarOrEmoji,
  mostSimilar,
  qualifyClaims,
  qualifyShippingSpeed,
  qualifyTitleClaims,
  trigramSimilarity,
  withoutName,
} from '@/lib/seo/text';

describe('cleanSeoText', () => {
  it('turns a star rating into "/5" when the supplier has a rating', () => {
    expect(cleanSeoText('Purgo Labs Coupon Code: 15% Off + 4.7★ Rating (2026)', { hasRating: true })).toBe(
      'Purgo Labs Coupon Code: 15% Off + 4.7/5 Rating (2026)',
    );
  });

  it('drops the rating claim entirely when the supplier has no rating', () => {
    expect(cleanSeoText('Purgo Labs Coupon Code: 15% Off + 4.7★ Rating (2026)', { hasRating: false })).toBe(
      'Purgo Labs Coupon Code: 15% Off (2026)',
    );
  });

  it('strips loose stars and emoji but keeps trademark marks', () => {
    expect(cleanSeoText('★ Best Peptides 🔥 Hospira™', { hasRating: false })).toBe('Best Peptides Hospira™');
    expect(hasStarOrEmoji('Best Peptides Hospira™')).toBe(false);
    expect(hasStarOrEmoji('Best ⭐ Peptides')).toBe(true);
  });
});

describe('qualifyClaims (A7)', () => {
  const noCoa = { hasLinkedCoa: false, shippingSpeed: 'Same-day fulfillment; 1–5 business days standard; 2-day/overnight available' };

  it('attributes a purity or testing claim to the supplier when we link no COA', () => {
    expect(qualifyClaims('Purgo Labs offers 99%+ purity. Orders ship fast.', noCoa)).toBe(
      'Supplier states: Purgo Labs offers 99%+ purity. Orders ship fast.',
    );
    expect(qualifyClaims('Yes. Purgo Labs uses third-party HPLC/MS testing.', noCoa)).toBe(
      'Yes. Supplier states: Purgo Labs uses third-party HPLC/MS testing.',
    );
  });

  it('leaves the claim alone when a COA backs it', () => {
    const text = 'Purgo Labs offers 99%+ purity.';
    expect(qualifyClaims(text, { ...noCoa, hasLinkedCoa: true })).toBe(text);
  });

  it('keeps abbreviations like U.S. inside one sentence', () => {
    expect(qualifyClaims('Purgo Labs is a U.S.-based supplier offering third-party tested compounds.', noCoa)).toBe(
      'Supplier states: Purgo Labs is a U.S.-based supplier offering third-party tested compounds.',
    );
  });

  it('rewrites same-day fulfillment with the supplier\'s own delivery window', () => {
    expect(qualifyClaims('Same-day fulfillment.', noCoa)).toBe('Ships same day; delivery in 1–5 business days.');
    expect(qualifyClaims('They provide same-day fulfillment and overnight options.', noCoa)).toBe(
      'They provide same-day shipping (delivery in 1–5 business days) and overnight options.',
    );
    expect(qualifyClaims('Does Purgo Labs offer same-day fulfillment?', noCoa)).toBe(
      'Does Purgo Labs offer same-day shipping?',
    );
  });

  it('states no delivery window the supplier never gave', () => {
    expect(qualifyClaims('Same-day fulfillment.', { hasLinkedCoa: true, shippingSpeed: null })).toBe('Ships same day.');
  });
});

describe('shipping and title wording', () => {
  it('reads the stated window and skips processing times', () => {
    expect(deliveryWindow('1–2 business days processing; 3–5 business days standard')).toBe('3–5 business days');
    expect(deliveryWindow('Overnight available')).toBeNull();
  });

  it('fixes the shipping line and titles without adding a window', () => {
    expect(qualifyShippingSpeed('Same-day fulfillment; 1–5 business days standard')).toBe(
      'Ships same day; 1–5 business days standard',
    );
    expect(qualifyTitleClaims('Purgo Labs: Same-Day Fulfillment')).toBe('Purgo Labs: Same-Day Shipping');
  });
});

describe('trigramSimilarity', () => {
  it('scores identical text 1 and unrelated text near 0', () => {
    expect(trigramSimilarity('third party tested peptides', 'third party tested peptides')).toBe(1);
    expect(trigramSimilarity('third party tested peptides', 'overnight shipping to canada')).toBeLessThan(0.2);
  });

  it('treats the same template with a different supplier name as a duplicate', () => {
    const template = (name: string) =>
      `${name} is a research peptide supplier offering batch COAs, crypto payments and fast domestic shipping.`;
    const best = mostSimilar(
      { name: 'Purgo Labs', text: template('Purgo Labs') },
      [{ name: 'Kylo Peptides', text: template('Kylo Peptides') }],
    );
    expect(best?.score).toBeGreaterThan(0.95);
    expect(withoutName('Purgo Labs ships fast', 'Purgo Labs').trim()).toBe('ships fast');
  });
});

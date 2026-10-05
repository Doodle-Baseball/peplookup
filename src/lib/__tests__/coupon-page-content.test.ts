import { describe, expect, it } from 'vitest';
import {
  COUPON_DETAIL_KEYS,
  defaultCouponPageContent,
  isEmptyCouponOverride,
  parseSteps,
  resolveCouponPageContent,
  toCouponPageContentOverride,
  type CouponDetailKey,
  type CouponPageContentOverride,
} from '@/lib/coupon-page-content';
import { couponPageIndexable } from '@/lib/coupon-pages';

const VENDOR = {
  name: 'Amino Club',
  description: 'A U.S. research peptide vendor.',
  shippingCost: { kind: 'unknown' } as const,
};
const COUPON = { code: 'PRODUCTS', percentOff: 20 };

const EMPTY_DETAILS = Object.fromEntries(COUPON_DETAIL_KEYS.map((key) => [key, null])) as Record<CouponDetailKey, null>;
const NO_OVERRIDE: CouponPageContentOverride = { intro: null, details: EMPTY_DETAILS, steps: null, workingNote: null };

function submittedFrom(defaults: ReturnType<typeof defaultCouponPageContent>) {
  return {
    intro: defaults.intro ?? '',
    details: { ...defaults.details },
    steps: [...defaults.steps],
    workingNote: defaults.workingNote,
  };
}

describe('defaultCouponPageContent', () => {
  it('names the vendor and code, and claims no rule it has not confirmed', () => {
    const content = defaultCouponPageContent(VENDOR, COUPON);
    expect(content.details.codeAndOffer).toContain('PRODUCTS for 20% off');
    expect(content.details.expiry).toBe('No published expiry date or minimum confirmed');
    expect(content.steps).toHaveLength(4);
    expect(content.steps[1]).toContain('PRODUCTS');
    expect(content.workingNote).toContain('Amino Club');
  });

  it('only mentions a shipping cost when the vendor has one on record', () => {
    const unknown = defaultCouponPageContent(VENDOR, COUPON);
    expect(unknown.details.shipping).toBe('Separate from the coupon; availability and charges appear at checkout');
    const free = defaultCouponPageContent({ ...VENDOR, shippingCost: { kind: 'free' } }, COUPON);
    expect(free.details.shipping).toMatch(/^Free standard shipping listed/);
  });
});

describe('toCouponPageContentOverride', () => {
  const defaults = defaultCouponPageContent(VENDOR, COUPON);

  it('stores nothing when every field is unchanged, so the page keeps tracking the live coupon', () => {
    const override = toCouponPageContentOverride(submittedFrom(defaults), defaults);
    expect(isEmptyCouponOverride(override)).toBe(true);
  });

  it('stores only the fields that were actually edited', () => {
    const submitted = submittedFrom(defaults);
    submitted.details.expiry = 'Ends 30 November';
    submitted.workingNote = '   ';
    const override = toCouponPageContentOverride(submitted, defaults);
    expect(override.details.expiry).toBe('Ends 30 November');
    expect(override.details.stacking).toBeNull();
    expect(override.workingNote).toBeNull();
    expect(override.steps).toBeNull();
  });

  it('keeps edited steps and falls back to generated ones when they are cleared', () => {
    const edited = toCouponPageContentOverride({ ...submittedFrom(defaults), steps: ['Only one step'] }, defaults);
    expect(edited.steps).toEqual(['Only one step']);
    const cleared = toCouponPageContentOverride({ ...submittedFrom(defaults), steps: [] }, defaults);
    expect(cleared.steps).toBeNull();
  });
});

describe('resolveCouponPageContent', () => {
  const defaults = defaultCouponPageContent(VENDOR, COUPON);

  it('uses generated text when nothing is saved', () => {
    expect(resolveCouponPageContent(defaults, null)).toEqual(defaults);
    expect(resolveCouponPageContent(defaults, NO_OVERRIDE)).toEqual(defaults);
  });

  it('layers saved text over the generated text field by field', () => {
    const resolved = resolveCouponPageContent(defaults, {
      ...NO_OVERRIDE,
      intro: 'Custom intro',
      details: { ...EMPTY_DETAILS, stacking: 'Cannot be combined' } as CouponPageContentOverride['details'],
      steps: ['One', 'Two'],
    });
    expect(resolved.intro).toBe('Custom intro');
    expect(resolved.details.stacking).toBe('Cannot be combined');
    expect(resolved.details.expiry).toBe(defaults.details.expiry);
    expect(resolved.steps).toEqual(['One', 'Two']);
    expect(resolved.workingNote).toBe(defaults.workingNote);
  });
});

describe('parseSteps', () => {
  it('splits on lines and drops blanks', () => {
    expect(parseSteps('One\r\n\n  Two  \n')).toEqual(['One', 'Two']);
  });
});

describe('couponPageIndexable', () => {
  const base = { robotsIndex: true, metaTitle: 'Amino Club Coupon Code: 20% Off', metaDescription: 'Get the code.' };

  it('is off by default, with no saved SEO', () => {
    expect(couponPageIndexable(null)).toBe(false);
  });

  it('stays off until both a title and a description are saved', () => {
    expect(couponPageIndexable({ ...base, metaTitle: null })).toBe(false);
    expect(couponPageIndexable({ ...base, metaDescription: '  ' })).toBe(false);
  });

  it('stays off while the indexing switch is off, even with SEO details saved', () => {
    expect(couponPageIndexable({ ...base, robotsIndex: false })).toBe(false);
  });

  it('turns on once SEO details are saved and indexing is switched on', () => {
    expect(couponPageIndexable(base)).toBe(true);
  });
});

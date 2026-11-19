import { describe, expect, it } from 'vitest';
import {
  fieldErrorsFrom,
  matchesImageSignature,
  paymentMethodSchema,
  screenshotProblem,
  vendorApplicationSchema,
} from '@/lib/vendor-listing/application';

const valid = {
  plan: 'basic',
  organizationName: 'Acme Peptides',
  email: 'Owner@Acme.com',
  contactNumber: '',
  websiteUrl: 'acme.com',
  affiliateSignupUrl: 'acme.com/affiliates',
  coaPageUrl: 'https://acme.com/coa',
  commissionPercent: '10',
  customerDiscountPercent: '12.5',
};

describe('vendorApplicationSchema', () => {
  it('normalises a valid application', () => {
    const result = vendorApplicationSchema.parse(valid);
    expect(result.email).toBe('owner@acme.com');
    expect(result.websiteUrl).toBe('https://acme.com');
    expect(result.commissionPercent).toBe(10);
    expect(result.customerDiscountPercent).toBe(12.5);
    expect(result.contactNumber).toBeUndefined();
  });

  it('keeps an optional contact number when given', () => {
    expect(vendorApplicationSchema.parse({ ...valid, contactNumber: '+1 260 218 1154' }).contactNumber).toBe('+1 260 218 1154');
  });

  it.each(['101', '-1', 'abc', '10.123', ''])('rejects commission "%s"', (commissionPercent) => {
    expect(vendorApplicationSchema.safeParse({ ...valid, commissionPercent }).success).toBe(false);
  });

  it('normalises the affiliate and COA links', () => {
    const result = vendorApplicationSchema.parse(valid);
    expect(result.affiliateSignupUrl).toBe('https://acme.com/affiliates');
    expect(result.coaPageUrl).toBe('https://acme.com/coa');
  });

  it.each(['affiliateSignupUrl', 'coaPageUrl'] as const)('requires %s', (field) => {
    expect(vendorApplicationSchema.safeParse({ ...valid, [field]: '' }).success).toBe(false);
    expect(vendorApplicationSchema.safeParse({ ...valid, [field]: 'not a link' }).success).toBe(false);
  });

  it('rejects an unknown plan, the retired Pro plan and a bad website', () => {
    expect(vendorApplicationSchema.safeParse({ ...valid, plan: 'gold' }).success).toBe(false);
    expect(vendorApplicationSchema.safeParse({ ...valid, plan: 'pro' }).success).toBe(false);
    expect(vendorApplicationSchema.safeParse({ ...valid, websiteUrl: 'not a url' }).success).toBe(false);
  });

  it('reports one message per field', () => {
    const result = vendorApplicationSchema.safeParse({ ...valid, email: 'nope', organizationName: '' });
    if (result.success) throw new Error('expected failure');
    const errors = fieldErrorsFrom(result.error);
    expect(Object.keys(errors).sort()).toEqual(['email', 'organizationName']);
  });
});

describe('vendorApplicationSchema message', () => {
  const base = {
    plan: 'basic',
    organizationName: 'Acme Peptides',
    email: 'owner@acme.com',
    websiteUrl: 'acme.com',
    affiliateSignupUrl: 'acme.com/affiliates',
    coaPageUrl: 'acme.com/coa',
    commissionPercent: '10',
    customerDiscountPercent: '5',
  };

  it('treats a missing or blank message as no message', () => {
    expect(vendorApplicationSchema.parse(base).message).toBeUndefined();
    expect(vendorApplicationSchema.parse({ ...base, message: '   ' }).message).toBeUndefined();
  });

  it('keeps a trimmed message and rejects one over 1,000 characters', () => {
    expect(vendorApplicationSchema.parse({ ...base, message: ' Hello ' }).message).toBe('Hello');
    expect(vendorApplicationSchema.safeParse({ ...base, message: 'x'.repeat(1001) }).success).toBe(false);
  });
});

describe('payment step', () => {
  it('accepts only Bitcoin and PayPal', () => {
    expect(paymentMethodSchema.safeParse('btc').success).toBe(true);
    expect(paymentMethodSchema.safeParse('paypal').success).toBe(true);
    expect(paymentMethodSchema.safeParse('card').success).toBe(false);
    expect(paymentMethodSchema.safeParse(null).success).toBe(false);
  });

  it('requires a screenshot of an accepted type and size', () => {
    expect(screenshotProblem(null)).toMatch(/upload a screenshot/i);
    expect(screenshotProblem({ size: 0, type: 'image/png' })).toMatch(/upload a screenshot/i);
    expect(screenshotProblem({ size: 1000, type: 'application/pdf' })).toMatch(/png, jpg or webp/i);
    expect(screenshotProblem({ size: 5 * 1024 * 1024, type: 'image/png' })).toMatch(/under 4 MB/);
    expect(screenshotProblem({ size: 1000, type: 'image/jpeg' })).toBeNull();
  });

  it('checks the file really is the image type it claims', () => {
    const png = new Uint8Array([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a, 0x00]);
    const jpeg = new Uint8Array([0xff, 0xd8, 0xff, 0xe0]);
    const webp = new Uint8Array([0x52, 0x49, 0x46, 0x46, 0, 0, 0, 0, 0x57, 0x45, 0x42, 0x50]);
    expect(matchesImageSignature(png, 'image/png')).toBe(true);
    expect(matchesImageSignature(jpeg, 'image/jpeg')).toBe(true);
    expect(matchesImageSignature(webp, 'image/webp')).toBe(true);
    expect(matchesImageSignature(jpeg, 'image/png')).toBe(false);
    expect(matchesImageSignature(new TextEncoder().encode('<html>'), 'image/jpeg')).toBe(false);
  });
});

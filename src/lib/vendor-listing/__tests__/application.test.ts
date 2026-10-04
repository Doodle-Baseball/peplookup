import { describe, expect, it } from 'vitest';
import { fieldErrorsFrom, vendorApplicationSchema } from '@/lib/vendor-listing/application';

const valid = {
  plan: 'pro',
  organizationName: 'Acme Peptides',
  email: 'Owner@Acme.com',
  contactNumber: '',
  websiteUrl: 'acme.com',
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

  it('rejects an unknown plan and a bad website', () => {
    expect(vendorApplicationSchema.safeParse({ ...valid, plan: 'gold' }).success).toBe(false);
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

import { describe, expect, it } from 'vitest';
import { supplierFaqs, supplierLegitSummary } from '@/lib/supplier-legit';

const NURA = {
  slug: 'nura-peptide',
  name: 'Nura Peptide',
  reviewRating: 4.9,
  reviewCount: { kind: 'exact' as const, value: 214 },
  reviewsUrl: 'https://pepreviewpro.com/store/nura-peptide',
  coaLabName: 'Third-party laboratory',
  coupon: { code: 'PEPLOOKUP', percentOff: 20 },
};

describe('supplierLegitSummary', () => {
  it('writes the summary from the record and the COAs shown', () => {
    expect(supplierLegitSummary(NURA, 26)).toBe(
      'Nura Peptide has received customer feedback on PepReviewPro, where it currently holds a 4.9 out of 5 rating from 214 reviews. ' +
        'The supplier also provides access to published third-party laboratory reports through its COA library. ' +
        'Visitors can review the available documentation and customer feedback before evaluating the company. ' +
        'Remember that customer ratings reflect individual experiences and do not independently confirm product quality.',
    );
  });

  it('quotes the rating on the record, so it never goes stale', () => {
    const summary = supplierLegitSummary({ ...NURA, reviewRating: 4.7, reviewCount: { kind: 'exact', value: 300 } }, 26);
    expect(summary).toContain('a 4.7 out of 5 rating from 300 reviews');
  });

  it('makes no third-party claim the record does not support', () => {
    expect(supplierLegitSummary({ ...NURA, coaLabName: null }, 26)).toContain('access to published laboratory reports');
  });

  it('leaves out what the record lacks', () => {
    const summary = supplierLegitSummary({ ...NURA, reviewRating: null, reviewCount: null }, 26);
    expect(summary).toBe(
      'Nura Peptide provides access to published third-party laboratory reports through its COA library. ' +
        'Visitors can review the available documentation before evaluating the company.',
    );
  });

  it('gives an empty record no placeholder text', () => {
    expect(supplierLegitSummary({ ...NURA, reviewRating: null, reviewCount: null, coaLabName: null }, 0)).toBe('');
  });
});

describe('supplierFaqs', () => {
  it('answers shipping, the discount code and returns', () => {
    expect(supplierFaqs(NURA)).toEqual([
      {
        question: 'How quickly does Nura Peptide ship orders?',
        answer:
          'Nura Peptide offers same-day shipping for eligible orders placed before 3:00 PM Eastern Time, Monday through Friday. ' +
          'Orders placed after the cutoff or on weekends and holidays are processed the next business day.',
      },
      {
        question: 'Does Nura Peptide offer a discount code?',
        answer:
          'Yes. PepLookup currently lists an exclusive 20% discount for Nura Peptide. Use the coupon code PEPLOOKUP at checkout to ' +
          'receive the advertised discount. Check that the discount appears before completing your order.',
      },
      {
        question: "What is Nura Peptide's return policy?",
        answer:
          'Nura Peptide says unopened products may be eligible for return within 30 days, subject to its return and refund policy. ' +
          'Damaged or incorrect items must be reported within 48 hours of delivery. Approved refunds are processed after the returned ' +
          'products are received and inspected, so contact Nura Peptide customer support before starting a return.',
      },
    ]);
  });

  it('leaves out questions the record cannot answer', () => {
    expect(supplierFaqs({ ...NURA, slug: 'other-vendor', coupon: null })).toEqual([]);
  });
});

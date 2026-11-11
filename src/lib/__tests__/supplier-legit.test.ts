import { describe, expect, it } from 'vitest';
import { supplierFaqs, supplierLegitSummary } from '@/lib/supplier-legit';

const NURA = {
  name: 'Nura Peptide',
  domainRegisteredAt: '2025-08-07T20:50:25+00:00',
  reviewRating: 4.9,
  reviewCount: { kind: 'exact' as const, value: 214 },
  reviewsUrl: 'https://pepreviewpro.com/store/nura-peptide',
  coaLabName: 'Third-party laboratory',
  country: null,
  supplyCountries: ['United States'],
  foundedYear: 2025,
};
const NOW = new Date('2026-11-11T00:00:00Z');

describe('supplierLegitSummary', () => {
  it('writes the summary from the record and the COAs shown', () => {
    expect(supplierLegitSummary(NURA, 28, NOW)).toBe(
      'Nura Peptide is a new store. Its website started in August 2025. ' +
        'On PepReviewPro, it has 4.9 out of 5 from 214 reviews. We link 28 of its lab reports (COAs). ' +
        'Nura Peptide says a third-party lab tests them. Check that the lot number on the report matches your vial.',
    );
  });

  it('stops calling a store new after two years', () => {
    expect(supplierLegitSummary(NURA, 28, new Date('2027-09-01T00:00:00Z'))).not.toContain('new store');
  });

  it('gives an empty record no placeholder text', () => {
    const empty = { ...NURA, domainRegisteredAt: null, reviewRating: null, reviewCount: null, coaLabName: null };
    expect(supplierLegitSummary(empty, 0, NOW)).toBe('');
  });
});

describe('supplierFaqs', () => {
  it('answers from the record, with the COA count the page shows', () => {
    expect(supplierFaqs(NURA, 26)).toEqual([
      {
        question: 'Where is Nura Peptide based?',
        answer: 'Nura Peptide is based in the United States and has been selling research peptides since 2025.',
      },
      {
        question: 'What products does Nura Peptide offer?',
        answer: 'Nura Peptide offers a range of research peptides and laboratory compounds in different sizes and product forms.',
      },
      {
        question: 'Does Nura Peptide provide Certificates of Analysis (COAs)?',
        answer: 'Yes. Nura Peptide has COA reports available for listed products, with 26 reports shown on its PepLookup profile.',
      },
    ]);
  });

  it('leaves out questions the record cannot answer', () => {
    const faqs = supplierFaqs({ ...NURA, supplyCountries: [] }, 0);
    expect(faqs.map((faq) => faq.question)).toEqual(['What products does Nura Peptide offer?']);
  });
});

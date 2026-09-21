import { describe, expect, it } from 'vitest';
import type { Offer } from '@/lib/schema';
import { withPublishedCoaLink } from '../vendor-coa-links';

function offer(over: Partial<Offer> = {}): Offer {
  return {
    supplierSlug: 'pure-amino-2',
    productSlug: 'ghk-cu',
    form: 'vial',
    vialSize: 50_000,
    vialCount: 1,
    listPrice: 2999,
    salePrice: null,
    currency: 'USD',
    inStock: true,
    productUrl: 'https://www.pureamino.com/product/ghk-cu/?ref=PRODUCTS',
    imageUrl: null,
    labReport: null,
    scrapedAt: '2026-09-14T00:00:00.000Z',
    ...over,
  };
}

describe('withPublishedCoaLink', () => {
  it('links each vial size to its own certificate', () => {
    expect(withPublishedCoaLink(offer()).coaUrl).toBe(
      'https://www.pureamino.com/wp-content/themes/pureamino/assets/coa/ghk-cu-50mg-PA25020101.png',
    );
    expect(withPublishedCoaLink(offer({ vialSize: 100_000 })).coaUrl).toBe(
      'https://www.pureamino.com/wp-content/themes/pureamino/assets/coa/ghk-cu-100mg-PA25050102.png',
    );
  });

  it('keeps a link already stored on the offer', () => {
    const stored = 'https://example.com/stored-coa.pdf';
    expect(withPublishedCoaLink(offer({ coaUrl: stored })).coaUrl).toBe(stored);
  });

  it('leaves listings without a published certificate untouched', () => {
    const selank = offer({ productSlug: 'selank', vialSize: 10_000 });
    expect(withPublishedCoaLink(selank)).toBe(selank);
    const otherSize = offer({ productSlug: 'mots-c', vialSize: 30_000 });
    expect(withPublishedCoaLink(otherSize).coaUrl).toBeUndefined();
    const otherVendor = offer({ supplierSlug: 'axis-peptide-labs-2' });
    expect(withPublishedCoaLink(otherVendor).coaUrl).toBeUndefined();
  });

  it('never gives a spray the certificate of a vial with the same compound and size', () => {
    const vortex = { supplierSlug: 'vortex-research-2', productSlug: 'selank', vialSize: 10_000 };
    expect(withPublishedCoaLink(offer({ ...vortex, form: 'vial' })).coaUrl).toBe(
      'https://vortexresearch.net/wp-content/uploads/2026/08/Selank_PS07-SK10_Summary.png',
    );
    expect(withPublishedCoaLink(offer({ ...vortex, form: 'spray' })).coaUrl).toBeUndefined();
  });

  it('uses a spray link only where the vendor published one for the spray', () => {
    expect(
      withPublishedCoaLink(
        offer({ supplierSlug: 'vortex-research-2', productSlug: 'melanotan-2', form: 'spray', vialSize: 10_000 }),
      ).coaUrl,
    ).toBe('https://vortexresearch.net/wp-content/uploads/2026/08/Melanotan_II_PS07-MT210_Summary.png');
  });

  it("falls back to a vendor's general COA page only for that vendor's listings", () => {
    const aminoClubSpray = offer({ supplierSlug: 'amino-club-2', productSlug: 'semax', form: 'spray', vialSize: 25_000 });
    expect(withPublishedCoaLink(aminoClubSpray).coaUrl).toBe('https://www.aminoclub.com/us/coa');
    expect(withPublishedCoaLink(offer({ supplierSlug: 'axis-peptide-labs-2' })).coaUrl).toBeUndefined();
  });
});

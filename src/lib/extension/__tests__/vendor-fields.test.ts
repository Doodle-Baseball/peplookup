import { describe, expect, it } from 'vitest';
import { EXTENSION_FIELDS_MARKER, parseVendorExtensionForm, VendorExtensionInputError } from '../vendor-fields';

function form(entries: [string, string][]): FormData {
  const data = new FormData();
  for (const [name, value] of entries) data.append(name, value);
  return data;
}

const HTTPS = { affiliateUrl: 'https://pivotlabs.com/?ref=PEPLOOKUP' };

describe('parseVendorExtensionForm', () => {
  it('reads every field', () => {
    const result = parseVendorExtensionForm(
      form([
        [EXTENSION_FIELDS_MARKER, '1'],
        ['showInExtension', 'on'],
        ['storeDomains', 'pivotlabs.com'],
        ['storeDomains', 'www.pivotlabsglobal.com'],
        ['reviewCountValue', '120'],
        ['ratingUpdatedAt', '2026-10-18'],
        ['couponVerifiedAt', '2026-10-19'],
      ]),
      HTTPS,
    );

    expect(result).toEqual({
      fields: {
        storeDomains: ['pivotlabs.com', 'pivotlabsglobal.com'],
        showInExtension: true,
        ratingUpdatedAt: '2026-10-18',
        couponVerifiedAt: '2026-10-19',
      },
      reviewCount: 120,
    });
  });

  it('reads an unticked toggle as off and blank values as null', () => {
    expect(parseVendorExtensionForm(form([[EXTENSION_FIELDS_MARKER, '1']]), HTTPS)).toEqual({
      fields: { storeDomains: [], showInExtension: false, ratingUpdatedAt: null, couponVerifiedAt: null },
      reviewCount: null,
    });
  });

  it('is null when the form did not carry the extension fields', () => {
    expect(parseVendorExtensionForm(form([]), HTTPS)).toBeNull();
  });

  it('saves a supplier shown in the extension even without a coupon code', () => {
    const result = parseVendorExtensionForm(form([[EXTENSION_FIELDS_MARKER, '1'], ['showInExtension', 'on']]), HTTPS);
    expect(result?.fields.showInExtension).toBe(true);
  });

  it('requires an https affiliate link, with or without the extension fields', () => {
    expect(() => parseVendorExtensionForm(form([]), { affiliateUrl: 'http://pivotlabs.com' })).toThrow(/https:\/\//);
  });

  it('rejects a domain written as a URL', () => {
    expect(() =>
      parseVendorExtensionForm(
        form([
          [EXTENSION_FIELDS_MARKER, '1'],
          ['storeDomains', 'https://pivotlabs.com/'],
        ]),
        HTTPS,
      ),
    ).toThrow(VendorExtensionInputError);
  });

  it.each([['-1'], ['1.5'], ['lots']])('rejects a review count of %s', (value) => {
    expect(() =>
      parseVendorExtensionForm(
        form([
          [EXTENSION_FIELDS_MARKER, '1'],
          ['reviewCountValue', value],
        ]),
        HTTPS,
      ),
    ).toThrow(/Review count/);
  });

  it('rejects an impossible date', () => {
    expect(() =>
      parseVendorExtensionForm(
        form([
          [EXTENSION_FIELDS_MARKER, '1'],
          ['couponVerifiedAt', '2026-02-30'],
        ]),
        HTTPS,
      ),
    ).toThrow(/Coupon last verified/);
  });
});

import { describe, expect, it } from 'vitest';

import { inferFieldMapping, parseCsvText } from '../vendor-import';

describe('vendor CSV import helpers', () => {
  it('parses CSV rows with quoted values', () => {
    const rows = parseCsvText('"Name","Website","Country"\n"Acme Pharma","https://acme.example","USA"\n"Beta Labs","https://beta.example","Canada"');

    expect(rows).toEqual([
      ['Name', 'Website', 'Country'],
      ['Acme Pharma', 'https://acme.example', 'USA'],
      ['Beta Labs', 'https://beta.example', 'Canada'],
    ]);
  });

  it('infers the right mapping from common CSV header names', () => {
    const mapping = inferFieldMapping(['Vendor Name', 'Affiliate Website Link', 'HQ Country', 'Description']);

    expect(mapping.name).toBe('Vendor Name');
    expect(mapping.affiliateUrl).toBe('Affiliate Website Link');
    expect(mapping.country).toBe('HQ Country');
    expect(mapping.description).toBe('Description');
  });
});

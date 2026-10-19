import { describe, expect, it } from 'vitest';
import { parseStoreDomain, parseStoreDomains, storeDomainFromUrl } from '../domains';

describe('parseStoreDomain', () => {
  it.each([
    ['pivotlabs.com', 'pivotlabs.com'],
    ['  Alpha-Peptides.IO ', 'alpha-peptides.io'],
    ['www.biopeptitech.com', 'biopeptitech.com'],
    ['shop.example.co.uk', 'shop.example.co.uk'],
  ])('accepts %s as %s', (input, expected) => {
    expect(parseStoreDomain(input)).toEqual({ ok: true, domain: expected });
  });

  it.each([
    ['https://pivotlabs.com', /http/],
    ['http://pivotlabs.com', /http/],
    ['pivotlabs.com/shop', /slash/],
    ['pivot labs.com', /spaces/],
    ['localhost', /not a valid domain/],
    ['-bad.com', /not a valid domain/],
    ['', /empty/],
  ])('rejects %s', (input, message) => {
    const result = parseStoreDomain(input);
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.error).toMatch(message);
  });
});

describe('parseStoreDomains', () => {
  it('drops blanks and duplicates, keeping the order entered', () => {
    expect(parseStoreDomains(['pivotlabs.com', '', 'www.pivotlabs.com', 'pivotlabsglobal.com'])).toEqual({
      ok: true,
      domains: ['pivotlabs.com', 'pivotlabsglobal.com'],
    });
  });

  it('reports the first invalid domain', () => {
    const result = parseStoreDomains(['pivotlabs.com', 'https://bad.com']);
    expect(result.ok).toBe(false);
  });
});

describe('storeDomainFromUrl', () => {
  it('takes the hostname without www from a website link', () => {
    expect(storeDomainFromUrl('https://www.pivotlabsglobal.com/?ref=PEPLOOKUP')).toBe('pivotlabsglobal.com');
  });

  it('is null for anything that is not an http(s) link', () => {
    expect(storeDomainFromUrl('')).toBeNull();
    expect(storeDomainFromUrl('not a url')).toBeNull();
    expect(storeDomainFromUrl('mailto:someone@example.com')).toBeNull();
  });
});

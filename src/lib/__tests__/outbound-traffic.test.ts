import { describe, expect, it } from 'vitest';
import { buildVendorHostIndex, isOwnHost, normalizeHost, outboundHostOf, outboundTargetOf } from '@/lib/traffic/outbound';
import { sinceForRange } from '@/lib/traffic/snapshot';

describe('outboundHostOf', () => {
  it('returns the normalised host of an external link', () => {
    expect(outboundHostOf('https://www.Example.com/shop?ref=pep', 'www.peplookup.com')).toBe('example.com');
  });

  it('ignores links to our own site and its subdomains', () => {
    expect(outboundHostOf('https://www.peplookup.com/suppliers', 'www.peplookup.com')).toBeNull();
    expect(outboundHostOf('https://peplookup.com/', 'localhost')).toBeNull();
    expect(outboundHostOf('https://blog.peplookup.com/', 'localhost')).toBeNull();
  });

  it('ignores the current host, so localhost and previews do not count their own links', () => {
    expect(outboundHostOf('http://localhost:3000/products', 'localhost')).toBeNull();
    expect(outboundHostOf('https://my-preview.vercel.app/x', 'my-preview.vercel.app')).toBeNull();
  });

  it('ignores non-web schemes and unparseable input', () => {
    expect(outboundHostOf('mailto:info@example.com', 'localhost')).toBeNull();
    expect(outboundHostOf('tel:+12602181154', 'localhost')).toBeNull();
    expect(outboundHostOf('javascript:void(0)', 'localhost')).toBeNull();
    expect(outboundHostOf('not a url', 'localhost')).toBeNull();
  });

  it('does not treat a lookalike domain as our own', () => {
    expect(isOwnHost('notpeplookup.com')).toBe(false);
    expect(isOwnHost(normalizeHost('WWW.peplookup.com'))).toBe(true);
  });
});

describe('buildVendorHostIndex', () => {
  it('credits a vendor for both its homepage and affiliate hosts', () => {
    const index = buildVendorHostIndex([
      { slug: 'acme', name: 'Acme Peptides', urls: ['https://www.acme.com', 'https://go.acme-affiliates.io/x'] },
    ]);
    expect(index.get('acme.com')).toEqual({ slug: 'acme', name: 'Acme Peptides' });
    expect(index.get('go.acme-affiliates.io')).toEqual({ slug: 'acme', name: 'Acme Peptides' });
  });

  it('keeps the first vendor when two share a host and skips malformed URLs', () => {
    const index = buildVendorHostIndex([
      { slug: 'one', name: 'One', urls: ['https://shared.com', 'garbage'] },
      { slug: 'two', name: 'Two', urls: ['https://shared.com'] },
    ]);
    expect(index.get('shared.com')?.slug).toBe('one');
    expect(index.size).toBe(1);
  });
});

describe('sinceForRange', () => {
  const now = new Date('2026-10-05T12:00:00.000Z');

  it('is null for all time', () => {
    expect(sinceForRange('all', now)).toBeNull();
  });

  it('looks back the right amount for each window', () => {
    expect(sinceForRange('24h', now)).toBe('2026-10-04T12:00:00.000Z');
    expect(sinceForRange('7d', now)).toBe('2026-09-28T12:00:00.000Z');
    expect(sinceForRange('30d', now)).toBe('2026-09-05T12:00:00.000Z');
  });
});

describe('outboundTargetOf', () => {
  it('resolves a /go redirect link to the vendor URL it leads to', () => {
    const href = `https://www.peplookup.com/go?to=${encodeURIComponent('https://www.acme.com/p?ref=pep')}`;
    expect(outboundTargetOf(href, 'www.peplookup.com')).toEqual({ url: 'https://www.acme.com/p?ref=pep', host: 'acme.com' });
    expect(outboundTargetOf(`http://localhost:3000/go?to=${encodeURIComponent('https://acme.com/')}`, 'localhost')).toEqual({
      url: 'https://acme.com/',
      host: 'acme.com',
    });
  });

  it('ignores a /go link with no usable destination', () => {
    expect(outboundTargetOf('http://localhost:3000/go', 'localhost')).toBeNull();
    expect(outboundTargetOf('http://localhost:3000/go?to=https://', 'localhost')).toBeNull();
    expect(outboundTargetOf(`http://localhost:3000/go?to=${encodeURIComponent('javascript:alert(1)')}`, 'localhost')).toBeNull();
    expect(outboundTargetOf(`http://localhost:3000/go?to=${encodeURIComponent('https://www.peplookup.com/')}`, 'localhost')).toBeNull();
  });

  it('still reports a direct external link as itself, and ignores other same-site pages', () => {
    expect(outboundTargetOf('https://wa.me/12602181154', 'localhost')).toEqual({ url: 'https://wa.me/12602181154', host: 'wa.me' });
    expect(outboundTargetOf('http://localhost:3000/products', 'localhost')).toBeNull();
  });
});

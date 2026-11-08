import { describe, expect, it } from 'vitest';
import { keyedPath, MOVED_SUPPLIER_SLUGS, publicCanonical, publicPath, supplierPath } from '../supplier-path';

describe('supplierPath', () => {
  it('moves only American Peptides to /supplier/', () => {
    expect(supplierPath('american-peptides')).toBe('/supplier/american-peptides');
  });

  it('leaves every other supplier under /suppliers/', () => {
    for (const slug of ['kylo-peptides', 'american-peptides-2', 'idun-peptides', 'nura-peptide']) {
      expect(supplierPath(slug)).toBe(`/suppliers/${slug}`);
    }
  });
});

describe('publicPath and keyedPath', () => {
  it('turn the keyed path into the served address and back', () => {
    expect(publicPath('/suppliers/american-peptides')).toBe('/supplier/american-peptides');
    expect(keyedPath('/supplier/american-peptides')).toBe('/suppliers/american-peptides');
  });

  it('keep a query or hash and leave similarly named slugs alone', () => {
    expect(publicPath('/suppliers/american-peptides?a=1')).toBe('/supplier/american-peptides?a=1');
    expect(publicPath('/suppliers/american-peptides-2')).toBe('/suppliers/american-peptides-2');
    expect(keyedPath('/supplier/american-peptides-2')).toBe('/supplier/american-peptides-2');
  });

  it('pass every other path through untouched', () => {
    for (const path of ['/', '/suppliers', '/suppliers/kylo-peptides', '/products/bpc-157', '/coupons/american-peptides-coupon-code', '/reviews/american-peptides-reviews']) {
      expect(publicPath(path)).toBe(path);
      expect(keyedPath(path)).toBe(path);
    }
  });
});

describe('publicCanonical', () => {
  it('handles a path and a full URL on this site', () => {
    expect(publicCanonical('/suppliers/american-peptides')).toBe('/supplier/american-peptides');
    expect(publicCanonical('https://www.peplookup.com/suppliers/american-peptides')).toBe('https://www.peplookup.com/supplier/american-peptides');
    expect(publicCanonical('https://www.peplookup.com/suppliers/kylo-peptides')).toBe('https://www.peplookup.com/suppliers/kylo-peptides');
  });
});

describe('next.config.mjs', () => {
  it('rewrites, redirects and caches exactly the moved slugs', async () => {
    // A URL held in a variable, so TypeScript doesn't look for declarations of the .mjs file.
    const configUrl = new URL('../../../next.config.mjs', import.meta.url).href;
    const { default: config } = (await import(/* @vite-ignore */ configUrl)) as {
      default: {
        rewrites: () => Promise<{ source: string; destination: string }[]>;
        redirects: () => Promise<{ source: string; destination: string; statusCode?: number }[]>;
        headers: () => Promise<{ source: string }[]>;
      };
    };
    const slugs = [...MOVED_SUPPLIER_SLUGS];
    const rewrites = await config.rewrites();
    expect(rewrites.map((rule) => [rule.source, rule.destination])).toEqual(slugs.map((slug) => [`/supplier/${slug}`, `/suppliers/${slug}`]));
    const redirects = await config.redirects();
    for (const slug of slugs) {
      expect(redirects).toContainEqual({ source: `/suppliers/${slug}`, destination: `/supplier/${slug}`, statusCode: 301 });
    }
    const headers = await config.headers();
    for (const slug of slugs) expect(headers.map((rule) => rule.source)).toContain(`/supplier/${slug}`);
  });
});

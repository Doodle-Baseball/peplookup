import { describe, expect, it } from 'vitest';
import { breadcrumbTrail, cleanPath, isSchemaExcluded, pageKindForPath, webPageTypeFor } from '../page-routes';

describe('pageKindForPath', () => {
  it.each([
    ['/', 'home'],
    ['/suppliers', 'collection'],
    ['/coupons', 'collection'],
    ['/reviews', 'collection'],
    ['/lab-reports', 'collection'],
    ['/labs', 'collection'],
    ['/tools', 'collection'],
    ['/guides', 'collection'],
    ['/products/bpc-157', 'compound'],
    ['/suppliers/licensed-peptides', 'supplier'],
    ['/coupons/licensed-peptides-coupon-code', 'coupon'],
    ['/reviews/alpha-peptides-reviews', 'review'],
    ['/tools/price-per-mg', 'tool'],
    ['/tools/calculator', 'tool'],
    ['/tools/intranasal', 'tool'],
    ['/tools/coa-reader', 'article'],
    ['/guides/how-to-read-a-coa', 'article'],
    ['/about', 'about'],
    ['/contact', 'contact'],
    ['/faqs', 'default'],
    ['/privacy', 'default'],
    ['/price-checker', 'default'],
  ])('%s is %s', (path, kind) => {
    expect(pageKindForPath(path)).toBe(kind);
  });

  it('gives new routes inside a section that section type, and anything else the default', () => {
    expect(pageKindForPath('/tools/dilution')).toBe('tool');
    expect(pageKindForPath('/guides/new-guide')).toBe('article');
    expect(pageKindForPath('/blog/first-post')).toBe('article');
    expect(pageKindForPath('/brand-new-page')).toBe('default');
  });

  it('ignores query strings and trailing slashes', () => {
    expect(pageKindForPath('/suppliers/?page=2')).toBe('collection');
    expect(cleanPath('/tools/calculator/?x=1#top')).toBe('/tools/calculator');
    expect(cleanPath('')).toBe('/');
  });

  it('maps kinds to WebPage types', () => {
    expect(webPageTypeFor(pageKindForPath('/suppliers'))).toBe('CollectionPage');
    expect(webPageTypeFor(pageKindForPath('/suppliers/x'))).toBe('ProfilePage');
    expect(webPageTypeFor(pageKindForPath('/about'))).toBe('AboutPage');
    expect(webPageTypeFor(pageKindForPath('/contact'))).toBe('ContactPage');
  });
});

describe('isSchemaExcluded', () => {
  it('excludes the watchlist and the outbound redirect only', () => {
    expect(isSchemaExcluded('/watchlist')).toBe(true);
    expect(isSchemaExcluded('/go')).toBe(true);
    expect(isSchemaExcluded('/suppliers')).toBe(false);
  });
});

describe('breadcrumbTrail', () => {
  it('is empty on the homepage', () => {
    expect(breadcrumbTrail('/', 'Peptide Price Comparison')).toEqual([]);
  });

  it('is Home then the page for top-level pages', () => {
    expect(breadcrumbTrail('/privacy', 'Privacy Policy')).toEqual([{ name: 'Home', path: '/' }, { name: 'Privacy Policy' }]);
  });

  it('puts compound pages under the price checker', () => {
    expect(breadcrumbTrail('/products/bpc-157', 'BPC-157')).toEqual([
      { name: 'Home', path: '/' },
      { name: 'Price Checker', path: '/price-checker' },
      { name: 'BPC-157' },
    ]);
  });

  it('drops one trailing full stop from the heading', () => {
    expect(breadcrumbTrail('/reviews', 'Supplier reviews.').at(-1)).toEqual({ name: 'Supplier reviews' });
  });
});

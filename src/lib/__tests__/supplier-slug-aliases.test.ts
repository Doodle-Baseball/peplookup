import { describe, expect, it } from 'vitest';
import { supplierSlugAliases } from '../seo';
import { publishedCoaLink } from '@/data/vendor-coa-links';

const redirect = (fromPath: string, toPath: string) => ({ fromPath, toPath, createdAt: '2026-09-23T00:00:00.000Z' });

describe('supplierSlugAliases', () => {
  it('maps a renamed supplier to every slug it has had', () => {
    const aliases = supplierSlugAliases([
      redirect('/suppliers/amino-club-2', '/suppliers/amino-club'),
      redirect('/suppliers/amino-club-old', '/suppliers/amino-club-2'),
      redirect('/products/bpc', '/products/bpc-157'),
    ]);
    expect(aliases.get('amino-club')?.sort()).toEqual(['amino-club-2', 'amino-club-old']);
    expect(aliases.has('bpc-157')).toBe(false);
  });
});

describe('publishedCoaLink after a rename', () => {
  const listing = { supplierSlug: 'amino-club', productSlug: 'retatrutide', form: 'vial' as const, vialSize: 30000 };

  it('still finds the vendor COA page written for the old slug', () => {
    expect(publishedCoaLink(listing)).toBeNull();
    expect(publishedCoaLink(listing, ['amino-club-2'])).toBe('https://www.aminoclub.com/us/coa');
  });
});

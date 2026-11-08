import { describe, expect, it } from 'vitest';
import { chooseImageFileName, isOwnImageUrl, isPrivateAddress, OFFER_IMAGE_BUCKET } from '../offer-images';

const SUPABASE = 'https://abc.supabase.co';
const ours = (file: string) => `${SUPABASE}/storage/v1/object/public/${OFFER_IMAGE_BUCKET}/${file}`;

describe('chooseImageFileName', () => {
  it('names the file {supplier-slug}-{product-slug}.webp', () => {
    expect(chooseImageFileName('idun-peptides', 'bpc-157-tb-500', 'https://x.test/a.png', [])).toBe('idun-peptides-bpc-157-tb-500.webp');
  });

  it('keeps the plain name when the same source already holds it', () => {
    const siblings = [{ imageUrl: ours('idun-peptides-bpc-157.webp?v=1'), imageSourceUrl: 'https://x.test/a.png' }];
    expect(chooseImageFileName('idun-peptides', 'bpc-157', 'https://x.test/a.png', siblings)).toBe('idun-peptides-bpc-157.webp');
  });

  it("gives a different picture of the same supplier's compound its own name instead of overwriting", () => {
    const siblings = [{ imageUrl: ours('crownwell-research-retatrutide.webp?v=1'), imageSourceUrl: 'https://x.test/10mg.png' }];
    const name = chooseImageFileName('crownwell-research', 'retatrutide', 'https://x.test/20mg.png', siblings);
    expect(name).not.toBe('crownwell-research-retatrutide.webp');
    expect(name).toMatch(/^crownwell-research-retatrutide-[0-9a-f]{8}\.webp$/);
  });

  it('ignores siblings whose picture is still at the supplier', () => {
    const siblings = [{ imageUrl: 'https://supplier.test/a.png', imageSourceUrl: null }];
    expect(chooseImageFileName('s', 'p', 'https://x.test/b.png', siblings)).toBe('s-p.webp');
  });
});

describe('isOwnImageUrl', () => {
  it('recognises a picture in our bucket, with or without its cache-busting query', () => {
    expect(isOwnImageUrl(ours('a-b.webp'), SUPABASE)).toBe(true);
    expect(isOwnImageUrl(ours('a-b.webp?v=1234abcd'), SUPABASE)).toBe(true);
  });

  it('does not treat a supplier URL, another bucket or a lookalike host as ours', () => {
    expect(isOwnImageUrl('https://idunpeptides.com/wp-content/uploads/a.webp', SUPABASE)).toBe(false);
    expect(isOwnImageUrl(`${SUPABASE}/storage/v1/object/public/guide-images/a.webp`, SUPABASE)).toBe(false);
    expect(isOwnImageUrl(`https://abc.supabase.co.evil.test/storage/v1/object/public/${OFFER_IMAGE_BUCKET}/a.webp`, SUPABASE)).toBe(false);
    expect(isOwnImageUrl('not a url', SUPABASE)).toBe(false);
  });
});

describe('isPrivateAddress', () => {
  it('refuses loopback, private, link-local and carrier-grade addresses', () => {
    for (const address of ['127.0.0.1', '10.1.2.3', '172.16.0.1', '172.31.255.255', '192.168.1.1', '169.254.169.254', '100.64.0.1', '0.0.0.0', '::1', 'fd00::1', 'fe80::1', '::ffff:10.0.0.1']) {
      expect(isPrivateAddress(address), address).toBe(true);
    }
  });

  it('allows ordinary public addresses', () => {
    for (const address of ['8.8.8.8', '172.32.0.1', '172.15.255.255', '104.21.5.6', '2606:4700::1111']) {
      expect(isPrivateAddress(address), address).toBe(false);
    }
  });
});

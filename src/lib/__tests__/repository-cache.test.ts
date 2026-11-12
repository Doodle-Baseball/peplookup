import { beforeEach, describe, expect, it, vi } from 'vitest';
import { products as seedProducts } from '@/data/products';
import { suppliers as seedSuppliers } from '@/data/suppliers';
import type { Offer, Product, Supplier } from '@/lib/schema';

const mocks = vi.hoisted(() => ({
  client: {} as object | null,
  fetchProductsFromDb: vi.fn(),
  fetchProductFromDb: vi.fn(),
  fetchSuppliersFromDb: vi.fn(),
  fetchSupplierFromDb: vi.fn(),
  fetchOffersFromDb: vi.fn(),
  fetchGuidesFromDb: vi.fn(),
  fetchSupplierReviewsFromDb: vi.fn(),
}));

// Behaves like Next's data cache for the one thing these tests care about: a
// value that resolves is remembered per set of arguments, one that throws is not.
vi.mock('next/cache', () => ({
  unstable_cache: <Args extends unknown[], T>(read: (...args: Args) => Promise<T>) => {
    const stored = new Map<string, { value: T }>();
    return async (...args: Args) => {
      const key = JSON.stringify(args);
      const hit = stored.get(key);
      if (hit) return hit.value;
      const value = await read(...args);
      stored.set(key, { value });
      return value;
    };
  },
}));
vi.mock('../supabase/server', () => ({ getSupabaseServerClient: () => mocks.client }));
vi.mock('../supabase/products', () => ({
  fetchProductsFromDb: mocks.fetchProductsFromDb,
  fetchProductFromDb: mocks.fetchProductFromDb,
}));
vi.mock('../supabase/suppliers', () => ({
  fetchSuppliersFromDb: mocks.fetchSuppliersFromDb,
  fetchSupplierFromDb: mocks.fetchSupplierFromDb,
}));
vi.mock('../supabase/offers', async (importOriginal) => ({
  ...(await importOriginal<typeof import('../supabase/offers')>()),
  fetchOffersFromDb: mocks.fetchOffersFromDb,
}));
vi.mock('../supabase/guides', () => ({ fetchGuidesFromDb: mocks.fetchGuidesFromDb }));
vi.mock('../supabase/supplier-reviews', () => ({ fetchSupplierReviewsFromDb: mocks.fetchSupplierReviewsFromDb }));
vi.mock('@/lib/seo-redirects', () => ({ getSupplierSlugAliases: async () => new Map<string, string[]>() }));

const dbProduct: Product = { ...seedProducts[0]!, slug: 'db-compound', name: 'From the database' };
const dbSupplier: Supplier = { ...seedSuppliers[0]!, slug: 'db-vendor', name: 'Database Vendor' };
const dbOffer: Offer = {
  supplierSlug: 'db-vendor',
  productSlug: 'db-compound',
  form: 'vial',
  vialSize: 10_000,
  vialCount: 1,
  listPrice: 1999,
  salePrice: null,
  currency: 'USD',
  inStock: true,
  productUrl: 'https://example.com/p',
  imageUrl: null,
  labReport: null,
  scrapedAt: '2026-09-14T00:00:00.000Z',
};

/** The database answers each slice of the offers table with these rows, and an empty slice otherwise. */
function offersInShards(byShard: Record<number, Offer[]>) {
  mocks.fetchOffersFromDb.mockImplementation(async (_client: unknown, shard: number) => byShard[shard] ?? []);
}

/** A new copy of the repository, so each case starts with empty caches. */
async function freshRepository() {
  vi.resetModules();
  return import('../repository');
}

beforeEach(() => {
  mocks.client = {};
  for (const mock of [
    mocks.fetchProductsFromDb,
    mocks.fetchProductFromDb,
    mocks.fetchSuppliersFromDb,
    mocks.fetchSupplierFromDb,
    mocks.fetchOffersFromDb,
    mocks.fetchGuidesFromDb,
    mocks.fetchSupplierReviewsFromDb,
  ]) {
    mock.mockReset();
  }
});

describe('a Supabase outage while a cache fills', () => {
  it('serves the seed catalogue for that call without storing it as the answer', async () => {
    const repository = await freshRepository();
    mocks.fetchProductsFromDb.mockResolvedValueOnce(null);
    expect((await repository.getProducts()).map((p) => p.slug)).toEqual(seedProducts.map((p) => p.slug));

    mocks.fetchProductsFromDb.mockResolvedValueOnce([dbProduct]);
    expect((await repository.getProducts()).map((p) => p.slug)).toEqual(['db-compound']);
  });

  it('does the same for suppliers', async () => {
    const repository = await freshRepository();
    mocks.fetchSuppliersFromDb.mockResolvedValueOnce(null);
    expect((await repository.getSuppliers()).length).toBeGreaterThan(0);

    mocks.fetchSuppliersFromDb.mockResolvedValueOnce([dbSupplier]);
    expect((await repository.getSuppliers()).map((s) => s.slug)).toEqual(['db-vendor']);
  });

  it('shows no database offers during the outage and picks them up as soon as it ends', async () => {
    const repository = await freshRepository();
    mocks.fetchOffersFromDb.mockResolvedValue(null);
    expect(await repository.getAllOffers()).toEqual([]);

    offersInShards({ 0: [dbOffer] });
    expect((await repository.getAllOffers()).map((o) => o.productSlug)).toEqual(['db-compound']);
  });

  it('remembers a healthy read, so the database is asked once', async () => {
    const repository = await freshRepository();
    mocks.fetchProductsFromDb.mockResolvedValue([dbProduct]);
    await repository.getProducts();
    await repository.getProducts();
    expect(mocks.fetchProductsFromDb).toHaveBeenCalledTimes(1);
  });
});

describe('looking up one compound or vendor', () => {
  it('answers a compound that is in the cached catalogue without a query of its own', async () => {
    const repository = await freshRepository();
    mocks.fetchProductsFromDb.mockResolvedValue([dbProduct]);

    expect((await repository.getProduct('db-compound'))?.name).toBe('From the database');
    expect(mocks.fetchProductFromDb).not.toHaveBeenCalled();
  });

  it('still reads a compound that is not in the cached catalogue straight from the database', async () => {
    const repository = await freshRepository();
    mocks.fetchProductsFromDb.mockResolvedValue([dbProduct]);
    mocks.fetchProductFromDb.mockResolvedValue({ ...dbProduct, slug: 'just-added', name: 'Just added' });

    expect((await repository.getProduct('just-added'))?.name).toBe('Just added');
    expect(mocks.fetchProductFromDb).toHaveBeenCalledWith(mocks.client, 'just-added');
  });

  it('returns null for a compound that exists nowhere', async () => {
    const repository = await freshRepository();
    mocks.fetchProductsFromDb.mockResolvedValue([dbProduct]);
    mocks.fetchProductFromDb.mockResolvedValue(null);

    expect(await repository.getProduct('nope')).toBeNull();
  });

  it('answers a vendor in the directory without a query of its own', async () => {
    const repository = await freshRepository();
    mocks.fetchSuppliersFromDb.mockResolvedValue([dbSupplier]);

    expect((await repository.getSupplier('db-vendor'))?.name).toBe('Database Vendor');
    expect(mocks.fetchSupplierFromDb).not.toHaveBeenCalled();
  });

  it('still reads a vendor missing from the directory, such as an inactive one, from the database', async () => {
    const repository = await freshRepository();
    mocks.fetchSuppliersFromDb.mockResolvedValue([dbSupplier]);
    mocks.fetchSupplierFromDb.mockResolvedValue({ ...dbSupplier, slug: 'paused-vendor', name: 'Paused Vendor', isActive: false });

    expect((await repository.getSupplier('paused-vendor'))?.name).toBe('Paused Vendor');
    expect(mocks.fetchSupplierFromDb).toHaveBeenCalledWith(mocks.client, 'paused-vendor');
  });
});

describe('counting listings per vendor', () => {
  it('groups every offer by vendor in one pass, matching the per-vendor count', async () => {
    const repository = await freshRepository();
    offersInShards({
      0: [dbOffer, { ...dbOffer, form: 'capsule' }],
      5: [{ ...dbOffer, supplierSlug: 'other-vendor' }],
    });

    const counts = await repository.countProductsBySupplier();
    expect(counts.get('db-vendor')).toBe(await repository.countProductsForSupplier('db-vendor'));
    expect(counts.get('db-vendor')).toBe(2);
    expect(counts.get('other-vendor')).toBe(1);
    expect(counts.get('no-listings')).toBeUndefined();
  });
});

describe('reading the offers table in slices', () => {
  it('reads every slice once and serves them as one list, newest first', async () => {
    const repository = await freshRepository();
    offersInShards({
      1: [{ ...dbOffer, id: '2a', productSlug: 'older', scrapedAt: '2026-09-01T00:00:00.000Z' }],
      6: [
        { ...dbOffer, id: 'd1', productSlug: 'newest', scrapedAt: '2026-10-01T00:00:00.000Z' },
        { ...dbOffer, id: 'd2', productSlug: 'tie-later-id', scrapedAt: '2026-09-01T00:00:00+00:00' },
      ],
    });

    expect((await repository.getAllOffers()).map((o) => o.productSlug)).toEqual(['newest', 'older', 'tie-later-id']);
    await repository.getAllOffers();
    expect(mocks.fetchOffersFromDb.mock.calls.map(([, shard]) => shard)).toEqual([0, 1, 2, 3, 4, 5, 6, 7]);
  });

  it('serves no partial list when one slice fails, and stores the slices that worked', async () => {
    const repository = await freshRepository();
    mocks.fetchOffersFromDb.mockImplementation(async (_client: unknown, shard: number) => (shard === 3 ? null : [dbOffer]));
    expect(await repository.getAllOffers()).toEqual([]);

    offersInShards({ 3: [{ ...dbOffer, productSlug: 'back-again' }] });
    expect((await repository.getAllOffers()).map((o) => o.productSlug)).toContain('back-again');
  });
});

describe('reading the stored reviews of a vendor', () => {
  const supplier = { slug: 'db-vendor', name: 'Database Vendor', homepageUrl: 'https://db-vendor.example' };
  const stored = [{ id: 'r1', author: 'A. Reader', rating: 5, body: 'Arrived quickly.', reviewedAt: null }];

  it('asks the database once per vendor however many page views follow', async () => {
    const repository = await freshRepository();
    mocks.fetchSupplierReviewsFromDb.mockResolvedValue(stored);

    expect(await repository.getSupplierReviews(supplier)).toEqual(stored);
    expect(await repository.getSupplierReviews(supplier)).toEqual(stored);
    expect(mocks.fetchSupplierReviewsFromDb).toHaveBeenCalledTimes(1);

    await repository.getSupplierReviews({ ...supplier, slug: 'another-vendor' });
    expect(mocks.fetchSupplierReviewsFromDb).toHaveBeenCalledTimes(2);
    expect(mocks.fetchSupplierReviewsFromDb).toHaveBeenLastCalledWith(mocks.client, 'another-vendor');
  });

  it('does not store a failed read, so the next view asks again', async () => {
    const repository = await freshRepository();
    mocks.fetchSupplierReviewsFromDb.mockResolvedValueOnce(null);
    expect(await repository.getSupplierReviews(supplier)).toEqual([]);

    mocks.fetchSupplierReviewsFromDb.mockResolvedValueOnce(stored);
    expect(await repository.getSupplierReviews(supplier)).toEqual(stored);
  });

  it('reads as no reviews without a database connection', async () => {
    const repository = await freshRepository();
    mocks.client = null;
    expect(await repository.getSupplierReviews(supplier)).toEqual([]);
    expect(mocks.fetchSupplierReviewsFromDb).not.toHaveBeenCalled();
  });
});

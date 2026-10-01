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
}));

// Behaves like Next's data cache for the one thing these tests care about: a
// value that resolves is remembered, one that throws is not.
vi.mock('next/cache', () => ({
  unstable_cache: <T>(read: () => Promise<T>) => {
    let stored: { value: T } | null = null;
    return async () => {
      if (stored) return stored.value;
      const value = await read();
      stored = { value };
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
vi.mock('../supabase/offers', () => ({ fetchOffersFromDb: mocks.fetchOffersFromDb }));
vi.mock('../supabase/guides', () => ({ fetchGuidesFromDb: mocks.fetchGuidesFromDb }));
vi.mock('../supabase/supplier-reviews', () => ({ fetchSupplierReviewsFromDb: vi.fn() }));
vi.mock('@/lib/seo', () => ({ getSupplierSlugAliases: async () => new Map<string, string[]>() }));

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
    mocks.fetchOffersFromDb.mockResolvedValueOnce(null);
    expect(await repository.getAllOffers()).toEqual([]);

    mocks.fetchOffersFromDb.mockResolvedValueOnce([dbOffer]);
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

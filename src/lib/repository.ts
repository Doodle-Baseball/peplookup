import { offers } from '@/data/offers';
import { products } from '@/data/products';
import { suppliers } from '@/data/suppliers';
import type { Offer, Product, Supplier } from './schema';
import { type Listing, mcg } from './price';
import { cents } from './money';

/**
 * Every accessor is async so the backing store can move to Supabase without
 * touching a single call site. Swap the bodies for queries against
 * NEXT_PUBLIC_SUPABASE_URL when the service key is available.
 */

export async function getSuppliers(): Promise<readonly Supplier[]> {
  return suppliers;
}

export async function getSupplier(slug: string): Promise<Supplier | null> {
  return suppliers.find((s) => s.slug === slug) ?? null;
}

export async function getProducts(): Promise<readonly Product[]> {
  return products;
}

export async function getProduct(slug: string): Promise<Product | null> {
  return products.find((p) => p.slug === slug) ?? null;
}

export async function getOffersForProduct(productSlug: string): Promise<readonly Offer[]> {
  return offers.filter((o) => o.productSlug === productSlug);
}

export async function getOffersForSupplier(supplierSlug: string): Promise<readonly Offer[]> {
  return offers.filter((o) => o.supplierSlug === supplierSlug);
}

export async function countProductsForSupplier(supplierSlug: string): Promise<number> {
  return offers.filter((o) => o.supplierSlug === supplierSlug).length;
}

/** Adapt a stored offer into the shape the price math consumes. */
export function toListing(offer: Offer): Listing {
  return {
    supplierSlug: offer.supplierSlug,
    productSlug: offer.productSlug,
    listPrice: cents(offer.listPrice),
    salePrice: offer.salePrice === null ? null : cents(offer.salePrice),
    currency: offer.currency,
    vialSize: mcg(offer.vialSize),
    vialCount: offer.vialCount,
    inStock: offer.inStock,
    scrapedAt: offer.scrapedAt,
    url: offer.productUrl,
  };
}

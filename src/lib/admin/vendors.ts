import 'server-only';
import { getSupabaseServerClient } from '@/lib/supabase/server';
import {
  fetchSuppliersFromDb,
  fetchSupplierFromDb,
  vendorInputToInsertRow,
  type VendorInput,
} from '@/lib/supabase/suppliers';
import { replaceSupplierReviewsInDb } from '@/lib/supabase/supplier-reviews';
import { faviconUrl } from '@/lib/favicon';
import { resolveAffiliateUrl } from '@/data/vendor-affiliate-links';
import { lookupDomainRegisteredAt } from '@/lib/whois';
import type { Supplier, SupplierReview } from '@/lib/schema';
import { getSupplierSlugsWithReviews, orderSuppliersForDisplay } from '@/lib/repository';

export class AdminDbError extends Error {}

function requireClient() {
  const client = getSupabaseServerClient();
  if (!client) {
    throw new AdminDbError(
      'Supabase is not configured, set SUPABASE_SECRET_KEY and NEXT_PUBLIC_SUPABASE_URL.',
    );
  }
  return client;
}

function slugify(name: string): string {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

/**
 * Same order as the public /suppliers directory (see `orderSuppliersForDisplay`):
 * a dragged position wins outright, Featured and the reviews/coupon score
 * only rank the rest. Vendors here include inactive ones (the admin needs to
 * see and reactivate them), so this can't just call the public
 * `getSuppliers()`, which filters those out; the ordering is applied on top
 * of the full list instead.
 */
export async function listVendors(query?: string): Promise<Supplier[]> {
  const client = requireClient();
  // Independent reads, so they overlap rather than queueing one round trip
  // behind the other.
  const [suppliers, slugsWithReviews] = await Promise.all([
    fetchSuppliersFromDb(client, { includeInactive: true }),
    getSupplierSlugsWithReviews(),
  ]);
  if (suppliers === null) {
    throw new AdminDbError(
      'The suppliers table could not be read. Run supabase/migrations/0001_suppliers.sql in the Supabase SQL editor first.',
    );
  }

  const ordered = orderSuppliersForDisplay(suppliers, slugsWithReviews);

  const q = query?.trim().toLowerCase();
  if (!q) return ordered;
  return ordered.filter((s) => s.name.toLowerCase().includes(q));
}

export async function getVendor(slug: string): Promise<Supplier | null> {
  const suppliers = await listVendors();
  return suppliers.find((s) => s.slug === slug) ?? null;
}

/** Generates a unique slug from the vendor name, appending -2, -3, … on collision. */
async function uniqueSlugFor(name: string, client = requireClient()): Promise<string> {
  const base = slugify(name);
  if (!base) throw new AdminDbError('Vendor name must contain at least one letter or number.');
  let candidate = base;
  let suffix = 2;
  for (;;) {
    const { data } = await client.from('suppliers').select('slug').eq('slug', candidate).maybeSingle();
    if (!data) return candidate;
    candidate = `${base}-${suffix}`;
    suffix += 1;
  }
}

export async function createVendor(input: VendorInput): Promise<Supplier> {
  const client = requireClient();
  const slug = await uniqueSlugFor(input.name, client);
  // Best-effort: a WHOIS timeout or parse failure must never block saving
  // the vendor, so this only ever adds data, never blocks the write.
  const domainRegisteredAt = await lookupDomainRegisteredAt(input.homepageUrl);
  const row = vendorInputToInsertRow(slug, {
    ...input,
    affiliateUrl: input.affiliateUrl || resolveAffiliateUrl(input.homepageUrl),
    faviconUrl: input.faviconUrl ?? faviconUrl(input.homepageUrl),
    domainRegisteredAt,
  });
  const { error } = await client.from('suppliers').insert(row);
  if (error) throw new AdminDbError(error.message);
  const created = await fetchSupplierFromDb(client, slug);
  if (!created) throw new AdminDbError('Vendor was created but could not be re-read.');
  return created;
}

export async function updateVendor(slug: string, input: VendorInput): Promise<void> {
  const client = requireClient();
  const domainRegisteredAt = await lookupDomainRegisteredAt(input.homepageUrl);
  const row = vendorInputToInsertRow(slug, {
    ...input,
    affiliateUrl: input.affiliateUrl || resolveAffiliateUrl(input.homepageUrl),
    faviconUrl: input.faviconUrl ?? faviconUrl(input.homepageUrl),
    // A failed re-lookup on edit shouldn't erase a value captured earlier.
    ...(domainRegisteredAt !== null ? { domainRegisteredAt } : {}),
  });
  const { slug: _slug, ...patch } = row;
  const { error } = await client.from('suppliers').update(patch).eq('slug', slug);
  if (error) throw new AdminDbError(error.message);
}

/**
 * Rewrites a vendor's reviews to exactly what the form submitted. Surfaces a
 * pointed message when the table hasn't been migrated yet, since the vendor
 * itself will already have saved by this point.
 */
export async function saveVendorReviews(slug: string, reviews: SupplierReview[]): Promise<void> {
  const client = requireClient();
  try {
    await replaceSupplierReviewsInDb(client, slug, reviews);
  } catch (error) {
    // With nothing to store, an unmigrated supplier_reviews table is simply an
    // unused feature, the vendor itself already saved, so don't fail the whole
    // submission over it. Only an admin who actually entered reviews needs to know.
    if (reviews.length === 0) return;
    throw new AdminDbError(
      `The vendor saved, but its reviews could not be written. Run supabase/migrations/0011_supplier_reviews.sql in the Supabase SQL editor. (${
        error instanceof Error ? error.message : 'unknown error'
      })`,
    );
  }
}

export async function setVendorActive(slug: string, isActive: boolean): Promise<void> {
  const client = requireClient();
  const { error } = await client.from('suppliers').update({ is_active: isActive }).eq('slug', slug);
  if (error) throw new AdminDbError(error.message);
}

export async function setVendorFeatured(slug: string, isFeatured: boolean): Promise<void> {
  const client = requireClient();
  const { error } = await client.from('suppliers').update({ is_featured: isFeatured }).eq('slug', slug);
  if (error) {
    if (error.message.includes('is_featured') || error.message.includes('schema cache')) {
      throw new AdminDbError(
        'Featured vendors need the is_featured column. Run supabase/migrations/0015_supplier_featured.sql in the Supabase SQL editor, then try again.',
      );
    }
    throw new AdminDbError(error.message);
  }
}

export async function refreshAllVendorImages(): Promise<number> {
  const client = requireClient();
  const { data, error } = await client
    .from('suppliers')
    .select('slug, homepage_url, logo_url, favicon_url')
    .not('homepage_url', 'is', null)
    .order('created_at', { ascending: false });

  if (error || !data) {
    throw new AdminDbError(error?.message ?? 'Could not load supplier website URLs.');
  }

  let updated = 0;
  for (const supplier of data) {
    const favicon = faviconUrl(supplier.homepage_url);
    const logoUrl = supplier.logo_url ?? favicon;
    const { error: updateError } = await client
      .from('suppliers')
      .update({
        logo_url: logoUrl,
        favicon_url: favicon,
      })
      .eq('slug', supplier.slug);

    if (!updateError) updated += 1;
  }

  return updated;
}

export async function deleteVendor(slug: string): Promise<void> {
  const client = requireClient();
  const { error } = await client.from('suppliers').delete().eq('slug', slug);
  if (error) throw new AdminDbError(error.message);
}

/**
 * The coupon columns exactly as stored. `Supplier.coupon` only exists when
 * both the code and the percentage are set, so a vendor saved with a code but
 * no percentage looked couponless in the admin, and saving its form then
 * dropped the code. The admin reads these raw values instead.
 */
export async function getStoredCoupon(slug: string): Promise<{ code: string | null; percentOff: number | null }> {
  const { data, error } = await requireClient()
    .from('suppliers')
    .select('coupon_code, coupon_percent_off')
    .eq('slug', slug)
    .maybeSingle();
  if (error) throw new AdminDbError(error.message);
  const row = data as { coupon_code: string | null; coupon_percent_off: number | null } | null;
  return { code: row?.coupon_code ?? null, percentOff: row?.coupon_percent_off ?? null };
}

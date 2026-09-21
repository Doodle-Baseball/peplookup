import 'server-only';
import { getSupabaseServerClient } from '@/lib/supabase/server';
import {
  fetchSupplierReviewsFromDb,
  replaceSupplierReviewsInDb,
} from '@/lib/supabase/supplier-reviews';
import { fetchSuppliersFromDb } from '@/lib/supabase/suppliers';
import { AdminDbError } from '@/lib/admin/vendors';
import { trustpilotDomain, type ParsedVendorReviews } from '@/lib/review-import';
import type { Supplier, SupplierReview } from '@/lib/schema';

const MISSING_TABLE_HINT =
  'The supplier_reviews table is not there yet. Run supabase/migrations/0011_supplier_reviews.sql in the Supabase SQL editor first.';

function requireClient() {
  const client = getSupabaseServerClient();
  if (!client) {
    throw new AdminDbError(
      'Supabase is not configured, set SUPABASE_SECRET_KEY and NEXT_PUBLIC_SUPABASE_URL.',
    );
  }
  return client;
}

export interface VendorReviewSummary {
  slug: string;
  name: string;
  reviewCount: number;
}

/** Every vendor plus how many reviews it currently has stored. */
export async function listVendorsWithReviewCounts(): Promise<VendorReviewSummary[]> {
  const client = requireClient();
  const suppliers = await fetchSuppliersFromDb(client, { includeInactive: true });
  if (suppliers === null) throw new AdminDbError('The suppliers table could not be read.');

  const { data, error } = await client.from('supplier_reviews').select('supplier_slug');
  // A missing table is not fatal here: the page still lists vendors, each with
  // zero reviews, and the first write is what surfaces the migration hint.
  const counts = new Map<string, number>();
  if (!error && data) {
    for (const row of data as { supplier_slug: string }[]) {
      counts.set(row.supplier_slug, (counts.get(row.supplier_slug) ?? 0) + 1);
    }
  }

  return suppliers
    .map((s) => ({ slug: s.slug, name: s.name, reviewCount: counts.get(s.slug) ?? 0 }))
    .sort((a, b) => a.name.localeCompare(b.name));
}

export async function getReviewsForVendor(slug: string): Promise<SupplierReview[]> {
  const client = requireClient();
  return (await fetchSupplierReviewsFromDb(client, slug)) ?? [];
}

async function writeReviews(slug: string, reviews: SupplierReview[]): Promise<void> {
  const client = requireClient();
  try {
    await replaceSupplierReviewsInDb(client, slug, reviews);
  } catch (error) {
    throw new AdminDbError(
      `${MISSING_TABLE_HINT} (${error instanceof Error ? error.message : 'unknown error'})`,
    );
  }
}

/** Appends one review to the end of a vendor's list. */
export async function addReviewToVendor(slug: string, review: SupplierReview): Promise<number> {
  const existing = await getReviewsForVendor(slug);
  const next = [...existing, review];
  await writeReviews(slug, next);
  return next.length;
}

export async function replaceReviewsForVendor(slug: string, reviews: SupplierReview[]): Promise<void> {
  await writeReviews(slug, reviews);
}

export interface ReviewImportOutcome {
  vendorName: string;
  matchedSlug: string | null;
  matchedBy: 'name' | 'website' | null;
  reviewCount: number;
  status: 'imported' | 'no-vendor' | 'no-reviews' | 'failed';
  detail?: string;
}

function normalizeName(name: string): string {
  return name.toLowerCase().replace(/[^a-z0-9]/g, '');
}

function hostOf(url: string | null | undefined): string | null {
  if (!url) return null;
  try {
    return new URL(url).hostname.replace(/^www\./, '').toLowerCase();
  } catch {
    return null;
  }
}

/**
 * Matches each parsed row to a vendor by name, then by website domain (several
 * vendors are listed on Trustpilot under a different display name than the
 * catalogue uses), and replaces that vendor's stored reviews.
 *
 * Rows with no matching vendor are reported rather than dropped silently,
 * they stay available to import once the vendor is added.
 */
export async function importVendorReviews(
  parsed: ParsedVendorReviews[],
): Promise<{ outcomes: ReviewImportOutcome[]; imported: number }> {
  const client = requireClient();
  const suppliers = await fetchSuppliersFromDb(client, { includeInactive: true });
  if (suppliers === null) throw new AdminDbError('The suppliers table could not be read.');

  const byName = new Map<string, Supplier>(suppliers.map((s) => [normalizeName(s.name), s]));
  const byHost = new Map<string, Supplier>(
    suppliers.flatMap((s) => {
      const host = hostOf(s.homepageUrl);
      return host ? [[host, s] as const] : [];
    }),
  );

  const outcomes: ReviewImportOutcome[] = [];
  let imported = 0;

  for (const row of parsed) {
    let match = byName.get(normalizeName(row.vendorName)) ?? null;
    let matchedBy: ReviewImportOutcome['matchedBy'] = match ? 'name' : null;

    if (!match && row.trustpilotUrl) {
      const domain = trustpilotDomain(row.trustpilotUrl);
      if (domain) {
        match = byHost.get(domain) ?? null;
        if (match) matchedBy = 'website';
      }
    }

    if (!match) {
      outcomes.push({
        vendorName: row.vendorName,
        matchedSlug: null,
        matchedBy: null,
        reviewCount: row.reviews.length,
        status: 'no-vendor',
        detail: 'No vendor with this name or website. Add the vendor, then re-import.',
      });
      continue;
    }

    if (row.reviews.length === 0) {
      outcomes.push({
        vendorName: row.vendorName,
        matchedSlug: match.slug,
        matchedBy,
        reviewCount: 0,
        status: 'no-reviews',
        detail: row.problems.join('; ') || 'No usable reviews in this row.',
      });
      continue;
    }

    try {
      await replaceReviewsForVendor(match.slug, row.reviews);
      // The vendor's headline score and profile link travel with its reviews.
      const patch: Record<string, unknown> = {};
      if (row.rating !== null) patch.review_rating = row.rating;
      if (row.trustpilotUrl) patch.reviews_url = row.trustpilotUrl;
      if (Object.keys(patch).length > 0) {
        await client.from('suppliers').update(patch).eq('slug', match.slug);
      }
      imported += row.reviews.length;
      outcomes.push({
        vendorName: row.vendorName,
        matchedSlug: match.slug,
        matchedBy,
        reviewCount: row.reviews.length,
        status: 'imported',
        detail: row.problems.join('; ') || undefined,
      });
    } catch (error) {
      outcomes.push({
        vendorName: row.vendorName,
        matchedSlug: match.slug,
        matchedBy,
        reviewCount: row.reviews.length,
        status: 'failed',
        detail: error instanceof Error ? error.message : 'Unknown error.',
      });
    }
  }

  return { outcomes, imported };
}

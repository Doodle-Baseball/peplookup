import 'server-only';
import { getSupabaseServerClient } from '@/lib/supabase/server';
import { fetchReviewPageContentFromDb, saveReviewPageContentInDb } from '@/lib/supabase/review-page-content';
import { AdminDbError } from '@/lib/admin/vendors';
import { listVendorsWithReviewCounts } from '@/lib/admin/reviews';
import { getSeoDashboardData, type SeoEntry } from '@/lib/admin/seo';
import { getSupplier, getSuppliers } from '@/lib/repository';
import { ratingSourceLabel } from '@/lib/review-pages';
import {
  defaultReviewPageContent,
  resolveReviewPageContent,
  type ReviewPageContent,
  type ReviewPageContentOverride,
} from '@/lib/review-page-content';
import { formatReviewCount } from '@/lib/format';
import type { Supplier } from '@/lib/schema';

const CONTENT_MIGRATION = 'supabase/migrations/0024_review_page_content.sql';

const MISSING_TABLE_MESSAGE = `The review page text table is not set up yet. Run ${CONTENT_MIGRATION} in the Supabase SQL editor, then reload this page.`;

function requireClient() {
  const client = getSupabaseServerClient();
  if (!client) {
    throw new AdminDbError('Supabase is not configured. Set SUPABASE_SECRET_KEY and NEXT_PUBLIC_SUPABASE_URL.');
  }
  return client;
}

export interface ReviewPageSummary {
  entry: SeoEntry;
  vendorName: string;
  logoUrl: string | null;
  /** Out of 5; null when no rating is on record. */
  rating: number | null;
  reviewCountText: string | null;
  /** Individual reviews stored for this vendor. */
  storedReviews: number;
  /** True when this page's text has been edited here (a row exists in review_page_content). */
  contentCustomized: boolean;
}

export interface ReviewPagesData {
  pages: ReviewPageSummary[];
  /** Set when the SEO tables are missing; pages are still listed. */
  seoSetupError: string | null;
  /** Set when review_page_content is missing; the text can be read but not saved. */
  contentSetupError: string | null;
}

/** Every vendor's reviews page, with its SEO state, rating and whether its text has been customised. */
export async function getReviewPagesData(): Promise<ReviewPagesData> {
  const [seo, suppliers, saved, counts] = await Promise.all([
    getSeoDashboardData(),
    getSuppliers(),
    fetchReviewPageContentFromDb(requireClient()),
    listVendorsWithReviewCounts().catch(() => []),
  ]);
  const supplierBySlug = new Map(suppliers.map((supplier) => [supplier.slug, supplier]));
  const storedBySlug = new Map(counts.map((row) => [row.slug, row.reviewCount]));

  const pages: ReviewPageSummary[] = [];
  for (const entry of seo.entries) {
    if (entry.kind !== 'review' || entry.slug === null) continue;
    const supplier = supplierBySlug.get(entry.slug);
    if (!supplier) continue;
    pages.push({
      entry,
      vendorName: supplier.name,
      logoUrl: supplier.logoUrl ?? supplier.faviconUrl,
      rating: supplier.reviewRating,
      reviewCountText: formatReviewCount(supplier.reviewCount),
      storedReviews: storedBySlug.get(entry.slug) ?? 0,
      contentCustomized: saved?.has(entry.slug) ?? false,
    });
  }

  return {
    pages,
    seoSetupError: seo.setupError,
    contentSetupError: saved === null ? MISSING_TABLE_MESSAGE : null,
  };
}

export interface ReviewPageEditData {
  supplier: Supplier;
  defaults: ReviewPageContent;
  /** What the form starts with: saved text where there is some, generated text elsewhere. */
  current: ReviewPageContent;
  customized: boolean;
  contentSetupError: string | null;
}

export async function getReviewPageEditData(slug: string): Promise<ReviewPageEditData | null> {
  const supplier = await getSupplier(slug);
  if (!supplier) return null;
  const saved = await fetchReviewPageContentFromDb(requireClient());
  const override = saved?.get(slug) ?? null;
  const defaults = defaultReviewPageContent(supplier, ratingSourceLabel(supplier.reviewsUrl));
  return {
    supplier,
    defaults,
    current: resolveReviewPageContent(defaults, override),
    customized: override !== null,
    contentSetupError: saved === null ? MISSING_TABLE_MESSAGE : null,
  };
}

export async function saveReviewPageContent(slug: string, content: ReviewPageContentOverride): Promise<void> {
  const { error } = await saveReviewPageContentInDb(requireClient(), slug, content);
  if (!error) return;
  if (error.includes('review_page_content') || error.includes('schema cache')) {
    throw new AdminDbError(
      `Review page text needs the review_page_content table. Run ${CONTENT_MIGRATION} in the Supabase SQL editor, then try again.`,
    );
  }
  throw new AdminDbError(error);
}

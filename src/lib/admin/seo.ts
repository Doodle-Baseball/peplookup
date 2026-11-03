import 'server-only';
import { getSupabaseServerClient } from '@/lib/supabase/server';
import { fetchProductIdentitiesFromDb } from '@/lib/supabase/products';
import { fetchSuppliersFromDb } from '@/lib/supabase/suppliers';
import { STATIC_SEO_PAGES } from '@/config/seo-pages';
import {
  getAllOffers,
  getGuides,
  getSupplier,
  getSupplierSlugsWithReviews,
  getSuppliers,
  supplierHasReviews,
} from '@/lib/repository';
import {
  compoundSeoDefaults,
  couponPageSeoDefaults,
  guideSeoDefaults,
  reviewsPageSeoDefaults,
  supplierSeoDefaults,
  type SeoDefaults,
} from '@/lib/seo-defaults';
import {
  indexDecisionFor,
  rowToSeoOverride,
  rowToSeoRedirect,
  type SeoOverride,
  type SeoPageRow,
  type SeoRedirect,
  type SeoTaskStatus,
} from '@/lib/seo';
import { getPageQualityIndex } from '@/lib/seo/page-quality';
import { daysSince, type IndexDecision } from '@/lib/seo/indexing';
import { QUALITY_THRESHOLDS } from '@/config/seo-quality';
import type { Offer } from '@/lib/schema';
import { AdminDbError } from '@/lib/admin/vendors';
import { fetchPageFaqsFromDb } from '@/lib/supabase/page-faqs';
import {
  DEFAULT_PAGE_FAQS,
  defaultCouponFaqs,
  defaultGuideFaqs,
  defaultReviewFaqs,
  defaultSupplierFaqs,
  type FaqItem,
} from '@/data/default-page-faqs';
import { supplierSlugFromCouponPath } from '@/lib/coupon-pages';
import { ratingSourceLabel, supplierSlugFromReviewsPath } from '@/lib/review-pages';
import { formatReviewCount } from '@/lib/format';
import { listSavedSupplierContent } from '@/lib/admin/supplier-content';
import {
  defaultSupplierContent,
  supplierMarketStats,
  type SupplierContent,
  type SupplierContentOverride,
} from '@/lib/supplier-content';

const SEO_MIGRATION = 'supabase/migrations/0010_seo_management.sql';

export type SeoPageKind = 'static' | 'compound' | 'supplier' | 'guide' | 'coupon' | 'review';
// Static pages (including the home page) are deliberately excluded: they have
// no slug of their own to rename.
export type RenamableKind = Extract<SeoPageKind, 'compound' | 'supplier' | 'guide'>;

export const SLUG_PREFIX: Record<RenamableKind, string> = {
  compound: '/products/',
  supplier: '/suppliers/',
  guide: '/guides/',
};

export interface SeoEntry {
  path: string;
  kind: SeoPageKind;
  /** Section heading the card is grouped under, e.g. "Tools" or "Compounds". */
  group: string;
  name: string;
  /** Only set for pages whose slug can be renamed from the dashboard. */
  slug: string | null;
  defaults: SeoDefaults;
  override: SeoOverride | null;
  /**
   * FAQs saved for this page, or null when none are stored and the front end
   * is showing its built-in defaults.
   */
  faqs: FaqItem[] | null;
  /** What the page shows when nothing is saved, so the editor can seed from it. */
  defaultFaqs: FaqItem[];
  /** Supplier pages only: the About / Why / vs-other-suppliers boxes. Null for every other kind. */
  supplierContent: { saved: SupplierContentOverride | null; defaults: SupplierContent } | null;
  /** Whether the page is indexed, and which quality rules it fails, from src/lib/seo/indexing.ts. */
  indexing: IndexDecision;
}

/** B4 and B6: how fast pages are being made indexable, and whose prices have gone stale. */
export interface SeoQualitySummary {
  indexableCount: number;
  failingQualityCount: number;
  /** Pages whose "Ready to index" was ticked in the last 7 days. */
  madeIndexableLast7Days: number;
  /** True when that count is above the weekly limit, so pages are going live in bulk. */
  tooManyNewlyIndexable: boolean;
  /** Suppliers whose newest price is older than the stale threshold, oldest first. */
  stalePriceSuppliers: { slug: string; name: string; daysOld: number }[];
}

export interface SeoDashboardData {
  entries: SeoEntry[];
  redirects: SeoRedirect[];
  quality: SeoQualitySummary;
  /** Set when the SEO tables are missing; every page is still listed with its defaults. */
  setupError: string | null;
}

export interface SeoPageInput {
  metaTitle: string | null;
  metaDescription: string | null;
  h1: string | null;
  keywords: string[];
  canonicalUrl: string | null;
  ogImageUrl: string | null;
  robotsIndex: boolean;
  robotsFollow: boolean;
  headHtml: string | null;
  bodyHtml: string | null;
  /** The "Ready to index" tick (0031). */
  readyToIndex: boolean;
}

function requireClient() {
  const client = getSupabaseServerClient();
  if (!client) {
    throw new AdminDbError('Supabase is not configured. Set SUPABASE_SECRET_KEY and NEXT_PUBLIC_SUPABASE_URL.');
  }
  return client;
}

/**
 * A missing table or function has one fix, so say what it is. Matched on the
 * error code or Postgres' own wording, never on messages our functions raise
 * (e.g. 'Compound "x" does not exist.').
 */
function toSeoError(error: { message: string; code?: string }): AdminDbError {
  const missingSchema =
    ['PGRST202', 'PGRST204', 'PGRST205', '42P01', '42883'].includes(error.code ?? '') ||
    /schema cache|relation .* does not exist|function .* does not exist/i.test(error.message);
  if (!missingSchema) return new AdminDbError(error.message);
  return new AdminDbError(
    `The SEO tables aren't set up yet. Run ${SEO_MIGRATION} in the Supabase SQL editor, then reload this page. (${error.message})`,
  );
}

function defaultsOnly(defaults: SeoDefaults): SeoDefaults {
  return {
    path: defaults.path,
    title: defaults.title,
    description: defaults.description,
    h1: defaults.h1,
    ...(defaults.keywords ? { keywords: defaults.keywords } : {}),
  };
}

export async function getSeoDashboardData(): Promise<SeoDashboardData> {
  const client = requireClient();
  const [compounds, suppliers, pages, redirects, guides, offers, savedSupplierContent, publicSuppliers, slugsWithReviews] = await Promise.all([
    fetchProductIdentitiesFromDb(client),
    fetchSuppliersFromDb(client, { includeInactive: true }),
    client.from('seo_pages').select('*'),
    client.from('seo_redirects').select('from_path, to_path, created_at').order('created_at', { ascending: false }),
    getGuides(),
    getAllOffers(),
    listSavedSupplierContent(),
    getSuppliers(),
    getSupplierSlugsWithReviews(),
  ]);
  if (!compounds) throw new AdminDbError('The products table could not be read.');
  if (!suppliers) throw new AdminDbError('The suppliers table could not be read.');

  const setupError = pages.error
    ? toSeoError(pages.error).message
    : redirects.error
      ? toSeoError(redirects.error).message
      : null;

  const overrides = new Map(
    (pages.error ? [] : ((pages.data ?? []) as SeoPageRow[])).map((row) => [row.path, rowToSeoOverride(row)]),
  );
  const faqsByPath = (client ? await fetchPageFaqsFromDb(client) : null) ?? new Map<string, FaqItem[]>();
  // Compound pages keep their own FAQ field on the compound record, so that's
  // the one kind with no built-in set generated here.
  const supplierBySlug = new Map(suppliers.map((supplier) => [supplier.slug, supplier]));
  const guideByPath = new Map(guides.map((guide) => [`/guides/${guide.slug}`, guide]));
  const defaultFaqsFor = (path: string): FaqItem[] => {
    const stat = DEFAULT_PAGE_FAQS[path];
    if (stat) return [...stat];
    if (path.startsWith('/suppliers/')) {
      const supplier = supplierBySlug.get(path.slice('/suppliers/'.length));
      if (supplier) return defaultSupplierFaqs(supplier);
    }
    const couponSlug = supplierSlugFromCouponPath(path);
    if (couponSlug) {
      const supplier = supplierBySlug.get(couponSlug);
      if (supplier?.coupon) return defaultCouponFaqs({ name: supplier.name, coupon: supplier.coupon });
    }
    const reviewsSlug = supplierSlugFromReviewsPath(path);
    if (reviewsSlug) {
      const supplier = publicSupplierBySlug.get(reviewsSlug) ?? supplierBySlug.get(reviewsSlug);
      if (supplier) {
        return defaultReviewFaqs({
          name: supplier.name,
          reviewRating: supplier.reviewRating,
          reviewCountText: formatReviewCount(supplier.reviewCount),
          sourceLabel: ratingSourceLabel(supplier.reviewsUrl),
        });
      }
    }
    const guide = guideByPath.get(path);
    if (guide) return defaultGuideFaqs(guide);
    return [];
  };
  const publicSupplierBySlug = new Map(publicSuppliers.map((supplier) => [supplier.slug, supplier]));
  const supplierContentFor = (kind: SeoPageKind, slug: string | null): SeoEntry['supplierContent'] => {
    if (kind !== 'supplier' || !slug) return null;
    // The public page builds its text from the public supplier record (which
    // carries review profiles the raw row lacks), so the editor must seed from
    // the same one or "unchanged" text would read as an edit on save.
    const supplier = publicSupplierBySlug.get(slug) ?? supplierBySlug.get(slug);
    if (!supplier) return null;
    return {
      saved: savedSupplierContent.get(supplier.slug) ?? null,
      defaults: defaultSupplierContent(supplier, supplierMarketStats(supplier.slug, offers)),
    };
  };
  const quality = await getPageQualityIndex();
  const toEntry = (kind: SeoPageKind, group: string, name: string, slug: string | null, defaults: SeoDefaults) => ({
    path: defaults.path,
    kind,
    group,
    name,
    slug,
    defaults: defaultsOnly(defaults),
    override: overrides.get(defaults.path) ?? null,
    faqs: faqsByPath.get(defaults.path) ?? null,
    defaultFaqs: defaultFaqsFor(defaults.path),
    supplierContent: supplierContentFor(kind, slug),
    indexing: indexDecisionFor(defaults.path, quality.facts[defaults.path], overrides.get(defaults.path) ?? null),
  });
  const byName = <T extends { name: string }>(a: T, b: T) => a.name.localeCompare(b.name);

  const entries: SeoEntry[] = [
    ...STATIC_SEO_PAGES.map((page) => toEntry('static', page.group, page.name, null, page)),
    ...guides.map((guide) => toEntry('guide', 'Guides', guide.title, guide.slug, guideSeoDefaults(guide))),
    ...[...compounds]
      .sort(byName)
      .map((compound) => toEntry('compound', 'Compounds', compound.name, compound.slug, compoundSeoDefaults(compound))),
    ...[...suppliers]
      .sort(byName)
      .map((supplier) =>
        toEntry('supplier', 'Suppliers', supplier.name, supplier.slug, supplierSeoDefaults(supplier, supplierFacts(supplier.slug, offers))),
      ),
    // One page per vendor that has a code. Listed from the public supplier
    // records, the same ones the live pages are served from.
    ...[...publicSuppliers]
      .filter((supplier) => supplier.coupon !== null)
      .sort(byName)
      .map((supplier) =>
        toEntry(
          'coupon',
          'Coupon pages',
          `${supplier.name} coupon code`,
          supplier.slug,
          couponPageSeoDefaults(supplier, supplier.coupon!),
        ),
      ),
    // One reviews page per vendor that has reviews; a vendor with none has no page.
    ...[...publicSuppliers]
      .filter((supplier) => supplierHasReviews(supplier, slugsWithReviews))
      .sort(byName)
      .map((supplier) => toEntry('review', 'Review pages', `${supplier.name} reviews`, supplier.slug, reviewsPageSeoDefaults(supplier))),
  ];

  return {
    entries,
    quality: qualitySummary(entries, [...overrides.values()], publicSuppliers, offers),
    redirects: redirects.error
      ? []
      : ((redirects.data ?? []) as Parameters<typeof rowToSeoRedirect>[0][]).map(rowToSeoRedirect),
    setupError,
  };
}

/** The figures the supplier template may quote: distinct priced products and linked COA documents. */
function supplierFacts(slug: string, offers: readonly Offer[]): { productCount: number; coaCount: number } {
  const own = offers.filter((offer) => offer.supplierSlug === slug);
  const coas = new Set(
    own.flatMap((offer) => {
      const url = offer.labReport?.reportUrl ?? offer.labReport?.labUrl ?? offer.coaUrl ?? null;
      return url ? [`${offer.productSlug}|${url}`] : [];
    }),
  );
  return { productCount: new Set(own.map((offer) => offer.productSlug)).size, coaCount: coas.size };
}

function qualitySummary(
  entries: readonly SeoEntry[],
  overrides: readonly SeoOverride[],
  suppliers: readonly { slug: string; name: string }[],
  offers: readonly Offer[],
): SeoQualitySummary {
  const now = new Date();
  const weekAgo = now.getTime() - 7 * 24 * 60 * 60 * 1000;
  const madeIndexableLast7Days = overrides.filter(
    (override) => override.readyToIndex && override.readyToIndexAt && Date.parse(override.readyToIndexAt) >= weekAgo,
  ).length;

  const newestPrice = new Map<string, string>();
  for (const offer of offers) {
    const current = newestPrice.get(offer.supplierSlug);
    if (!current || Date.parse(offer.scrapedAt) > Date.parse(current)) newestPrice.set(offer.supplierSlug, offer.scrapedAt);
  }
  const stalePriceSuppliers = suppliers
    .flatMap((supplier) => {
      const newest = newestPrice.get(supplier.slug);
      const daysOld = newest ? daysSince(newest, now) : null;
      return daysOld !== null && daysOld > QUALITY_THRESHOLDS.stalePriceDays
        ? [{ slug: supplier.slug, name: supplier.name, daysOld }]
        : [];
    })
    .sort((a, b) => b.daysOld - a.daysOld);

  return {
    indexableCount: entries.filter((entry) => entry.indexing.indexable).length,
    failingQualityCount: entries.filter((entry) => entry.indexing.qualityFailures.length > 0).length,
    madeIndexableLast7Days,
    tooManyNewlyIndexable: madeIndexableLast7Days > QUALITY_THRESHOLDS.maxNewlyIndexablePerWeek,
    stalePriceSuppliers,
  };
}

/** Postgres/PostgREST "no such column/function": a 0031 feature used before that migration ran. */
function isMissing0031(error: { code?: string; message?: string }): boolean {
  return (
    ['PGRST202', 'PGRST204', '42703', '42883'].includes(error.code ?? '') ||
    /ready_to_index|seo_most_similar|schema cache/i.test(error.message ?? '')
  );
}

/**
 * B3: the most similar other supplier text, scored by pg_trgm in the
 * database. Null when nothing is similar enough to compare, or when 0031
 * (which adds the function) has not been run yet.
 */
export async function findMostSimilarSupplierText(
  kind: 'about' | 'review_summary',
  slug: string,
  text: string,
): Promise<{ name: string; score: number } | null> {
  if (!text.trim()) return null;
  const { data, error } = await requireClient().rpc('seo_most_similar', { p_kind: kind, p_slug: slug, p_text: text });
  if (error) {
    if (isMissing0031(error)) {
      console.warn('[seo] seo_most_similar is missing; run supabase/migrations/0031_seo_quality.sql.');
      return null;
    }
    throw toSeoError(error);
  }
  const row = (Array.isArray(data) ? data[0] : null) as { name?: unknown; score?: unknown } | null;
  if (!row || typeof row.name !== 'string' || typeof row.score !== 'number') return null;
  return { name: row.name, score: row.score };
}

/** Rejects SEO rows for pages that don't exist, so the table never collects orphans. */
export async function assertSeoPageExists(kind: SeoPageKind, path: string): Promise<void> {
  const exists = await (async () => {
    if (kind === 'static') return STATIC_SEO_PAGES.some((page) => page.path === path);
    if (kind === 'guide') return (await getGuides()).some((guide) => `/guides/${guide.slug}` === path);
    if (kind === 'coupon') {
      const supplierSlug = supplierSlugFromCouponPath(path);
      return supplierSlug !== null && Boolean((await getSupplier(supplierSlug))?.coupon);
    }
    if (kind === 'review') {
      const supplierSlug = supplierSlugFromReviewsPath(path);
      return supplierSlug !== null && Boolean(await getSupplier(supplierSlug));
    }

    const prefix = SLUG_PREFIX[kind];
    if (!path.startsWith(prefix)) return false;
    const table = kind === 'compound' ? 'products' : 'suppliers';
    const { data, error } = await requireClient()
      .from(table)
      .select('slug')
      .eq('slug', path.slice(prefix.length))
      .maybeSingle();
    if (error) throw toSeoError(error);
    return data !== null;
  })();
  if (!exists) throw new AdminDbError(`No ${kind} page exists at ${path}.`);
}

/**
 * Renames a compound or supplier in one transaction (see rename_page_slug in
 * 0010): the row, every reference to it, its SEO settings, and a permanent
 * redirect from the old URL. Returns the page's new path.
 */
export async function renamePageSlug(kind: RenamableKind, oldSlug: string, newSlug: string): Promise<string> {
  const { data, error } = await requireClient().rpc('rename_page_slug', {
    p_kind: kind,
    p_old_slug: oldSlug,
    p_new_slug: newSlug,
  });
  if (error) throw toSeoError(error);
  return typeof data === 'string' ? data : `${SLUG_PREFIX[kind]}${newSlug}`;
}

/**
 * Sets just the workflow status for a page, from the dropdown in the edit
 * dialog. Unlike `saveSeoPage`, which upserts every field and would blank out
 * an existing title/description override, this only ever touches
 * `task_status`, updating the row if one exists, or inserting a bare row
 * (everything else null, so `effectiveSeo` still falls back to defaults for
 * the rest) if this is the first override the page has ever had.
 */
export async function setPageTaskStatus(path: string, taskStatus: SeoTaskStatus | null): Promise<void> {
  const client = requireClient();
  const { data: existing, error: readError } = await client
    .from('seo_pages')
    .select('path')
    .eq('path', path)
    .maybeSingle();
  if (readError) throw toSeoError(readError);

  const { error } = existing
    ? await client.from('seo_pages').update({ task_status: taskStatus }).eq('path', path)
    : await client.from('seo_pages').insert({ path, task_status: taskStatus });
  if (error) throw toSeoError(error);
}

export async function saveSeoPage(path: string, input: SeoPageInput): Promise<void> {
  const client = requireClient();
  const row = {
    path,
    meta_title: input.metaTitle,
    meta_description: input.metaDescription,
    h1: input.h1,
    keywords: input.keywords,
    canonical_url: input.canonicalUrl,
    og_image_url: input.ogImageUrl,
    robots_index: input.robotsIndex,
    robots_follow: input.robotsFollow,
    head_html: input.headHtml,
    body_html: input.bodyHtml,
  };

  // The tick's date only moves when it goes from unticked to ticked, so the
  // "made indexable in the last 7 days" counter counts real changes.
  const { data: existing, error: readError } = await client
    .from('seo_pages')
    .select('ready_to_index, ready_to_index_at')
    .eq('path', path)
    .maybeSingle();
  const missing0031 = readError !== null && isMissing0031(readError);
  if (readError && !missing0031) throw toSeoError(readError);

  if (missing0031) {
    // Before 0031 there is no tick to store; the rest of the page still saves.
    const { error } = await client.from('seo_pages').upsert(row, { onConflict: 'path' });
    if (error) throw toSeoError(error);
    return;
  }

  const previous = existing as { ready_to_index: boolean; ready_to_index_at: string | null } | null;
  const newlyReady = input.readyToIndex && !previous?.ready_to_index;
  const { error } = await client.from('seo_pages').upsert(
    {
      ...row,
      ready_to_index: input.readyToIndex,
      ready_to_index_at: newlyReady ? new Date().toISOString() : (previous?.ready_to_index_at ?? null),
    },
    { onConflict: 'path' },
  );
  if (error) throw toSeoError(error);
}

/** Drops a page's overrides so it goes back to its built-in defaults. */
export async function resetSeoPage(path: string): Promise<void> {
  const { error } = await requireClient().from('seo_pages').delete().eq('path', path);
  if (error) throw toSeoError(error);
}

export async function deleteSeoRedirect(fromPath: string): Promise<void> {
  const { error } = await requireClient().from('seo_redirects').delete().eq('from_path', fromPath);
  if (error) throw toSeoError(error);
}

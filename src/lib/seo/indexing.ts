import { QUALITY_RULES_ENFORCED, QUALITY_THRESHOLDS } from '@/config/seo-quality';

/**
 * The one place that decides whether a page may be indexed. Every page's
 * robots tag (through withSeo), the sitemap, the structured data, the admin
 * status and the build check call isIndexable()/indexDecision(); nothing else
 * decides indexing.
 *
 * Pure and client-safe, so the admin dashboard and the tests use exactly
 * these rules. The facts are gathered on the server (src/lib/seo/page-quality.ts).
 */

export type QualityPageType = 'supplier' | 'coupon' | 'review' | 'product' | 'guide';
export type PageType = QualityPageType | 'static';

export interface SimilarText {
  /** The other supplier's name, for "This text is 82% similar to Purgo Labs". */
  name: string;
  /** 0-1, pg_trgm similarity. */
  score: number;
}

export type PageQualityFacts =
  | { type: 'static' }
  | {
      type: 'supplier';
      isActive: boolean;
      /** Distinct products this supplier lists with a price. */
      pricedProductCount: number;
      /** Words in the admin-written About text; 0 when only the generated text is showing. */
      descriptionWords: number;
      mostSimilarDescription: SimilarText | null;
    }
  | {
      type: 'coupon';
      hasActiveCode: boolean;
      /** YYYY-MM-DD the code was last tested, or null. */
      couponVerifiedAt: string | null;
    }
  | {
      type: 'review';
      summaryWords: number;
      mostSimilarSummary: SimilarText | null;
    }
  | { type: 'product'; activeSupplierCount: number }
  | {
      type: 'guide';
      reviewedByMe: boolean;
      /** A placeholder guide with no text yet, or a draft, is never indexed, enforced or not. */
      hasContent: boolean;
      isPublished: boolean;
    };

/**
 * Pages that are never indexed: they only make sense mid-flow (after a
 * payment, after installing or removing the extension) or are internal.
 */
const PRIVATE_PATHS: ReadonlySet<string> = new Set(['/thanks', '/extension/welcome', '/extension/uninstalled', '/load']);

export interface IndexContext {
  /** VERCEL_ENV === 'production'. Every other deployment is noindex. */
  isProduction: boolean;
  /** The "Index" switch on the page's /admin/seo row; null when the page has no row. */
  adminRobotsIndex: boolean | null;
  /** The "Ready to index" tick on the page's /admin/seo row; null when the page has no row. */
  readyToIndex: boolean | null;
  now: Date;
  /** CONTENT_V2=true: a reviews page with no review summary is noindex until one is written. */
  contentV2?: boolean;
}

export interface IndexDecision {
  indexable: boolean;
  /** Why the page is noindex. Empty when it is indexable. */
  reasons: string[];
  /** Quality rules the page fails, whether or not they are enforced for its type. */
  qualityFailures: string[];
  /** Whether failing the quality rules takes this page type out of search. */
  enforced: boolean;
}

const DAY_MS = 24 * 60 * 60 * 1000;

function percent(score: number): string {
  return `${Math.round(score * 100)}%`;
}

/** Days from a YYYY-MM-DD (or ISO) date to now, or null when the date can't be read. */
export function daysSince(date: string, now: Date): number | null {
  const time = Date.parse(date.length === 10 ? `${date}T00:00:00Z` : date);
  return Number.isNaN(time) ? null : Math.floor((now.getTime() - time) / DAY_MS);
}

/** Every B2 rule this page fails, in plain words for the admin. Empty when it passes. */
export function qualityFailures(facts: PageQualityFacts, now: Date): string[] {
  const t = QUALITY_THRESHOLDS;
  switch (facts.type) {
    case 'static':
      return [];
    case 'supplier': {
      const failures: string[] = [];
      if (!facts.isActive) failures.push('supplier is not active');
      if (facts.pricedProductCount < t.supplierMinPricedProducts) {
        failures.push(`${facts.pricedProductCount} products with a price (needs ${t.supplierMinPricedProducts})`);
      }
      if (facts.descriptionWords < t.supplierMinDescriptionWords) {
        failures.push(
          facts.descriptionWords === 0
            ? `no About text written in admin (needs ${t.supplierMinDescriptionWords} words)`
            : `About text is ${facts.descriptionWords} words (needs ${t.supplierMinDescriptionWords})`,
        );
      }
      if (facts.mostSimilarDescription && facts.mostSimilarDescription.score > t.maxSimilarity) {
        failures.push(
          `About text is ${percent(facts.mostSimilarDescription.score)} similar to ${facts.mostSimilarDescription.name}`,
        );
      }
      return failures;
    }
    case 'coupon': {
      if (!facts.hasActiveCode) return ['supplier has no active coupon code'];
      if (!facts.couponVerifiedAt) return ['coupon has never been tested (no "last tested" date)'];
      const age = daysSince(facts.couponVerifiedAt, now);
      if (age === null) return ['coupon "last tested" date cannot be read'];
      return age > t.couponTestedWithinDays
        ? [`coupon last tested ${age} days ago (must be within ${t.couponTestedWithinDays})`]
        : [];
    }
    case 'review': {
      const failures: string[] = [];
      if (facts.summaryWords < t.reviewSummaryMinWords) {
        failures.push(
          facts.summaryWords === 0
            ? `no review summary written (needs ${t.reviewSummaryMinWords} words)`
            : `review summary is ${facts.summaryWords} words (needs ${t.reviewSummaryMinWords})`,
        );
      }
      if (facts.mostSimilarSummary && facts.mostSimilarSummary.score > t.maxSimilarity) {
        failures.push(`review summary is ${percent(facts.mostSimilarSummary.score)} similar to ${facts.mostSimilarSummary.name}`);
      }
      return failures;
    }
    case 'product':
      return facts.activeSupplierCount < t.productMinActiveSuppliers
        ? [`${facts.activeSupplierCount} active suppliers with a price (needs ${t.productMinActiveSuppliers})`]
        : [];
    case 'guide':
      return facts.reviewedByMe ? [] : ['"Reviewed by me" is not ticked'];
  }
}

/** B4: new suppliers, coupons, reviews and guides wait for the "Ready to index" tick. */
function needsReadyTick(type: PageType): boolean {
  return type === 'supplier' || type === 'coupon' || type === 'review' || type === 'guide';
}

export function indexDecision(facts: PageQualityFacts, context: IndexContext): IndexDecision {
  const failures = qualityFailures(facts, context.now);
  const enforced = facts.type !== 'static' && QUALITY_RULES_ENFORCED[facts.type];
  const reasons: string[] = [];

  if (!context.isProduction) reasons.push('preview deployment (only production is indexed)');
  if (facts.type === 'guide' && !facts.isPublished) reasons.push('guide is a draft');
  if (facts.type === 'guide' && !facts.hasContent) reasons.push('guide has no text yet');
  if (facts.type === 'review' && context.contentV2 && facts.summaryWords === 0) {
    reasons.push('no review summary written yet (content v2)');
  }
  if (context.adminRobotsIndex === false) reasons.push('"Index" is switched off in /admin/seo');
  if (enforced) {
    reasons.push(...failures);
    if (needsReadyTick(facts.type) && context.readyToIndex !== true) reasons.push('"Ready to index" is not ticked');
  }

  return { indexable: reasons.length === 0, reasons, qualityFailures: failures, enforced };
}

/** Decision for a path with no data behind it: a static page, or one of the private pages. */
export function staticPageDecision(path: string, context: IndexContext): IndexDecision {
  const decision = indexDecision({ type: 'static' }, context);
  if (!PRIVATE_PATHS.has(path)) return decision;
  return { ...decision, indexable: false, reasons: [...decision.reasons, 'private page (never indexed)'] };
}

/**
 * Robots metadata for the private pages, which export static metadata and so
 * can't await withSeo(). Same rule as everywhere else: they are never indexed.
 */
export function privatePageRobots(path: string): { index: boolean; follow: boolean } {
  const decision = staticPageDecision(path, {
    isProduction: isProductionDeployment(),
    adminRobotsIndex: null,
    readyToIndex: null,
    now: new Date(),
  });
  return { index: decision.indexable, follow: false };
}

/** The yes/no form of {@link indexDecision}. */
export function isIndexable(facts: PageQualityFacts, context: IndexContext): boolean {
  return indexDecision(facts, context).indexable;
}

/** Page type from a site path, matching the routes under src/app/(marketing). */
export function pageTypeForPath(path: string): PageType {
  if (/^\/suppliers\/[^/]+$/.test(path)) return 'supplier';
  if (/^\/coupons\/[^/]+-coupon-code$/.test(path)) return 'coupon';
  if (/^\/reviews\/[^/]+-reviews$/.test(path)) return 'review';
  if (/^\/products\/[^/]+$/.test(path)) return 'product';
  if (/^\/guides\/[^/]+$/.test(path)) return 'guide';
  return 'static';
}

/** "Indexed ✓", or "Not indexed – reason: …", as the admin shows it. */
export function indexStatusLabel(decision: IndexDecision): string {
  if (!decision.indexable) return `Not indexed – reason: ${decision.reasons.join('; ')}`;
  return 'Indexed ✓';
}

/** Only production deployments are indexed; a preview, a branch or a local build never is. */
export function isProductionDeployment(env: Readonly<Record<string, string | undefined>> = process.env): boolean {
  return env.VERCEL_ENV === 'production';
}

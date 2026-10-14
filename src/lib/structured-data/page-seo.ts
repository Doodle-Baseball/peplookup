import 'server-only';
import type { SeoDefaults } from '@/lib/seo-defaults';
import { getSeoOverride } from '@/lib/seo';
import { absoluteUrl, SITE_URL } from '@/lib/structured-data/graph';
import { cleanPath } from '@/lib/structured-data/page-routes';

/** A page's SEO as actually rendered: its defaults with any /admin/seo override applied. */
export interface ResolvedPageSeo {
  path: string;
  canonicalUrl: string;
  title: string;
  description: string;
  heading: string;
  indexable: boolean;
  /** When the override was last saved, if the page has one. */
  updatedAt: string | null;
}

function canonicalFor(path: string, override: string | null): string {
  if (!override) return absoluteUrl(path);
  if (override.startsWith('/')) return absoluteUrl(override);
  return override.startsWith(SITE_URL) ? override.split(/[?#]/)[0]! : absoluteUrl(path);
}

/**
 * Resolves the same values withSeo() puts in the page's metadata, so the
 * structured data can never disagree with the title, description and H1.
 * `indexable` lets pages with their own indexing rule (coupon and review
 * pages) pass the result they already computed.
 */
export async function resolvePageSeo(
  defaults: SeoDefaults,
  options: { indexable?: boolean } = {},
): Promise<ResolvedPageSeo> {
  const path = cleanPath(defaults.path);
  const override = await getSeoOverride(path);
  return {
    path,
    canonicalUrl: canonicalFor(path, override?.canonicalUrl ?? null),
    title: override?.metaTitle || defaults.title,
    description: override?.metaDescription ?? defaults.description,
    heading: override?.h1 || defaults.h1,
    indexable: options.indexable ?? override?.robotsIndex ?? true,
    updatedAt: override?.updatedAt ?? null,
  };
}

/** The most recent of the given ISO dates, or null when none is known. */
export function latestDate(dates: readonly (string | null | undefined)[]): string | null {
  const known = dates.filter((date): date is string => typeof date === 'string' && !Number.isNaN(Date.parse(date)));
  if (known.length === 0) return null;
  return known.reduce((latest, date) => (Date.parse(date) > Date.parse(latest) ? date : latest));
}

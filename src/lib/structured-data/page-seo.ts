import 'server-only';
import type { SeoDefaults } from '@/lib/seo-defaults';
import { cleanPageText, getIndexDecision, getSeoOverride } from '@/lib/seo';
import { absoluteUrl, SITE_URL } from '@/lib/structured-data/graph';
import { cleanPath } from '@/lib/structured-data/page-routes';
import { publicCanonical } from '@/lib/supplier-path';

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
  return override.startsWith(SITE_URL) ? publicCanonical(override.split(/[?#]/)[0]!) : absoluteUrl(path);
}

/**
 * Resolves the same values withSeo() puts in the page's metadata, so the
 * structured data can never disagree with the title, description, H1 or the
 * page's indexing decision.
 */
export async function resolvePageSeo(
  defaults: SeoDefaults,
  /** True on a page that writes its own title and description: the saved ones are not used. */
  options: { ignoreSavedText?: boolean } = {},
): Promise<ResolvedPageSeo> {
  const path = cleanPath(defaults.path);
  const [override, decision] = await Promise.all([getSeoOverride(path), getIndexDecision(path)]);
  const saved = options.ignoreSavedText ? null : override;
  const text = await cleanPageText(path, {
    title: saved?.metaTitle || defaults.title,
    description: saved?.metaDescription ?? defaults.description,
  });
  return {
    path,
    canonicalUrl: canonicalFor(path, override?.canonicalUrl ?? null),
    title: text.title,
    description: text.description,
    heading: override?.h1 || defaults.h1,
    indexable: decision.indexable,
    updatedAt: override?.updatedAt ?? null,
  };
}

/** The most recent of the given ISO dates, or null when none is known. */
export function latestDate(dates: readonly (string | null | undefined)[]): string | null {
  const known = dates.filter((date): date is string => typeof date === 'string' && !Number.isNaN(Date.parse(date)));
  if (known.length === 0) return null;
  return known.reduce((latest, date) => (Date.parse(date) > Date.parse(latest) ? date : latest));
}

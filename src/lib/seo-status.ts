import type { SeoDefaults } from '@/lib/seo-defaults';

/**
 * How a page's SEO is scored in /admin/seo. Pure, so the dashboard cards and
 * the edit form's live counters use exactly the same rules.
 */

export const TITLE_LENGTH = { min: 30, max: 60 } as const;
export const DESCRIPTION_LENGTH = { min: 70, max: 160 } as const;

/** The override fields scoring needs; SeoOverride satisfies this structurally. */
export interface SeoOverrideFields {
  metaTitle: string | null;
  metaDescription: string | null;
  h1: string | null;
  keywords: readonly string[];
  canonicalUrl: string | null;
  robotsIndex: boolean;
  robotsFollow: boolean;
}

/** What the live page actually uses: the override where set, otherwise the default. */
export interface EffectiveSeo {
  title: string;
  description: string;
  h1: string;
  keywords: readonly string[];
  canonical: string;
  robotsIndex: boolean;
  robotsFollow: boolean;
}

export type SeoStatus = 'optimized' | 'needs-work' | 'noindex';

export interface SeoCheck {
  label: string;
  passed: boolean;
}

/** Code points, so an emoji or accented letter counts once. */
export function characterCount(value: string): number {
  return [...value].length;
}

export function effectiveSeo(defaults: SeoDefaults, override: SeoOverrideFields | null): EffectiveSeo {
  return {
    title: override?.metaTitle || defaults.title,
    description: override?.metaDescription || defaults.description,
    h1: override?.h1 || defaults.h1,
    keywords: override?.keywords ?? [],
    canonical: override?.canonicalUrl || defaults.path,
    robotsIndex: override?.robotsIndex ?? true,
    robotsFollow: override?.robotsFollow ?? true,
  };
}

function withinRange(value: string, range: { min: number; max: number }): boolean {
  const count = characterCount(value);
  return count >= range.min && count <= range.max;
}

export function seoChecks(seo: EffectiveSeo): SeoCheck[] {
  return [
    { label: `Meta title ${TITLE_LENGTH.min}-${TITLE_LENGTH.max} characters`, passed: withinRange(seo.title, TITLE_LENGTH) },
    {
      label: `Meta description ${DESCRIPTION_LENGTH.min}-${DESCRIPTION_LENGTH.max} characters`,
      passed: withinRange(seo.description, DESCRIPTION_LENGTH),
    },
    { label: 'H1 heading set', passed: seo.h1.trim().length > 0 },
    { label: 'At least one keyword', passed: seo.keywords.length > 0 },
  ];
}

export function seoStatus(seo: EffectiveSeo): SeoStatus {
  if (!seo.robotsIndex) return 'noindex';
  return seoChecks(seo).every((check) => check.passed) ? 'optimized' : 'needs-work';
}

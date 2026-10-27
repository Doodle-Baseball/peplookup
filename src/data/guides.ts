export type GuideIcon = 'document' | 'flask' | 'shield' | 'bolt' | 'badge' | 'globe';
export type GuideAccent = 'cat-1' | 'cat-2' | 'cat-3' | 'cat-4' | 'cat-5';

export interface GuideSection {
  heading: string;
  body: readonly string[];
}

export interface Guide {
  slug: string;
  title: string;
  category: string;
  excerpt: string;
  icon: GuideIcon;
  accent: GuideAccent;
  /**
   * Cover photo URL. When absent the generated icon + colour art is used, so a
   * guide always has a cover without anyone sourcing an image for it.
   */
  coverImageUrl?: string | null;
  /** The cover photo's alt text. Required by the admin whenever a cover image is set. */
  coverImageAlt?: string | null;
  readMinutes: number;
  /** ISO date; kept as a plain string so this file has no server-only imports. */
  publishedAt: string;
  /** ISO timestamp of the last admin save. Absent on guides that ship in the repository. */
  updatedAt?: string | null;
  /** Drafts are false. Absent on guides that ship in the repository, which are always live. */
  isPublished?: boolean;
  sections: readonly GuideSection[];
  /** One of the site's own calculators/checkers this guide points to, where relevant. */
  relatedTool?: { label: string; href: string };
}

/**
 * Editorial "how things work" content, general process and terminology, never
 * dosing recommendations or purity/safety claims about a specific product.
 * Keep new entries to that same register (see CLAUDE.md's YMYL rules).
 */
export const guides: readonly Guide[] = [];

export function getGuide(slug: string): Guide | undefined {
  return guides.find((guide) => guide.slug === slug);
}

/**
 * Whether a guide has any written body yet. One without is a placeholder: it
 * stays out of the sitemap and is marked noindex until its text is in.
 */
export function guideHasContent(guide: Pick<Guide, 'sections'>): boolean {
  return guide.sections.some((section) => section.body.some((paragraph) => paragraph.trim().length > 0));
}

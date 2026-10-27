import 'server-only';
import { getSupabaseServerClient } from '@/lib/supabase/server';
import {
  fetchGuidesFromDb,
  fetchGuideFromDb,
  guideInputToRow,
  type GuideInput,
} from '@/lib/supabase/guides';
import { fetchPageFaqsFromDb, replacePageFaqsInDb } from '@/lib/supabase/page-faqs';
import { renamePageSlug } from '@/lib/admin/seo';
import { AdminDbError } from '@/lib/admin/vendors';
import { guides as seedGuides, type Guide } from '@/data/guides';

const MIGRATION_HINT =
  'Run supabase/migrations/0012_guides.sql in the Supabase SQL editor first.';
const COVER_MIGRATION_HINT =
  'Run supabase/migrations/0030_guide_cover_images.sql in the Supabase SQL editor first.';

function requireClient() {
  const client = getSupabaseServerClient();
  if (!client) {
    throw new AdminDbError(
      'Supabase is not configured, set SUPABASE_SECRET_KEY and NEXT_PUBLIC_SUPABASE_URL.',
    );
  }
  return client;
}

/** Points at whichever migration the failing column actually comes from. */
function guideDbError(message: string): AdminDbError {
  return new AdminDbError(`${message}. ${message.includes('cover_image_alt') ? COVER_MIGRATION_HINT : MIGRATION_HINT}`);
}

export const GUIDE_SLUG_PATTERN = /^[a-z0-9]+(-[a-z0-9]+)*$/;

export function slugifyGuideTitle(title: string): string {
  return title
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

export function guidePath(slug: string): string {
  return `/guides/${slug}`;
}

export interface AdminGuide extends Guide {
  /** Guides that ship in the repository can be overridden but not deleted from here. */
  source: 'database' | 'built-in';
}

/** Every guide the admin can see: database rows merged over the shipped set. */
export async function listGuides(): Promise<AdminGuide[]> {
  const client = getSupabaseServerClient();
  const fromDb = client ? await fetchGuidesFromDb(client, { includeUnpublished: true }) : null;

  const merged = new Map<string, AdminGuide>(
    seedGuides.map((guide) => [guide.slug, { ...guide, source: 'built-in' as const }]),
  );
  for (const guide of fromDb ?? []) merged.set(guide.slug, { ...guide, source: 'database' });

  return [...merged.values()].sort((a, b) => b.publishedAt.localeCompare(a.publishedAt));
}

export async function getGuideForEdit(slug: string): Promise<AdminGuide | null> {
  return (await listGuides()).find((guide) => guide.slug === slug) ?? null;
}

async function slugIsTaken(slug: string): Promise<boolean> {
  const client = requireClient();
  if (await fetchGuideFromDb(client, slug)) return true;
  return seedGuides.some((guide) => guide.slug === slug);
}

function assertValidSlug(slug: string): void {
  if (!GUIDE_SLUG_PATTERN.test(slug)) {
    throw new AdminDbError(`"${slug}" is not a valid slug. Use lowercase letters, numbers and single hyphens.`);
  }
}

/** `base`, else `base-2`, `base-3`… whichever is free first. */
async function firstFreeSlug(base: string): Promise<string> {
  let slug = base;
  let suffix = 2;
  while (await slugIsTaken(slug)) {
    slug = `${base}-${suffix}`;
    suffix += 1;
  }
  return slug;
}

/**
 * Creates a guide at `requestedSlug` when one is given (and fails if it is
 * taken, since the admin asked for that exact address), otherwise at the
 * first free slug derived from the title.
 */
export async function createGuide(input: GuideInput, requestedSlug?: string | null): Promise<string> {
  const client = requireClient();

  let slug: string;
  if (requestedSlug) {
    assertValidSlug(requestedSlug);
    if (await slugIsTaken(requestedSlug)) {
      throw new AdminDbError(`Another guide already uses the slug "${requestedSlug}".`);
    }
    slug = requestedSlug;
  } else {
    const base = slugifyGuideTitle(input.title);
    if (!base) throw new AdminDbError('The guide title must contain at least one letter or number.');
    slug = await firstFreeSlug(base);
  }

  const { error } = await client.from('guides').insert(guideInputToRow(slug, input));
  if (error) throw guideDbError(error.message);
  return slug;
}

/**
 * Saves the guide's content, then moves it to `newSlug` when that differs.
 * Content goes first so a rename that fails (slug taken, say) never loses the
 * edits; the rename itself runs through rename_page_slug (0018), which adds
 * the 301 from the old URL and carries the FAQs and SEO settings across in
 * one transaction.
 *
 * A failed rename is returned rather than thrown: the content is already
 * saved by then, and the caller still has the guide's (unchanged) slug to
 * write its FAQs against.
 */
export async function updateGuide(
  slug: string,
  input: GuideInput,
  newSlug?: string | null,
): Promise<{ slug: string; renameError: string | null }> {
  const client = requireClient();
  if (newSlug && newSlug !== slug) assertValidSlug(newSlug);

  // A guide that ships in the repository has no row yet: the first save writes
  // one, which then takes precedence over the built-in copy by slug.
  const existing = await fetchGuideFromDb(client, slug);
  const { error } = existing
    ? await client.from('guides').update(guideInputToRow(slug, input)).eq('slug', slug)
    : await client.from('guides').insert(guideInputToRow(slug, input));
  if (error) throw guideDbError(error.message);

  if (!newSlug || newSlug === slug) return { slug, renameError: null };
  if (await slugIsTaken(newSlug)) {
    return {
      slug,
      renameError: `Your changes were saved, but the slug was not changed: another guide already uses "${newSlug}".`,
    };
  }
  try {
    await renamePageSlug('guide', slug, newSlug);
  } catch (renameError) {
    const reason = renameError instanceof Error ? renameError.message : 'unknown error';
    return { slug, renameError: `Your changes were saved, but the slug could not be changed: ${reason}` };
  }
  return { slug: newSlug, renameError: null };
}

export async function setGuidePublished(slug: string, isPublished: boolean): Promise<void> {
  const client = requireClient();
  const { error } = await client.from('guides').update({ is_published: isPublished }).eq('slug', slug);
  if (error) throw guideDbError(error.message);
}

/**
 * Copies a guide, its content and its saved FAQs, as a new draft at
 * `<slug>-copy` (or `-copy-2`, …). Returns the copy's slug.
 */
export async function duplicateGuide(slug: string): Promise<string> {
  const client = requireClient();
  const source = await getGuideForEdit(slug);
  if (!source) throw new AdminDbError(`Guide "${slug}" does not exist.`);

  const copySlug = await firstFreeSlug(`${slug}-copy`);
  const input: GuideInput = {
    title: source.title,
    category: source.category,
    excerpt: source.excerpt,
    icon: source.icon,
    accent: source.accent,
    coverImageUrl: source.coverImageUrl ?? null,
    coverImageAlt: source.coverImageAlt ?? null,
    readMinutes: source.readMinutes,
    publishedAt: source.publishedAt,
    sections: [...source.sections],
    relatedToolLabel: source.relatedTool?.label ?? null,
    relatedToolHref: source.relatedTool?.href ?? null,
    isPublished: false,
  };
  const { error } = await client.from('guides').insert(guideInputToRow(copySlug, input));
  if (error) throw guideDbError(error.message);

  const storedFaqs = (await fetchPageFaqsFromDb(client))?.get(guidePath(slug)) ?? [];
  if (storedFaqs.length > 0) {
    const { error: faqError } = await replacePageFaqsInDb(client, guidePath(copySlug), storedFaqs);
    if (faqError) throw new AdminDbError(`The guide was copied, but its FAQs were not: ${faqError}`);
  }
  return copySlug;
}

/** Removes the guide and the FAQs saved for its page, so none are left orphaned at a dead path. */
export async function deleteGuide(slug: string): Promise<void> {
  const client = requireClient();
  const { error } = await client.from('guides').delete().eq('slug', slug);
  if (error) throw guideDbError(error.message);

  const { error: faqError } = await replacePageFaqsInDb(client, guidePath(slug), []);
  if (faqError) throw new AdminDbError(`The guide was deleted, but its FAQs were not: ${faqError}`);
}

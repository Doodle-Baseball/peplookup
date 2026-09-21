'use server';

import { revalidatePath, revalidateTag } from 'next/cache';
import { redirect } from 'next/navigation';
import { createGuide, deleteGuide, updateGuide } from '@/lib/admin/guides';
import { savePageFaqs } from '@/lib/admin/page-faqs';
import { FAQS_CACHE_TAG } from '@/lib/page-faqs';
import type { GuideInput } from '@/lib/supabase/guides';
import type { GuideAccent, GuideIcon, GuideSection } from '@/data/guides';
import type { FaqItem } from '@/data/default-page-faqs';

export interface GuideFormState {
  error: string | null;
}

const ICONS: GuideIcon[] = ['document', 'flask', 'shield', 'bolt', 'badge', 'globe'];
const ACCENTS: GuideAccent[] = ['cat-1', 'cat-2', 'cat-3', 'cat-4', 'cat-5'];

function revalidateGuideSurfaces(slug?: string) {
  // The tag is the part that actually matters: getGuides() is cached under it
  // for 5 minutes, independently of the route caches revalidatePath clears.
  // Without this an edited title, link or slug kept serving stale everywhere
  // guides are read, /guides, each guide page, the "More guides" rail and
  // the SEO dashboard, until that window expired.
  revalidateTag('guides');
  revalidatePath('/admin/guides');
  revalidatePath('/guides');
  if (slug) revalidatePath(`/guides/${slug}`);
}

/** Sections arrive as JSON from the editor; anything unusable is dropped rather than half-saved. */
function readSections(formData: FormData): GuideSection[] {
  const raw = String(formData.get('sections') ?? '').trim();
  if (!raw) return [];
  try {
    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.flatMap((entry) => {
      if (typeof entry !== 'object' || entry === null) return [];
      const heading = String((entry as { heading?: unknown }).heading ?? '').trim();
      const bodyRaw = (entry as { body?: unknown }).body;
      const body = Array.isArray(bodyRaw)
        ? bodyRaw.map((p) => String(p).trim()).filter(Boolean)
        : String(bodyRaw ?? '')
            .split(/\n{2,}/)
            .map((p) => p.trim())
            .filter(Boolean);
      if (!heading || body.length === 0) return [];
      return [{ heading, body }];
    });
  } catch {
    return [];
  }
}

/**
 * FAQs drafted in the form's own FAQ section, arriving as JSON. Anything
 * missing a question or an answer was already filtered out client-side, but
 * this is trusted no further than that.
 */
function readFaqs(formData: FormData): FaqItem[] {
  const raw = String(formData.get('faqs') ?? '').trim();
  if (!raw) return [];
  try {
    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.flatMap((entry) => {
      if (typeof entry !== 'object' || entry === null) return [];
      const question = String((entry as { question?: unknown }).question ?? '').trim();
      const answer = String((entry as { answer?: unknown }).answer ?? '').trim();
      return question && answer ? [{ question, answer }] : [];
    });
  } catch {
    return [];
  }
}

function readGuideInput(formData: FormData): GuideInput {
  const title = String(formData.get('title') ?? '').trim();
  const category = String(formData.get('category') ?? '').trim();
  const excerpt = String(formData.get('excerpt') ?? '').trim();

  if (!title) throw new Error('A guide title is required.');
  if (!category) throw new Error('A category is required.');
  if (!excerpt) throw new Error('A short excerpt is required. It is the card summary and the meta description.');

  const iconRaw = String(formData.get('icon') ?? '');
  const accentRaw = String(formData.get('accent') ?? '');
  const icon: GuideIcon = ICONS.includes(iconRaw as GuideIcon) ? (iconRaw as GuideIcon) : 'document';
  const accent: GuideAccent = ACCENTS.includes(accentRaw as GuideAccent) ? (accentRaw as GuideAccent) : 'cat-2';

  const readMinutesRaw = Number(String(formData.get('readMinutes') ?? '').trim());
  const readMinutes =
    Number.isFinite(readMinutesRaw) && readMinutesRaw >= 1 && readMinutesRaw <= 120
      ? Math.round(readMinutesRaw)
      : 5;

  const publishedAtRaw = String(formData.get('publishedAt') ?? '').trim();
  const publishedAt = /^\d{4}-\d{2}-\d{2}$/.test(publishedAtRaw)
    ? publishedAtRaw
    : new Date().toISOString().slice(0, 10);

  const sections = readSections(formData);
  if (sections.length === 0) {
    throw new Error('Add at least one section with a heading and some body text.');
  }

  const relatedToolLabel = String(formData.get('relatedToolLabel') ?? '').trim();
  const relatedToolHref = String(formData.get('relatedToolHref') ?? '').trim();

  // An http(s) URL or nothing, the column rejects anything else, and a bad
  // value here would surface as a database error instead of a readable message.
  const coverImageUrlRaw = String(formData.get('coverImageUrl') ?? '').trim();
  if (coverImageUrlRaw && !/^https?:\/\/\S+$/i.test(coverImageUrlRaw)) {
    throw new Error('The cover image URL must start with http:// or https://, or be left empty.');
  }

  return {
    title,
    category,
    excerpt,
    icon,
    accent,
    coverImageUrl: coverImageUrlRaw || null,
    readMinutes,
    publishedAt,
    sections,
    // Both halves or neither, a labelled link with no target is a dead button.
    relatedToolLabel: relatedToolLabel && relatedToolHref ? relatedToolLabel : null,
    relatedToolHref: relatedToolLabel && relatedToolHref ? relatedToolHref : null,
    isPublished: formData.get('isPublished') === 'on',
  };
}

export async function createGuideAction(
  _prevState: GuideFormState,
  formData: FormData,
): Promise<GuideFormState> {
  let slug: string;
  try {
    slug = await createGuide(readGuideInput(formData));
    // Only written when the admin actually drafted at least one FAQ: an
    // empty save here would explicitly override the auto-generated defaults
    // with "no FAQs" for a guide nobody has touched yet, which is worse than
    // just leaving the defaults to apply on their own.
    const faqs = readFaqs(formData);
    if (faqs.length > 0) {
      await savePageFaqs(`/guides/${slug}`, faqs);
      revalidateTag(FAQS_CACHE_TAG);
    }
  } catch (error) {
    return { error: error instanceof Error ? error.message : 'Failed to create the guide.' };
  }
  revalidateGuideSurfaces(slug);
  redirect('/admin/guides');
}

export async function updateGuideAction(
  slug: string,
  _prevState: GuideFormState,
  formData: FormData,
): Promise<GuideFormState> {
  try {
    await updateGuide(slug, readGuideInput(formData));
    // Same reasoning as creation: only overwrite the saved FAQ set when the
    // form actually has content, so leaving this section untouched never
    // silently wipes an existing custom set back to the built-in defaults.
    // Clearing a guide's FAQs down to none entirely is still possible from
    // /admin/seo, which supports saving an explicitly empty list.
    const faqs = readFaqs(formData);
    if (faqs.length > 0) {
      await savePageFaqs(`/guides/${slug}`, faqs);
      revalidateTag(FAQS_CACHE_TAG);
    }
  } catch (error) {
    return { error: error instanceof Error ? error.message : 'Failed to save the guide.' };
  }
  revalidateGuideSurfaces(slug);
  redirect('/admin/guides');
}

export async function deleteGuideAction(slug: string): Promise<{ error: string | null }> {
  try {
    await deleteGuide(slug);
  } catch (error) {
    return { error: error instanceof Error ? error.message : 'Failed to delete the guide.' };
  }
  revalidateGuideSurfaces(slug);
  return { error: null };
}

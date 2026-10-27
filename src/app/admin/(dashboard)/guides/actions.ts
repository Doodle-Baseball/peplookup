'use server';

import { revalidatePath, revalidateTag } from 'next/cache';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { ADMIN_SESSION_COOKIE, verifyAdminSessionToken } from '@/lib/admin-auth';
import {
  createGuide,
  deleteGuide,
  duplicateGuide,
  guidePath,
  setGuidePublished,
  updateGuide,
} from '@/lib/admin/guides';
import { uploadGuideCover } from '@/lib/admin/guide-images';
import { savePageFaqs } from '@/lib/admin/page-faqs';
import { FAQS_CACHE_TAG } from '@/lib/page-faqs';
import { SEO_CACHE_TAG } from '@/lib/seo';
import type { GuideInput } from '@/lib/supabase/guides';
import type { GuideAccent, GuideIcon, GuideSection } from '@/data/guides';
import type { FaqItem } from '@/data/default-page-faqs';

export interface GuideFormState {
  error: string | null;
}

export interface GuideCoverUploadState {
  error: string | null;
  url: string | null;
  warnings: string[];
}

const ICONS: GuideIcon[] = ['document', 'flask', 'shield', 'bolt', 'badge', 'globe'];
const ACCENTS: GuideAccent[] = ['cat-1', 'cat-2', 'cat-3', 'cat-4', 'cat-5'];

/**
 * The middleware already guards /admin, but these actions write guides and
 * upload files, so they check the session themselves too. A signed-out
 * request goes to the login page rather than getting an error.
 */
async function assertAdmin(): Promise<void> {
  const token = (await cookies()).get(ADMIN_SESSION_COOKIE)?.value;
  if (!(await verifyAdminSessionToken(token))) redirect('/admin/login?next=/admin/guides');
}

function revalidateGuideSurfaces(...slugs: string[]) {
  // The tag is the part that actually matters: getGuides() is cached under it
  // for 5 minutes, independently of the route caches revalidatePath clears.
  // Without this an edited title, link or slug kept serving stale everywhere
  // guides are read, /guides, each guide page, the "More guides" rail and
  // the SEO dashboard, until that window expired.
  revalidateTag('guides');
  revalidatePath('/admin/guides');
  revalidatePath('/guides');
  revalidatePath('/sitemap.xml');
  for (const slug of slugs) revalidatePath(guidePath(slug));
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

/** The slug field, or null when left empty (a new guide then takes one from its title). */
function readSlug(formData: FormData): string | null {
  return String(formData.get('slug') ?? '').trim().toLowerCase() || null;
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
  const coverImageAlt = String(formData.get('coverImageAlt') ?? '').trim();
  if (coverImageUrlRaw && !coverImageAlt) {
    throw new Error('Add alt text for the cover image. It describes the image to screen readers and search engines.');
  }

  return {
    title,
    category,
    excerpt,
    icon,
    accent,
    coverImageUrl: coverImageUrlRaw || null,
    coverImageAlt: coverImageUrlRaw ? coverImageAlt : null,
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
  await assertAdmin();
  let slug: string;
  try {
    slug = await createGuide(readGuideInput(formData), readSlug(formData));
    // Only written when the admin actually drafted at least one FAQ: an
    // empty save here would explicitly override the auto-generated defaults
    // with "no FAQs" for a guide nobody has touched yet, which is worse than
    // just leaving the defaults to apply on their own.
    const faqs = readFaqs(formData);
    if (faqs.length > 0) {
      await savePageFaqs(guidePath(slug), faqs);
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
  await assertAdmin();
  let savedSlug = slug;
  let renameError: string | null = null;
  try {
    const result = await updateGuide(slug, readGuideInput(formData), readSlug(formData));
    savedSlug = result.slug;
    renameError = result.renameError;
    // The FAQ list is the full set: removing every question clears the saved
    // rows, which puts the auto-generated defaults back. Only skipped when
    // the edit page couldn't read the saved FAQs, since the form then started
    // empty and saving it would wipe questions the admin never saw.
    if (formData.get('faqsLoaded') === '1') {
      await savePageFaqs(guidePath(savedSlug), readFaqs(formData));
      revalidateTag(FAQS_CACHE_TAG);
    }
  } catch (error) {
    return { error: error instanceof Error ? error.message : 'Failed to save the guide.' };
  }

  if (savedSlug !== slug) {
    // The redirect row, the SEO settings and nav links resolved through it are all cached under the SEO tag.
    revalidateTag(SEO_CACHE_TAG);
    revalidateTag(FAQS_CACHE_TAG);
  }
  revalidateGuideSurfaces(slug, savedSlug);
  if (renameError) return { error: renameError };
  redirect('/admin/guides');
}

export async function deleteGuideAction(slug: string): Promise<{ error: string | null }> {
  await assertAdmin();
  try {
    await deleteGuide(slug);
  } catch (error) {
    return { error: error instanceof Error ? error.message : 'Failed to delete the guide.' };
  }
  revalidateTag(FAQS_CACHE_TAG);
  revalidateGuideSurfaces(slug);
  return { error: null };
}

export async function duplicateGuideAction(slug: string): Promise<{ error: string | null }> {
  await assertAdmin();
  let copySlug: string;
  try {
    copySlug = await duplicateGuide(slug);
  } catch (error) {
    return { error: error instanceof Error ? error.message : 'Failed to duplicate the guide.' };
  }
  revalidateTag(FAQS_CACHE_TAG);
  revalidateGuideSurfaces(copySlug);
  return { error: null };
}

export async function setGuidePublishedAction(slug: string, isPublished: boolean): Promise<{ error: string | null }> {
  await assertAdmin();
  try {
    await setGuidePublished(slug, isPublished);
  } catch (error) {
    return { error: error instanceof Error ? error.message : 'Failed to change the guide status.' };
  }
  revalidateGuideSurfaces(slug);
  return { error: null };
}

export async function uploadGuideCoverAction(formData: FormData): Promise<GuideCoverUploadState> {
  await assertAdmin();
  const file = formData.get('file');
  if (!(file instanceof File)) return { error: 'Choose an image to upload.', url: null, warnings: [] };
  try {
    const upload = await uploadGuideCover(file, String(formData.get('slugHint') ?? ''));
    return { error: null, url: upload.url, warnings: upload.warnings };
  } catch (error) {
    return { error: error instanceof Error ? error.message : 'The image could not be uploaded.', url: null, warnings: [] };
  }
}

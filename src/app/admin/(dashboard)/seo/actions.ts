'use server';

import { revalidatePath, revalidateTag } from 'next/cache';
import { z } from 'zod';
import {
  assertSeoPageExists,
  deleteSeoRedirect,
  renamePageSlug,
  resetSeoPage,
  saveSeoPage,
  setPageTaskStatus,
  type SeoPageInput,
} from '@/lib/admin/seo';
import { clearRedirectCache, SEO_CACHE_TAG, type SeoTaskStatus } from '@/lib/seo';
import { savePageFaqs } from '@/lib/admin/page-faqs';
import { FAQS_CACHE_TAG } from '@/lib/page-faqs';
import { uniqueValues } from '@/lib/compound-content';
import { saveSupplierContent } from '@/lib/admin/supplier-content';
import { getGeneratedSupplierContent, SUPPLIER_CONTENT_CACHE_TAG } from '@/lib/supplier-content-store';
import {
  SUPPLIER_CONTENT_KEYS,
  supplierContentFieldName,
  toSupplierContentOverride,
  type SupplierContent,
} from '@/lib/supplier-content';

export interface SeoSaveState {
  error: string | null;
  fieldErrors: Partial<Record<string, string>>;
  /** Changes on every successful save, so the form can close itself. */
  savedAt: number | null;
}

const SLUG_PATTERN = /^[a-z0-9]+(-[a-z0-9]+)*$/;

/** Blank means "use the page's default", stored as null. */
const optionalText = (max: number, label: string) =>
  z
    .string()
    .trim()
    .max(max, `${label} can be at most ${max} characters.`)
    .transform((value) => value || null);

const customHtml = (label: string) =>
  z
    .string()
    .max(20000, `${label} can be at most 20,000 characters.`)
    .transform((value) => value.trim() || null);

const seoFormSchema = z.object({
  path: z.string().regex(/^\/[a-z0-9/_-]*$/, 'Unknown page.'),
  kind: z.enum(['static', 'compound', 'supplier', 'guide']),
  slug: z.string().trim(),
  newSlug: z.string().trim().toLowerCase(),
  metaTitle: optionalText(200, 'Meta title'),
  metaDescription: optionalText(500, 'Meta description'),
  h1: optionalText(200, 'H1'),
  keywords: z.array(z.string().trim().max(80, 'Each keyword can be at most 80 characters.')).max(50, 'Up to 50 keywords.'),
  canonicalUrl: optionalText(500, 'Canonical URL').refine(
    (value) => value === null || /^(https?:\/\/|\/)/i.test(value),
    'Use a full https:// URL or a path starting with /.',
  ),
  ogImageUrl: optionalText(500, 'Social image URL').refine(
    (value) => value === null || /^https?:\/\//i.test(value),
    'Use a full https:// image URL.',
  ),
  robotsIndex: z.boolean(),
  robotsFollow: z.boolean(),
  headHtml: customHtml('Custom head code'),
  bodyHtml: customHtml('Custom HTML'),
});

function text(formData: FormData, name: string): string {
  const value = formData.get(name);
  return typeof value === 'string' ? value : '';
}

/** Everything a slug rename or SEO edit can touch: page metadata, nav links, and the renamed row's caches. */
function revalidateSite() {
  // Middleware reads redirects from its own hand-rolled cache, which no
  // revalidateTag reaches, so a rename has to drop it explicitly.
  clearRedirectCache();
  revalidateTag(SEO_CACHE_TAG);
  revalidateTag('products');
  revalidateTag('suppliers');
  revalidateTag('offers');
  // Was missing: a guide rename moved the row (and, via rename_page_slug,
  // its FAQs) to a new slug, but without these the public site kept serving
  // the old slug's cached data for up to 5 minutes.
  revalidateTag('guides');
  // Which vendors have stored reviews is cached by slug; a supplier rename moves its reviews.
  revalidateTag('supplier-reviews');
  revalidateTag(FAQS_CACHE_TAG);
  revalidateTag(SUPPLIER_CONTENT_CACHE_TAG);
  revalidatePath('/', 'layout');
}

const SUPPLIER_TITLE_MAX = 200;
const SUPPLIER_BODY_MAX = 5000;

/**
 * The About / Why / vs-other-suppliers fields from the dialog, or null when the
 * form didn't include them (every non-supplier page). A field that is present
 * but blank is kept as '' and later stored as "use the generated text".
 */
function readSupplierContent(formData: FormData): { content: SupplierContent } | { error: string } | null {
  const field = (key: (typeof SUPPLIER_CONTENT_KEYS)[number], part: 'title' | 'body') => {
    const value = formData.get(supplierContentFieldName(key, part));
    return typeof value === 'string' ? value : null;
  };
  if (field('about', 'title') === null) return null;

  const content = {} as SupplierContent;
  for (const key of SUPPLIER_CONTENT_KEYS) {
    const title = field(key, 'title') ?? '';
    const body = field(key, 'body') ?? '';
    if (title.trim().length > SUPPLIER_TITLE_MAX) {
      return { error: `Supplier section titles can be at most ${SUPPLIER_TITLE_MAX} characters.` };
    }
    if (body.trim().length > SUPPLIER_BODY_MAX) {
      return { error: `Supplier section details can be at most ${SUPPLIER_BODY_MAX.toLocaleString('en-US')} characters.` };
    }
    content[key] = { title, body };
  }
  return { content };
}

function isDefaultInput(input: SeoPageInput): boolean {
  return (
    !input.metaTitle &&
    !input.metaDescription &&
    !input.h1 &&
    input.keywords.length === 0 &&
    !input.canonicalUrl &&
    !input.ogImageUrl &&
    input.robotsIndex &&
    input.robotsFollow &&
    !input.headHtml &&
    !input.bodyHtml
  );
}

function messageOf(error: unknown, fallback: string): string {
  return error instanceof Error ? error.message : fallback;
}

export async function saveSeoPageAction(_prevState: SeoSaveState, formData: FormData): Promise<SeoSaveState> {
  const parsed = seoFormSchema.safeParse({
    path: text(formData, 'path'),
    kind: text(formData, 'kind'),
    slug: text(formData, 'slug'),
    newSlug: text(formData, 'newSlug'),
    metaTitle: text(formData, 'metaTitle'),
    metaDescription: text(formData, 'metaDescription'),
    h1: text(formData, 'h1'),
    keywords: formData.getAll('keywords').filter((value): value is string => typeof value === 'string'),
    canonicalUrl: text(formData, 'canonicalUrl'),
    ogImageUrl: text(formData, 'ogImageUrl'),
    robotsIndex: formData.get('robotsIndex') === 'on',
    robotsFollow: formData.get('robotsFollow') === 'on',
    headHtml: text(formData, 'headHtml'),
    bodyHtml: text(formData, 'bodyHtml'),
  });

  if (!parsed.success) {
    const fieldErrors = Object.fromEntries(
      Object.entries(parsed.error.flatten().fieldErrors).map(([field, messages]) => [field, messages?.[0] ?? 'Invalid value.']),
    );
    return { error: 'Please fix the highlighted fields.', fieldErrors, savedAt: null };
  }

  const form = parsed.data;
  const supplierContent = form.kind === 'supplier' ? readSupplierContent(formData) : null;
  if (supplierContent && 'error' in supplierContent) {
    return { error: supplierContent.error, fieldErrors: {}, savedAt: null };
  }
  const renamable = form.kind === 'compound' || form.kind === 'supplier' || form.kind === 'guide';
  const renaming = renamable && form.newSlug !== '' && form.newSlug !== form.slug;
  if (renaming && !SLUG_PATTERN.test(form.newSlug)) {
    return {
      error: 'Please fix the highlighted fields.',
      fieldErrors: { newSlug: 'Use lowercase letters, numbers and single hyphens, e.g. bpc-157.' },
      savedAt: null,
    };
  }

  const input: SeoPageInput = {
    metaTitle: form.metaTitle,
    metaDescription: form.metaDescription,
    h1: form.h1,
    keywords: uniqueValues(form.keywords),
    canonicalUrl: form.canonicalUrl,
    ogImageUrl: form.ogImageUrl,
    robotsIndex: form.robotsIndex,
    robotsFollow: form.robotsFollow,
    headHtml: form.headHtml,
    bodyHtml: form.bodyHtml,
  };

  let path = form.path;
  let renamed = false;
  let seoSaved = false;
  try {
    await assertSeoPageExists(form.kind, form.path);
    if (renaming && (form.kind === 'compound' || form.kind === 'supplier' || form.kind === 'guide')) {
      path = await renamePageSlug(form.kind, form.slug, form.newSlug);
      renamed = true;
    }
    if (isDefaultInput(input)) await resetSeoPage(path);
    else await saveSeoPage(path, input);
    seoSaved = true;
    if (supplierContent) {
      const slug = path.slice('/suppliers/'.length);
      const generated = await getGeneratedSupplierContent(slug);
      if (!generated) throw new Error(`No supplier exists at ${path}.`);
      await saveSupplierContent(slug, toSupplierContentOverride(supplierContent.content, generated));
    }
  } catch (error) {
    // A rename or SEO save that succeeded is already live, so the page must
    // refresh even though a later step failed.
    if (renamed || seoSaved) revalidateSite();
    const message = messageOf(error, 'Failed to save SEO settings.');
    return {
      error: seoSaved
        ? `The SEO settings were saved, but the supplier page sections could not be: ${message}`
        : renamed
          ? `The slug was changed to ${path}, but the SEO settings could not be saved: ${message}`
          : message,
      fieldErrors: {},
      savedAt: null,
    };
  }

  revalidateSite();
  return { error: null, fieldErrors: {}, savedAt: Date.now() };
}

export async function resetSeoPageAction(path: string): Promise<{ error: string | null }> {
  try {
    await resetSeoPage(path);
  } catch (error) {
    return { error: messageOf(error, 'Failed to reset this page.') };
  }
  revalidateSite();
  return { error: null };
}

const TASK_STATUS_VALUES = ['needs-work', 'pending', 'done'] as const;

/** Workflow-status dropdown in the edit dialog: saved on its own, separate from the rest of the form. */
export async function setPageTaskStatusAction(
  path: string,
  taskStatus: SeoTaskStatus | null,
): Promise<{ error: string | null }> {
  if (taskStatus !== null && !TASK_STATUS_VALUES.includes(taskStatus)) {
    return { error: 'Invalid status.' };
  }
  try {
    await setPageTaskStatus(path, taskStatus);
  } catch (error) {
    return { error: messageOf(error, 'Failed to update this page’s status.') };
  }
  revalidateSite();
  return { error: null };
}

export async function deleteSeoRedirectAction(fromPath: string): Promise<{ error: string | null }> {
  try {
    await deleteSeoRedirect(fromPath);
  } catch (error) {
    return { error: messageOf(error, 'Failed to delete the redirect.') };
  }
  revalidateSite();
  return { error: null };
}

const faqInputSchema = z.object({
  path: z.string().min(1),
  faqs: z
    .array(
      z.object({
        question: z.string().trim().min(1, 'Every FAQ needs a question.'),
        answer: z.string().trim().min(1, 'Every FAQ needs an answer.'),
      }),
    )
    .max(50, 'That is more FAQs than one page should carry.'),
});

/**
 * Replaces a page's FAQ set. The editor always submits the whole list in its
 * current order, so this doubles as add, edit, delete and reorder.
 */
export async function savePageFaqsAction(input: {
  path: string;
  faqs: { question: string; answer: string }[];
}): Promise<{ error: string | null }> {
  const parsed = faqInputSchema.safeParse(input);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? 'Those FAQs could not be saved.' };
  }

  try {
    await savePageFaqs(parsed.data.path, parsed.data.faqs);
  } catch (error) {
    return { error: messageOf(error, 'Failed to save these FAQs.') };
  }

  // The FAQ section and its JSON-LD both read the same cache tag, so one
  // revalidation updates the visible questions and the structured data together.
  revalidateTag(FAQS_CACHE_TAG);
  revalidateSite();
  return { error: null };
}


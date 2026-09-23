import 'server-only';
import { getSupabaseServerClient } from '@/lib/supabase/server';
import { fetchProductIdentitiesFromDb } from '@/lib/supabase/products';
import { fetchSuppliersFromDb } from '@/lib/supabase/suppliers';
import { STATIC_SEO_PAGES } from '@/config/seo-pages';
import { getAllOffers, getGuides, getSuppliers } from '@/lib/repository';
import {
  compoundSeoDefaults,
  guideSeoDefaults,
  supplierSeoDefaults,
  type SeoDefaults,
} from '@/lib/seo-defaults';
import {
  rowToSeoOverride,
  rowToSeoRedirect,
  type SeoOverride,
  type SeoPageRow,
  type SeoRedirect,
  type SeoTaskStatus,
} from '@/lib/seo';
import { AdminDbError } from '@/lib/admin/vendors';
import { fetchPageFaqsFromDb } from '@/lib/supabase/page-faqs';
import { DEFAULT_PAGE_FAQS, defaultGuideFaqs, defaultSupplierFaqs, type FaqItem } from '@/data/default-page-faqs';
import { listSavedSupplierContent } from '@/lib/admin/supplier-content';
import {
  defaultSupplierContent,
  supplierMarketStats,
  type SupplierContent,
  type SupplierContentOverride,
} from '@/lib/supplier-content';

const SEO_MIGRATION = 'supabase/migrations/0010_seo_management.sql';

export type SeoPageKind = 'static' | 'compound' | 'supplier' | 'guide';
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
}

export interface SeoDashboardData {
  entries: SeoEntry[];
  redirects: SeoRedirect[];
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
  return { path: defaults.path, title: defaults.title, description: defaults.description, h1: defaults.h1 };
}

export async function getSeoDashboardData(): Promise<SeoDashboardData> {
  const client = requireClient();
  const [compounds, suppliers, pages, redirects, guides, offers, savedSupplierContent, publicSuppliers] = await Promise.all([
    fetchProductIdentitiesFromDb(client),
    fetchSuppliersFromDb(client, { includeInactive: true }),
    client.from('seo_pages').select('*'),
    client.from('seo_redirects').select('from_path, to_path, created_at').order('created_at', { ascending: false }),
    getGuides(),
    getAllOffers(),
    listSavedSupplierContent(),
    getSuppliers(),
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
      .map((supplier) => toEntry('supplier', 'Suppliers', supplier.name, supplier.slug, supplierSeoDefaults(supplier))),
  ];

  return {
    entries,
    redirects: redirects.error
      ? []
      : ((redirects.data ?? []) as Parameters<typeof rowToSeoRedirect>[0][]).map(rowToSeoRedirect),
    setupError,
  };
}

/** Rejects SEO rows for pages that don't exist, so the table never collects orphans. */
export async function assertSeoPageExists(kind: SeoPageKind, path: string): Promise<void> {
  const exists = await (async () => {
    if (kind === 'static') return STATIC_SEO_PAGES.some((page) => page.path === path);
    if (kind === 'guide') return (await getGuides()).some((guide) => `/guides/${guide.slug}` === path);

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
  const { error } = await requireClient()
    .from('seo_pages')
    .upsert(
      {
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

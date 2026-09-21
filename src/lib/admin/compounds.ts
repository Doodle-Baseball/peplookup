import 'server-only';
import type { SupabaseClient } from '@supabase/supabase-js';
import { getSupabaseServerClient } from '@/lib/supabase/server';
import {
  fetchProductsFromDb,
  fetchProductFromDb,
  fetchProductIdentitiesFromDb,
  compoundInputToProductColumns,
  compoundInputToContentArgs,
} from '@/lib/supabase/products';
import { slugifyCompoundName, uniqueValues, type CompoundInput } from '@/lib/compound-content';
import { createCompoundMatcher, type CompoundIdentity } from '@/lib/compound-import';
import type { Product } from '@/lib/schema';
import { AdminDbError } from '@/lib/admin/vendors';
import { sortByPosition } from '@/lib/display-order';
import { byCompoundOrder } from '@/config/compound-order';

const CONTENT_MIGRATION = 'supabase/migrations/0008_compound_content.sql';

function requireClient() {
  const client = getSupabaseServerClient();
  if (!client) {
    throw new AdminDbError(
      'Supabase is not configured, set SUPABASE_SECRET_KEY and NEXT_PUBLIC_SUPABASE_URL.',
    );
  }
  return client;
}

/**
 * A missing table, column or function all have the same fix, so say what it
 * is instead of surfacing "Could not find the 'benefits_title' column".
 */
function toAdminError(error: { message: string; code?: string }): AdminDbError {
  const missingSchema =
    ['PGRST202', 'PGRST204', 'PGRST205', '42P01', '42703', '42883'].includes(error.code ?? '') ||
    /schema cache|does not exist/i.test(error.message);
  if (!missingSchema) return new AdminDbError(error.message);
  return new AdminDbError(
    `The compound content tables aren't set up yet. Run ${CONTENT_MIGRATION} in the Supabase SQL editor, then try again. (${error.message})`,
  );
}

/** Same order as the home page: `position` (the admin's drag-and-drop), falling
 * back to the curated compound order for anything never dragged. */
export async function listCompounds(query?: string): Promise<Product[]> {
  const client = requireClient();
  const products = await fetchProductsFromDb(client);
  if (products === null) {
    throw new AdminDbError(
      'The products table could not be read. Run supabase/migrations/0003_products.sql in the Supabase SQL editor first.',
    );
  }
  const ordered = sortByPosition(products, byCompoundOrder);
  const q = query?.trim().toLowerCase();
  if (!q) return ordered;
  return ordered.filter((p) => p.name.toLowerCase().includes(q));
}

export async function getCompound(slug: string): Promise<Product | null> {
  return fetchProductFromDb(requireClient(), slug);
}

async function uniqueSlugFor(name: string, client: SupabaseClient): Promise<string> {
  const base = slugifyCompoundName(name);
  if (!base) throw new AdminDbError('Compound name must contain at least one letter or number.');
  let candidate = base;
  let suffix = 2;
  for (;;) {
    const { data, error } = await client.from('products').select('slug').eq('slug', candidate).maybeSingle();
    if (error) throw toAdminError(error);
    if (!data) return candidate;
    candidate = `${base}-${suffix}`;
    suffix += 1;
  }
}

async function replaceContent(client: SupabaseClient, slug: string, input: CompoundInput): Promise<void> {
  const { error } = await client.rpc('replace_product_content', compoundInputToContentArgs(slug, input));
  if (error) throw toAdminError(error);
}

/** Returns the new compound's slug. */
export async function createCompound(input: CompoundInput): Promise<string> {
  const client = requireClient();
  const slug = await uniqueSlugFor(input.name, client);
  const { error } = await client.from('products').insert({ slug, ...compoundInputToProductColumns(input) });
  if (error) throw toAdminError(error);

  try {
    await replaceContent(client, slug, input);
  } catch (contentError) {
    // Don't leave a half-created compound behind (basic info saved, content missing).
    await client.from('products').delete().eq('slug', slug);
    throw contentError;
  }
  return slug;
}

export async function updateCompound(slug: string, input: CompoundInput): Promise<void> {
  const client = requireClient();
  const { data, error } = await client
    .from('products')
    .update(compoundInputToProductColumns(input))
    .eq('slug', slug)
    .select('slug');
  if (error) throw toAdminError(error);
  if (!data || data.length === 0) throw new AdminDbError('That compound no longer exists.');
  await replaceContent(client, slug, input);
}

export async function setCompoundFlag(slug: string, isCompound: boolean): Promise<void> {
  const client = requireClient();
  const { error } = await client.from('products').update({ is_compound: isCompound }).eq('slug', slug);
  if (error) throw new AdminDbError(error.message);
}

export async function deleteCompound(slug: string): Promise<void> {
  const client = requireClient();
  // Content rows go with it (on delete cascade in 0008).
  const { error } = await client.from('products').delete().eq('slug', slug);
  if (error) throw new AdminDbError(error.message);
}

export interface CompoundImportContext {
  identities: CompoundIdentity[];
  /** Categories already in use, split out of multi-category values. */
  categories: string[];
}

/** What the upload page previews against: existing compounds and their categories. */
export async function getCompoundImportContext(): Promise<CompoundImportContext> {
  const identities = await fetchProductIdentitiesFromDb(requireClient());
  if (!identities) {
    throw new AdminDbError(
      'The products table could not be read. Run supabase/migrations/0003_products.sql in the Supabase SQL editor first.',
    );
  }
  const categories = uniqueValues(identities.flatMap((identity) => (identity.category ?? '').split(',')));
  return {
    identities: identities.map(({ slug, name }) => ({ slug, name })),
    categories: categories.sort((a, b) => a.localeCompare(b)),
  };
}

export type CompoundImportStatus = 'created' | 'updated' | 'skipped' | 'failed';

export interface CompoundImportOutcome {
  rowNumber: number;
  name: string;
  status: CompoundImportStatus;
  slug: string | null;
  messages: string[];
}

const IMPORT_MIGRATION = 'supabase/migrations/0009_compound_csv_import.sql';

/**
 * Compounds per RPC call. Each batch is one transaction; this keeps a single
 * statement well inside Supabase's timeout while a big file still needs only
 * a handful of round trips.
 */
const IMPORT_BATCH_SIZE = 200;

function toImportError(error: { message: string; code?: string }): AdminDbError {
  if (error.code === 'PGRST202' || /import_compounds|jsonb_to_text_array/.test(error.message)) {
    return new AdminDbError(
      `The bulk import function isn't set up yet. Run ${IMPORT_MIGRATION} in the Supabase SQL editor, then try again. (${error.message})`,
    );
  }
  return toAdminError(error);
}

function nextFreeSlug(name: string, takenSlugs: ReadonlySet<string>): string {
  const base = slugifyCompoundName(name);
  let candidate = base;
  for (let suffix = 2; takenSlugs.has(candidate); suffix += 1) candidate = `${base}-${suffix}`;
  return candidate;
}

/**
 * Writes validated CSV rows in transactional batches through
 * public.import_compounds (0009), which saves into the same tables as the
 * admin form. If a batch fails, none of its compounds are written and later
 * batches aren't attempted, so the outcome list always matches the database.
 */
export async function importCompounds(
  rows: readonly { rowNumber: number; input: CompoundInput }[],
  onExisting: 'skip' | 'update',
): Promise<CompoundImportOutcome[]> {
  const client = requireClient();
  const identities = await fetchProductIdentitiesFromDb(client);
  if (!identities) {
    throw new AdminDbError(
      'The products table could not be read. Run supabase/migrations/0003_products.sql in the Supabase SQL editor first.',
    );
  }
  const matcher = createCompoundMatcher(identities);
  const takenSlugs = new Set(identities.map((identity) => identity.slug));
  const rowBySlug = new Map<string, number>();

  const outcomes: CompoundImportOutcome[] = [];
  const writes: { outcome: CompoundImportOutcome; payload: Record<string, unknown> }[] = [];

  for (const { rowNumber, input } of rows) {
    const base = { rowNumber, name: input.name };
    const existingSlug = matcher.existingSlugFor(input.name);

    if (existingSlug && onExisting === 'skip') {
      outcomes.push({ ...base, status: 'skipped', slug: existingSlug, messages: ['Already exists, left unchanged.'] });
      continue;
    }

    const slug = existingSlug ?? nextFreeSlug(input.name, takenSlugs);
    // Two differently named rows can still resolve to one compound (one by name, one by slug).
    const earlierRow = rowBySlug.get(slug);
    if (earlierRow !== undefined) {
      outcomes.push({
        ...base,
        status: 'failed',
        slug,
        messages: [`Matches the same compound as row ${earlierRow}, each compound can appear once per file.`],
      });
      continue;
    }
    rowBySlug.set(slug, rowNumber);
    takenSlugs.add(slug);

    const outcome: CompoundImportOutcome = { ...base, status: existingSlug ? 'updated' : 'created', slug, messages: [] };
    outcomes.push(outcome);

    const content = compoundInputToContentArgs(slug, input);
    writes.push({
      outcome,
      payload: {
        slug,
        mode: existingSlug ? 'update' : 'create',
        product: compoundInputToProductColumns(input),
        benefits: content.p_benefits,
        evidence: content.p_evidence,
        interactions: content.p_interactions,
        dosage: content.p_dosage,
      },
    });
  }

  let batchFailure: string | null = null;
  for (let start = 0; start < writes.length; start += IMPORT_BATCH_SIZE) {
    const batch = writes.slice(start, start + IMPORT_BATCH_SIZE);
    if (batchFailure) {
      for (const { outcome } of batch) {
        outcome.status = 'failed';
        outcome.messages = ['Not imported, an earlier batch failed (see the first failed row).'];
      }
      continue;
    }

    const { error } = await client.rpc('import_compounds', { p_compounds: batch.map((write) => write.payload) });
    if (!error) continue;

    batchFailure = toImportError(error).message;
    for (const { outcome } of batch) {
      outcome.status = 'failed';
      outcome.messages = [`Not imported, this batch of ${batch.length} was rolled back: ${batchFailure}`];
    }
  }

  return outcomes;
}

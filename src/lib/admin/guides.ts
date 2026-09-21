import 'server-only';
import { getSupabaseServerClient } from '@/lib/supabase/server';
import {
  fetchGuidesFromDb,
  fetchGuideFromDb,
  guideInputToRow,
  type GuideInput,
} from '@/lib/supabase/guides';
import { AdminDbError } from '@/lib/admin/vendors';
import { guides as seedGuides, type Guide } from '@/data/guides';

const MIGRATION_HINT =
  'Run supabase/migrations/0012_guides.sql in the Supabase SQL editor first.';

function requireClient() {
  const client = getSupabaseServerClient();
  if (!client) {
    throw new AdminDbError(
      'Supabase is not configured, set SUPABASE_SECRET_KEY and NEXT_PUBLIC_SUPABASE_URL.',
    );
  }
  return client;
}

export function slugifyGuideTitle(title: string): string {
  return title
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
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

export async function createGuide(input: GuideInput): Promise<string> {
  const client = requireClient();
  const base = slugifyGuideTitle(input.title);
  if (!base) throw new AdminDbError('The guide title must contain at least one letter or number.');

  let slug = base;
  let suffix = 2;
  while (await slugIsTaken(slug)) {
    slug = `${base}-${suffix}`;
    suffix += 1;
  }

  const { error } = await client.from('guides').insert(guideInputToRow(slug, input));
  if (error) throw new AdminDbError(`${error.message}. ${MIGRATION_HINT}`);
  return slug;
}

export async function updateGuide(slug: string, input: GuideInput): Promise<void> {
  const client = requireClient();
  const row = guideInputToRow(slug, input);

  // A guide that ships in the repository has no row yet: the first save writes
  // one, which then takes precedence over the built-in copy by slug.
  const existing = await fetchGuideFromDb(client, slug);
  const { error } = existing
    ? await client.from('guides').update(row).eq('slug', slug)
    : await client.from('guides').insert(row);

  if (error) throw new AdminDbError(`${error.message}. ${MIGRATION_HINT}`);
}

export async function deleteGuide(slug: string): Promise<void> {
  const client = requireClient();
  const { error } = await client.from('guides').delete().eq('slug', slug);
  if (error) throw new AdminDbError(`${error.message}. ${MIGRATION_HINT}`);
}

import 'server-only';
import type { SupabaseClient } from '@supabase/supabase-js';
import type { Guide, GuideAccent, GuideIcon, GuideSection } from '@/data/guides';

/** Snake_case shape of a row in the `guides` table (see supabase/migrations/0012). */
export interface GuideRow {
  slug: string;
  title: string;
  category: string;
  excerpt: string;
  icon: GuideIcon;
  accent: GuideAccent;
  cover_image_url: string | null;
  read_minutes: number;
  published_at: string;
  sections: GuideSection[];
  related_tool_label: string | null;
  related_tool_href: string | null;
  is_published: boolean;
}

export function rowToGuide(row: GuideRow): Guide {
  return {
    slug: row.slug,
    title: row.title,
    category: row.category,
    excerpt: row.excerpt,
    icon: row.icon,
    accent: row.accent,
    coverImageUrl: row.cover_image_url,
    readMinutes: row.read_minutes,
    publishedAt: row.published_at,
    sections: Array.isArray(row.sections) ? row.sections : [],
    ...(row.related_tool_label && row.related_tool_href
      ? { relatedTool: { label: row.related_tool_label, href: row.related_tool_href } }
      : {}),
  };
}

export interface GuideInput {
  title: string;
  category: string;
  excerpt: string;
  icon: GuideIcon;
  accent: GuideAccent;
  coverImageUrl: string | null;
  readMinutes: number;
  publishedAt: string;
  sections: GuideSection[];
  relatedToolLabel: string | null;
  relatedToolHref: string | null;
  isPublished: boolean;
}

export function guideInputToRow(slug: string, input: GuideInput) {
  return {
    slug,
    title: input.title,
    category: input.category,
    excerpt: input.excerpt,
    icon: input.icon,
    accent: input.accent,
    cover_image_url: input.coverImageUrl,
    read_minutes: input.readMinutes,
    published_at: input.publishedAt,
    sections: input.sections,
    related_tool_label: input.relatedToolLabel,
    related_tool_href: input.relatedToolHref,
    is_published: input.isPublished,
  };
}

/**
 * Reads guides from Supabase. Returns null (not []) on any failure, missing
 * table, network error, bad credentials, so callers fall back to the guides
 * that ship in the repository instead of showing an empty library.
 */
export async function fetchGuidesFromDb(
  client: SupabaseClient,
  { includeUnpublished = false }: { includeUnpublished?: boolean } = {},
): Promise<Guide[] | null> {
  let query = client.from('guides').select('*').order('published_at', { ascending: false });
  if (!includeUnpublished) query = query.eq('is_published', true);
  const { data, error } = await query;
  if (error || !data) return null;
  return (data as GuideRow[]).map(rowToGuide);
}

export async function fetchGuideFromDb(client: SupabaseClient, slug: string): Promise<Guide | null> {
  const { data, error } = await client.from('guides').select('*').eq('slug', slug).maybeSingle();
  if (error || !data) return null;
  return rowToGuide(data as GuideRow);
}

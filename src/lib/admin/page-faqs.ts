import 'server-only';
import { getSupabaseServerClient } from '@/lib/supabase/server';
import { fetchPageFaqsFromDb, replacePageFaqsInDb } from '@/lib/supabase/page-faqs';
import { AdminDbError } from '@/lib/admin/vendors';
import type { FaqItem } from '@/data/default-page-faqs';

const FAQ_MIGRATION = 'supabase/migrations/0014_page_faqs.sql';

function requireClient() {
  const client = getSupabaseServerClient();
  if (!client) {
    throw new AdminDbError(
      'Supabase is not configured, set SUPABASE_SECRET_KEY and NEXT_PUBLIC_SUPABASE_URL.',
    );
  }
  return client;
}

/** Saved FAQs for every page, keyed by path. Empty map when nothing is stored yet. */
export async function listStoredFaqsByPath(): Promise<Map<string, FaqItem[]>> {
  const client = requireClient();
  const byPath = await fetchPageFaqsFromDb(client);
  if (byPath === null) {
    throw new AdminDbError(
      `The page_faqs table could not be read. Run ${FAQ_MIGRATION} in the Supabase SQL editor first.`,
    );
  }
  return byPath;
}

/**
 * Writes the full FAQ set for one page. An empty array is a valid save: it
 * means "this page has no FAQs", which is distinct from never having been
 * edited (where the built-in defaults still show).
 */
export async function savePageFaqs(path: string, faqs: readonly FaqItem[]): Promise<void> {
  const client = requireClient();

  const cleaned = faqs
    .map((faq) => ({ question: faq.question.trim(), answer: faq.answer.trim() }))
    .filter((faq) => faq.question !== '' && faq.answer !== '');

  const { error } = await replacePageFaqsInDb(client, path, cleaned);
  if (!error) return;

  if (error.includes('page_faqs') || error.includes('schema cache')) {
    throw new AdminDbError(
      `FAQs need the page_faqs table. Run ${FAQ_MIGRATION} in the Supabase SQL editor, then try again.`,
    );
  }
  throw new AdminDbError(error);
}

import 'server-only';
import { unstable_cache } from 'next/cache';
import { site } from '@/config/site';
import { getSuppliers } from '@/lib/repository';
import { getSupabaseServerClient } from '@/lib/supabase/server';
import { fetchExtensionSettingsFromDb, isMissingMigrationError } from '@/lib/supabase/supplier-extension';
import { buildExtensionFeed, type ExtensionFeed, type SupplierExtensionSettings } from '@/lib/extension/feed';
import type { AffiliateClickSource, UninstallReason } from '@/lib/extension/schema';

export const SITE_ORIGIN = `https://${site.domain}`;

/** The feed's own cache window. Every admin supplier save drops it early via the 'suppliers' tag. */
const FEED_REVALIDATE_SECONDS = 900;

export class ExtensionFeedUnavailableError extends Error {}

/**
 * Tagged 'suppliers' like getSuppliers(), so the revalidateTag('suppliers')
 * every admin supplier save already runs refreshes the feed at the same moment.
 * A failed read throws, which unstable_cache never stores.
 */
const getExtensionSettingsCached = unstable_cache(
  async (): Promise<readonly SupplierExtensionSettings[]> => {
    const client = getSupabaseServerClient();
    if (!client) throw new ExtensionFeedUnavailableError('Supabase is not configured.');
    return fetchExtensionSettingsFromDb(client);
  },
  ['supplier-extension-settings'],
  { revalidate: FEED_REVALIDATE_SECONDS, tags: ['suppliers'] },
);

/**
 * The feed the Chrome extension reads. Supplier names, codes and ratings come
 * from the same getSuppliers() the public pages render, so the extension
 * always shows what /coupons shows.
 */
export async function getExtensionFeed(): Promise<ExtensionFeed> {
  const [suppliers, settings] = await Promise.all([getSuppliers(), getExtensionSettingsCached()]);
  return buildExtensionFeed(suppliers, settings, SITE_ORIGIN);
}

function requireClient() {
  const client = getSupabaseServerClient();
  if (!client) throw new Error('Supabase is not configured, set SUPABASE_SECRET_KEY and NEXT_PUBLIC_SUPABASE_URL.');
  return client;
}

export async function recordAffiliateClick(supplierSlug: string, source: AffiliateClickSource): Promise<void> {
  const { error } = await requireClient().from('affiliate_clicks').insert({ supplier_slug: supplierSlug, source });
  if (error) throw new Error(`Could not record the affiliate click: ${error.message}`);
}

export async function saveUninstallFeedback(reason: UninstallReason | null, details: string | null): Promise<void> {
  const { error } = await requireClient().from('extension_uninstall_feedback').insert({ reason, details });
  if (isMissingMigrationError(error)) {
    throw new Error('Feedback table missing. Run supabase/migrations/0029_chrome_extension.sql.');
  }
  if (error) throw new Error(`Could not save the feedback: ${error.message}`);
}

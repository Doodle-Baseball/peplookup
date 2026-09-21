'use client';

import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import { supabasePublishableKey, supabaseUrl } from './config';

let browserClient: SupabaseClient | null = null;

/**
 * Browser client, scoped to the publishable key only. Returns null rather
 * than throwing when Supabase is not configured, so pages keep working on
 * the static seed data until the project is wired up.
 */
export function getSupabaseBrowserClient(): SupabaseClient | null {
  const url = supabaseUrl();
  const key = supabasePublishableKey();
  if (!url || !key) return null;
  browserClient ??= createClient(url, key);
  return browserClient;
}

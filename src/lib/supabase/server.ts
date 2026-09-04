import 'server-only';
import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import { supabaseSecretKey, supabaseUrl } from './config';

/**
 * Privileged server client. The `server-only` import makes bundling this into
 * a client component a build error rather than a runtime secret leak.
 */
export function getSupabaseServerClient(): SupabaseClient | null {
  const url = supabaseUrl();
  const key = supabaseSecretKey();
  if (!url || !key) return null;
  return createClient(url, key, { auth: { persistSession: false } });
}

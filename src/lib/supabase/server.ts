import 'server-only';
import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import { supabaseSecretKey, supabaseUrl } from './config';

/**
 * Built once per server instance rather than per call. Nothing here is
 * request-scoped (service key, no session persistence), and a single page
 * render asks for a client dozens of times over, once per repository read.
 */
let client: SupabaseClient | null | undefined;

/**
 * Privileged server client. The `server-only` import makes bundling this into
 * a client component a build error rather than a runtime secret leak.
 */
export function getSupabaseServerClient(): SupabaseClient | null {
  if (client !== undefined) return client;
  const url = supabaseUrl();
  const key = supabaseSecretKey();
  client = url && key ? createClient(url, key, { auth: { persistSession: false } }) : null;
  return client;
}

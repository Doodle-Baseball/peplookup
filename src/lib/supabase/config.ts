export function supabaseUrl(): string | null {
  return process.env.NEXT_PUBLIC_SUPABASE_URL ?? null;
}

export function supabasePublishableKey(): string | null {
  return process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ?? null;
}

/** Server-only. Never referenced from a 'use client' file or exposed to the browser. */
export function supabaseSecretKey(): string | null {
  return process.env.SUPABASE_SECRET_KEY ?? null;
}

export function isSupabaseConfigured(): boolean {
  return Boolean(supabaseUrl() && supabasePublishableKey());
}

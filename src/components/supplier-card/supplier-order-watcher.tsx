'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { getSupabaseBrowserClient } from '@/lib/supabase/client';

/** Several row updates land in quick succession from one drag-and-drop save; this collapses them into one refresh. */
const REFRESH_DEBOUNCE_MS = 500;

/**
 * Renders nothing. Refreshes this page's server data live whenever a vendor
 * row changes in Supabase, in particular the drag-and-drop reorder on
 * /admin/vendors, which writes one row per moved slug and would otherwise
 * only reach an already-open /suppliers tab on its next visit.
 *
 * `router.refresh()` re-runs this route's server components against the
 * current URL and patches the result in, not a full page reload: scroll
 * position, any open menus and client state elsewhere on the page are
 * untouched. The admin's save action already revalidates the `suppliers`
 * cache tag as part of the same request that writes the row, so by the time
 * the debounce below elapses the refreshed data is already there to serve.
 *
 * Does nothing if Supabase isn't configured, or if the `suppliers` table
 * hasn't been added to the `supabase_realtime` publication yet (see
 * supabase/migrations/0017_suppliers_realtime.sql), the subscription then
 * simply never fires, same as before this existed.
 */
export function SupplierOrderWatcher() {
  const router = useRouter();

  useEffect(() => {
    const client = getSupabaseBrowserClient();
    if (!client) return;

    let timer: ReturnType<typeof setTimeout> | null = null;
    const scheduleRefresh = () => {
      if (timer) clearTimeout(timer);
      timer = setTimeout(() => router.refresh(), REFRESH_DEBOUNCE_MS);
    };

    const channel = client
      .channel('suppliers-order')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'suppliers' }, scheduleRefresh)
      .subscribe();

    return () => {
      if (timer) clearTimeout(timer);
      void client.removeChannel(channel);
    };
  }, [router]);

  return null;
}

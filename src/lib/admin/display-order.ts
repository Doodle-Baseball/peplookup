import 'server-only';
import { getSupabaseServerClient } from '@/lib/supabase/server';
import { AdminDbError } from '@/lib/admin/vendors';
import { positionsForOrder } from '@/lib/display-order';

type OrderableTable = 'suppliers' | 'products';

function missingPositionColumn(message: string): boolean {
  return message.includes('position') && (message.includes('column') || message.includes('schema cache'));
}

/**
 * Writes the dragged order as `position` values, one update per row.
 *
 * Supabase has no batched "update these rows to these different values" call,
 * and an upsert would need every non-null column of each row, so this issues
 * one narrow update per slug. The lists here are tens of rows, not thousands.
 */
export async function saveDisplayOrder(table: OrderableTable, slugs: readonly string[]): Promise<void> {
  const client = getSupabaseServerClient();
  if (!client) {
    throw new AdminDbError(
      'Supabase is not configured, set SUPABASE_SECRET_KEY and NEXT_PUBLIC_SUPABASE_URL.',
    );
  }

  const updates = positionsForOrder(slugs);
  const results = await Promise.all(
    updates.map(({ slug, position }) => client.from(table).update({ position }).eq('slug', slug)),
  );

  for (const { error } of results) {
    if (!error) continue;
    if (missingPositionColumn(error.message)) {
      throw new AdminDbError(
        'Ordering needs the `position` column. Run supabase/migrations/0013_display_order.sql in the Supabase SQL editor, then try again.',
      );
    }
    throw new AdminDbError(error.message);
  }
}

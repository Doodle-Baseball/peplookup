// Splits compound categories that were stored as one "X and Y" string into
// separate comma-separated values, so each renders as its own badge.
//
// `category` holds a comma-separated list (see src/lib/categories.ts), so
// "Weight Loss and Metabolic" was one category, not two. Safe to re-run: a row
// already holding the target value is left alone.
const fs = require('fs');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');

/** slug -> the exact category string it should end up with. */
const CATEGORIES = {
  tirzepatide: 'Weight Loss, Metabolic',
  semaglutide: 'Weight Loss, Metabolic',
  retatrutide: 'Weight Loss, Metabolic',
  cagrilintide: 'Weight Loss, Metabolic',
  mazdutide: 'Weight Loss, Metabolic',
  survodutide: 'Weight Loss, Metabolic',
  '5-amino-1mq': 'Weight Loss, Metabolic',
  cagrisema: 'Weight Loss, Metabolic, Blends',
  'melanotan-2': 'Skin, Hair',
  'melanotan-i': 'Skin, Hair',
  'ahk-cu': 'Skin, Hair',
  dsip: 'Sleep, Recovery',
};

function createAdminClient() {
  const envPath = path.join(__dirname, '..', '.env.local');
  const env = {};
  for (const line of fs.readFileSync(envPath, 'utf8').split(/\r?\n/)) {
    const match = line.match(/^([A-Z0-9_]+)=(.*)$/);
    if (match) env[match[1]] = match[2];
  }
  return createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SECRET_KEY, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

async function main() {
  const client = createAdminClient();
  const slugs = Object.keys(CATEGORIES);

  const { data: rows, error } = await client.from('products').select('slug, category').in('slug', slugs);
  if (error) throw new Error(`Could not read products: ${error.message}`);

  const missing = slugs.filter((slug) => !rows.some((row) => row.slug === slug));
  if (missing.length > 0) throw new Error(`No such compounds: ${missing.join(', ')}. Nothing changed.`);

  let updated = 0;
  for (const row of rows) {
    const next = CATEGORIES[row.slug];
    if (row.category === next) {
      console.log(`  ${row.slug}: already "${next}"`);
      continue;
    }
    const { error: updateError } = await client
      .from('products')
      .update({ category: next })
      .eq('slug', row.slug);
    if (updateError) throw new Error(`Update failed for ${row.slug}: ${updateError.message}`);
    console.log(`  ${row.slug}: "${row.category}" -> "${next}"`);
    updated++;
  }

  console.log(updated > 0 ? `Updated ${updated} compounds.` : 'Every compound already had its split categories.');
}

main().catch((error) => {
  console.error(error.message);
  process.exit(1);
});

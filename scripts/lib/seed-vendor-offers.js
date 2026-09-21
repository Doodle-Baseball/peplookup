// Shared by the scripts/seed-*-offers.js files: adds one vendor's listings to
// the Supabase `offers` table. Safe to re-run: a listing already stored for the
// same compound, form and size is left alone rather than duplicated. When the
// offers table has no coa_url column yet (supabase/migrations/0007_offers_coa_url.sql)
// the listings still go in, and a re-run after the migration attaches the COA
// links to rows already stored.
const fs = require('fs');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');

function createAdminClient() {
  const envPath = path.join(__dirname, '..', '..', '.env.local');
  const env = {};
  for (const line of fs.readFileSync(envPath, 'utf8').split(/\r?\n/)) {
    const match = line.match(/^([A-Z0-9_]+)=(.*)$/);
    if (match) env[match[1]] = match[2];
  }
  return createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SECRET_KEY, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

/**
 * @param {object} options
 * @param {string} options.supplierSlug
 * @param {Array<{ productSlug: string, form?: 'vial' | 'capsule' | 'spray' | 'kit' | 'pen' | 'serum', mg: number,
 *   priceCents: number, imageUrl: string | null, coaUrl: string | null, productUrl: string }>} options.listings
 *   `mg` is the size on the site's micrograms-per-vial scale divided by 1000; `form` defaults to vial.
 */
async function seedVendorOffers({ supplierSlug, listings }) {
  const client = createAdminClient();
  const formOf = (listing) => listing.form ?? 'vial';
  // Pack count is part of the key so a single vial and a multi-vial kit of the same size stay separate listings.
  const keyOf = (productSlug, form, vialSize, vialCount) => `${productSlug}:${form}:${vialSize}:${vialCount}`;
  const listingKey = (listing) => keyOf(listing.productSlug, formOf(listing), listing.mg * 1000, listing.count ?? 1);

  const { data: supplier, error: supplierError } = await client
    .from('suppliers')
    .select('slug, name')
    .eq('slug', supplierSlug)
    .maybeSingle();
  if (supplierError) throw new Error(`Could not read suppliers: ${supplierError.message}`);
  if (!supplier) throw new Error(`No supplier with slug "${supplierSlug}". Nothing added.`);

  const productSlugs = [...new Set(listings.map((listing) => listing.productSlug))];
  const { data: products, error: productsError } = await client.from('products').select('slug').in('slug', productSlugs);
  if (productsError) throw new Error(`Could not read products: ${productsError.message}`);
  const missing = productSlugs.filter((slug) => !products.some((product) => product.slug === slug));
  if (missing.length > 0) throw new Error(`Missing compounds: ${missing.join(', ')}. Nothing added.`);

  const { error: coaColumnError } = await client.from('offers').select('coa_url').limit(1);
  const hasCoaColumn = !coaColumnError;

  const { data: existing, error: existingError } = await client
    .from('offers')
    .select(hasCoaColumn ? 'id, product_slug, form, vial_size, vial_count, coa_url' : 'id, product_slug, form, vial_size, vial_count')
    .eq('supplier_slug', supplierSlug);
  if (existingError) throw new Error(`Could not read offers: ${existingError.message}`);
  const storedByKey = new Map(existing.map((row) => [keyOf(row.product_slug, row.form, row.vial_size, row.vial_count), row]));

  const scrapedAt = new Date().toISOString();
  const rows = listings
    .filter((listing) => !storedByKey.has(listingKey(listing)))
    .map((listing) => ({
      product_slug: listing.productSlug,
      supplier_slug: supplierSlug,
      form: formOf(listing),
      vial_size: listing.mg * 1000,
      // `count` is units in the pack (e.g. 60 capsules of `mg` each); `inStock` defaults to in stock.
      vial_count: listing.count ?? 1,
      list_price: listing.priceCents,
      sale_price: null,
      currency: 'USD',
      in_stock: listing.inStock ?? true,
      product_url: listing.productUrl,
      image_url: listing.imageUrl,
      lab_report: null,
      ...(hasCoaColumn ? { coa_url: listing.coaUrl } : {}),
      scraped_at: scrapedAt,
    }));

  if (rows.length > 0) {
    const { data: inserted, error: insertError } = await client
      .from('offers')
      .insert(rows)
      .select('product_slug, form, vial_size, list_price');
    if (insertError) throw new Error(`Insert failed: ${insertError.message}`);
    console.log(`Added ${inserted.length} ${supplier.name} listings:`);
    for (const row of inserted) {
      console.log(`  ${row.product_slug} ${row.form} ${row.vial_size / 1000}mg $${(row.list_price / 100).toFixed(2)}`);
    }
  } else {
    console.log(`Every ${supplier.name} listing is already stored. Nothing added.`);
  }

  if (!hasCoaColumn) {
    console.log(
      'COA links not saved to the database: the offers table has no coa_url column yet. Run ' +
        'supabase/migrations/0007_offers_coa_url.sql in the Supabase SQL editor, then run this script again.',
    );
    return;
  }

  let coaLinked = 0;
  for (const listing of listings) {
    const stored = storedByKey.get(listingKey(listing));
    if (!stored || stored.coa_url || !listing.coaUrl) continue;
    const { error: updateError } = await client.from('offers').update({ coa_url: listing.coaUrl }).eq('id', stored.id);
    if (updateError) throw new Error(`COA link update failed for ${listingKey(listing)}: ${updateError.message}`);
    coaLinked++;
  }
  if (coaLinked > 0) console.log(`Attached COA links to ${coaLinked} existing listings.`);
}

function runSeed(options) {
  seedVendorOffers(options).catch((error) => {
    console.error(error.message);
    process.exit(1);
  });
}

module.exports = { runSeed };

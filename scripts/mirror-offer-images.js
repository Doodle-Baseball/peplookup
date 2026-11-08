// One-off backfill: copies every offer picture that still points at a supplier's website into our
// own "product-images" storage bucket (WebP, max 800px wide, {supplier-slug}-{product-slug}.webp),
// saves OUR URL in offers.image_url and keeps the supplier's original in offers.image_source_url.
//
//   node scripts/mirror-offer-images.js                       dry run: downloads and converts in memory, writes nothing
//   node scripts/mirror-offer-images.js --apply --backup=FILE writes storage and the database (FILE gets every old image_url first)
//
// Options: --supplier=SLUG (one supplier only), --overrides=FILE (JSON { "<stored image_url>": "<working source URL>" }
// for suppliers whose files moved), --failures=FILE (CSV of everything that could not be copied; default image-mirror-failures.csv
// next to the backup or in the current folder), --concurrency=N (default 8).
//
// Pictures that fail are retried once, gently (3 at a time), before they are reported: many shops refuse a burst of requests.
// Needs supabase/migrations/0032_offers_image_source_url.sql run first for --apply. Safe to re-run: pictures
// already in our bucket are skipped, and a failure leaves that offer's image_url exactly as it was.
const fs = require('fs');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');
const { hasImageSourceColumn, isOwnImageUrl, mirrorImage } = require('./lib/mirror-offer-images');

const args = Object.fromEntries(
  process.argv.slice(2).map((arg) => {
    const [key, ...rest] = arg.replace(/^--/, '').split('=');
    return [key, rest.length ? rest.join('=') : true];
  }),
);
const apply = args.apply === true;
const concurrency = Number(args.concurrency) || 8;
const RETRY_CONCURRENCY = 3;
const RETRY_PAUSE_MS = 800;
// What is worth a second go: a timeout, a dropped connection, a refusal or a server error. A 404 or 410 is an answer.
const RETRYABLE = /timed out|aborted due to timeout|fetch failed|request failed|HTTP (403|429|5\d\d)/;

function loadEnv() {
  const env = {};
  for (const line of fs.readFileSync(path.join(__dirname, '..', '.env.local'), 'utf8').split(/\r?\n/)) {
    const match = line.match(/^([A-Z0-9_]+)=(.*)$/);
    if (match) env[match[1]] = match[2];
  }
  return env;
}

async function fetchAllOffers(client, withSource) {
  const all = [];
  for (let from = 0; ; from += 1000) {
    const { data, error } = await client
      .from('offers')
      .select(withSource ? 'id, supplier_slug, product_slug, image_url, image_source_url' : 'id, supplier_slug, product_slug, image_url')
      .order('id', { ascending: true })
      .range(from, from + 999);
    if (error) throw new Error(`Could not read offers: ${error.message}`);
    all.push(...data);
    if (data.length < 1000) break;
  }
  return all;
}

const csvCell = (value) => `"${String(value ?? '').replace(/"/g, '""')}"`;
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

async function main() {
  const env = loadEnv();
  const client = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SECRET_KEY, { auth: { persistSession: false, autoRefreshToken: false } });
  const overrides = args.overrides ? JSON.parse(fs.readFileSync(args.overrides, 'utf8')) : {};

  const columnExists = await hasImageSourceColumn(client);
  if (apply && !columnExists) {
    throw new Error('offers.image_source_url does not exist yet. Run supabase/migrations/0032_offers_image_source_url.sql in the Supabase SQL editor, then run this again.');
  }
  if (apply && typeof args.backup !== 'string') throw new Error('--apply needs --backup=FILE so the old image URLs can be put back.');
  console.log(apply ? 'APPLY: writing to storage and the database.' : 'DRY RUN: nothing is written. Add --apply --backup=FILE to write.');
  if (!columnExists) console.log('(image_source_url column not found yet, so a dry run cannot read what is already mirrored.)');

  const offers = (await fetchAllOffers(client, columnExists)).filter((offer) => !args.supplier || offer.supplier_slug === args.supplier);
  const withImage = offers.filter((offer) => offer.image_url);
  const candidates = withImage.filter((offer) => !isOwnImageUrl(offer.image_url, env.NEXT_PUBLIC_SUPABASE_URL));
  console.log(`offers: ${offers.length} | with an image: ${withImage.length} | already ours: ${withImage.length - candidates.length} | to copy: ${candidates.length}`);

  // One download per distinct picture: sizes of one product often share a photo.
  const tasks = new Map(); // "supplier|product" -> Map(sourceUrl -> { ids, storedUrl })
  for (const offer of candidates) {
    const sourceUrl = overrides[offer.image_url] || offer.image_url;
    const taskKey = `${offer.supplier_slug}|${offer.product_slug}`;
    if (!tasks.has(taskKey)) tasks.set(taskKey, new Map());
    const groups = tasks.get(taskKey);
    if (!groups.has(sourceUrl)) groups.set(sourceUrl, { ids: [], storedUrl: offer.image_url });
    groups.get(sourceUrl).ids.push(offer.id);
  }
  console.log(`distinct pictures: ${[...tasks.values()].reduce((sum, groups) => sum + groups.size, 0)} across ${tasks.size} supplier/product pairs`);

  if (apply) {
    fs.writeFileSync(args.backup, JSON.stringify({ takenAt: new Date().toISOString(), offers: candidates.map((o) => ({ id: o.id, image_url: o.image_url })) }, null, 2));
    console.log(`backup of ${candidates.length} old image URLs: ${args.backup}`);
  }

  /** Points the offers at our copy. A dropped connection is retried a few times; resolves to an error message, or null. */
  async function saveCopiedImage(ids, mirrored) {
    for (let i = 0; i < ids.length; i += 100) {
      let lastMessage = null;
      for (let attempt = 1; attempt <= 4; attempt += 1) {
        const { error } = await client
          .from('offers')
          .update({ image_url: mirrored.imageUrl, image_source_url: mirrored.imageSourceUrl })
          .in('id', ids.slice(i, i + 100));
        lastMessage = error ? error.message : null;
        if (!lastMessage) break;
        await sleep(1000 * attempt);
      }
      if (lastMessage) return lastMessage;
    }
    return null;
  }

  // Pictures of one supplier's one compound share file names, so each pair keeps its own list of claimed names across passes.
  const siblingsByTask = new Map();
  // On a re-run, the names taken by pictures copied earlier, so a second picture of the same product doesn't overwrite one.
  for (const offer of withImage) {
    if (!isOwnImageUrl(offer.image_url, env.NEXT_PUBLIC_SUPABASE_URL)) continue;
    const taskKey = `${offer.supplier_slug}|${offer.product_slug}`;
    if (!siblingsByTask.has(taskKey)) siblingsByTask.set(taskKey, []);
    siblingsByTask.get(taskKey).push({ imageUrl: offer.image_url, imageSourceUrl: offer.image_source_url ?? null });
  }
  let copied = 0;
  let copiedOffers = 0;
  let totalBytes = 0;

  /** Runs the given supplier/product tasks and returns the pictures that could not be copied. */
  async function runPass(taskEntries, workers, pauseMs) {
    const failures = [];
    const queue = [...taskEntries];
    const progress = () => process.stdout.write(`\r  copied ${copied} | failed ${failures.length} | remaining ${queue.length}   `);

    async function worker() {
      for (let next = queue.shift(); next; next = queue.shift()) {
        const [taskKey, groups] = next;
        const [supplierSlug, productSlug] = taskKey.split('|');
        if (!siblingsByTask.has(taskKey)) siblingsByTask.set(taskKey, []);
        const siblings = siblingsByTask.get(taskKey);
        const ordered = [...groups.entries()].sort((a, b) => String(a[1].ids[0]).localeCompare(String(b[1].ids[0])));
        for (const [sourceUrl, group] of ordered) {
          if (pauseMs) await sleep(pauseMs);
          let mirrored;
          try {
            mirrored = await mirrorImage(client, { sourceUrl, supplierSlug, productSlug, siblings, dryRun: !apply });
          } catch (error) {
            failures.push({ taskKey, supplierSlug, productSlug, sourceUrl, group, reason: error.message });
            continue;
          }
          if (apply) {
            const saveError = await saveCopiedImage(group.ids, mirrored);
            if (saveError) {
              // The file is already in storage; the offer keeps its old image_url, and a re-run copies it again.
              failures.push({ taskKey, supplierSlug, productSlug, sourceUrl, group, reason: `database update failed (${saveError})` });
              continue;
            }
          }
          siblings.push({ imageUrl: mirrored.imageUrl, imageSourceUrl: mirrored.imageSourceUrl });
          copied += 1;
          copiedOffers += group.ids.length;
          totalBytes += mirrored.bytes;
          progress();
        }
      }
    }

    await Promise.all(Array.from({ length: workers }, worker));
    process.stdout.write('\n');
    return failures;
  }

  console.log(`pass 1: ${concurrency} at a time`);
  let failures = await runPass(tasks.entries(), concurrency, 0);

  const retryable = failures.filter((failure) => RETRYABLE.test(failure.reason));
  if (retryable.length > 0) {
    console.log(`pass 2: retrying ${retryable.length} pictures, ${RETRY_CONCURRENCY} at a time`);
    const retryTasks = new Map();
    for (const failure of retryable) {
      if (!retryTasks.has(failure.taskKey)) retryTasks.set(failure.taskKey, new Map());
      retryTasks.get(failure.taskKey).set(failure.sourceUrl, failure.group);
    }
    const retried = await runPass(retryTasks.entries(), RETRY_CONCURRENCY, RETRY_PAUSE_MS);
    const retriedUrls = new Set(retryable.map((failure) => failure.sourceUrl));
    failures = [...failures.filter((failure) => !retriedUrls.has(failure.sourceUrl)), ...retried];
  }

  const failureFile = typeof args.failures === 'string' ? args.failures : path.join(args.backup ? path.dirname(args.backup) : process.cwd(), 'image-mirror-failures.csv');
  const failedOffers = failures.reduce((sum, f) => sum + f.group.ids.length, 0);
  fs.writeFileSync(
    failureFile,
    [
      'supplier,product,offers_affected,reason,image_url_in_database,source_tried',
      ...failures.map((f) => [f.supplierSlug, f.productSlug, f.group.ids.length, f.reason, f.group.storedUrl, f.sourceUrl].map(csvCell).join(',')),
    ].join('\n'),
  );
  console.log(`${apply ? 'copied' : 'would copy'}: ${copied} pictures for ${copiedOffers} offers | ${(totalBytes / 1024 / 1024).toFixed(1)} MB of WebP | average ${copied ? Math.round(totalBytes / copied / 1024) : 0} KB`);
  console.log(`could not copy: ${failures.length} pictures for ${failedOffers} offers -> ${failureFile}`);

  const byReason = new Map();
  for (const f of failures) byReason.set(f.reason, (byReason.get(f.reason) || 0) + f.group.ids.length);
  for (const [reason, count] of [...byReason.entries()].sort((a, b) => b[1] - a[1]).slice(0, 12)) console.log(`  ${String(count).padStart(4)} offers  ${reason}`);
  const bySupplier = new Map();
  for (const f of failures) bySupplier.set(f.supplierSlug, (bySupplier.get(f.supplierSlug) || 0) + f.group.ids.length);
  console.log('failures by supplier:', [...bySupplier.entries()].sort((a, b) => b[1] - a[1]).map(([s, n]) => `${s}=${n}`).join(', ') || 'none');
}

main().catch((error) => {
  console.error(`\n${error.message}`);
  process.exit(1);
});

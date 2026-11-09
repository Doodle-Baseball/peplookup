// Moves the database's stored site paths from the plural section roots to the singular ones:
//   /suppliers -> /supplier   /products -> /product   /coupons -> /coupon   /reviews -> /review   /guides -> /guide
//
//   node scripts/migrate-site-paths.mjs --phase=copy      [--apply] [--backup=FILE]
//   node scripts/migrate-site-paths.mjs --phase=cutover   [--apply] [--backup=FILE]
//   node scripts/migrate-site-paths.mjs --phase=cleanup   [--apply] [--backup=FILE]
//
// Without --apply nothing is written: it reports what it would do. With --apply, --backup=FILE is required and is
// written first with every row about to change.
//
// Run the phases in this order, because the site's running code and the database must agree at every step:
//
//   copy     BEFORE the new code is deployed. Adds a new-form copy of every plural-path row in seo_pages (path and
//            canonical_url), page_faqs (path) and seo_redirects (both paths), and leaves the old rows in place. The
//            code that is live today looks pages up by the old paths and ignores the new rows, so nothing changes
//            for visitors; the new code finds its rows the moment it is deployed.
//   cutover  AFTER the new code is live and checked. Rewrites the links inside guide content (guides.sections), the
//            click log's source_path, and any seo_pages canonical_url on another page that still names an old path.
//   cleanup  AFTER cutover has been checked. Deletes the old-form rows that copy left behind.
//
// Every phase is safe to run again: rows that already exist in their new form are skipped.
import { readFileSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const args = Object.fromEntries(
  process.argv.slice(2).map((arg) => {
    const [key, ...rest] = arg.replace(/^--/, '').split('=');
    return [key, rest.length ? rest.join('=') : true];
  }),
);
const phase = args.phase;
const apply = args.apply === true;
if (!['copy', 'cutover', 'cleanup'].includes(phase)) {
  console.error('Pass --phase=copy, --phase=cutover or --phase=cleanup.');
  process.exit(1);
}
if (apply && typeof args.backup !== 'string') {
  console.error('--apply needs --backup=FILE so every changed row can be put back.');
  process.exit(1);
}

const env = Object.fromEntries(
  readFileSync(join(dirname(fileURLToPath(import.meta.url)), '..', '.env.local'), 'utf8')
    .split(/\r?\n/)
    .filter((line) => line.includes('=') && !line.startsWith('#'))
    .map((line) => [line.slice(0, line.indexOf('=')).trim(), line.slice(line.indexOf('=') + 1).trim().replace(/^"|"$/g, '')]),
);
const base = `${env.NEXT_PUBLIC_SUPABASE_URL}/rest/v1`;
const headers = { apikey: env.SUPABASE_SECRET_KEY, Authorization: `Bearer ${env.SUPABASE_SECRET_KEY}`, 'Content-Type': 'application/json' };

const RENAMES = { suppliers: 'supplier', products: 'product', coupons: 'coupon', reviews: 'review', guides: 'guide' };
// A site path: starts a string or follows a quote, bracket, space, "(", "=", ">" or this site's domain. A path inside another
// site's URL (https://shop.com/products/x) is left alone.
const PATH = /(^|[\s"'(=>\]]|peplookup\.com)\/(suppliers|products|coupons|reviews|guides)(?=[/"'?#)\s<\]]|$)/g;
const isOldPath = (path) => /^\/(suppliers|products|coupons|reviews|guides)(\/|$)/.test(path);
const mapText = (text) => text.replace(PATH, (_m, before, name) => `${before}/${RENAMES[name]}`);
const mapPath = (path) => (path == null ? path : mapText(path));

async function call(method, path, body, extra = {}) {
  const response = await fetch(`${base}/${path}`, { method, headers: { ...headers, ...extra }, body: body === undefined ? undefined : JSON.stringify(body) });
  if (!response.ok) throw new Error(`${method} ${path} -> ${response.status} ${await response.text()}`);
  return response.status === 204 ? null : response.text().then((t) => (t ? JSON.parse(t) : null));
}
async function all(table) {
  const rows = [];
  for (let from = 0; ; from += 1000) {
    const page = await call('GET', `${table}?select=*&order=${{ seo_redirects: 'from_path', seo_pages: 'path', guides: 'slug' }[table] ?? 'id'}&limit=1000&offset=${from}`);
    rows.push(...page);
    if (page.length < 1000) return rows;
  }
}

const backup = { phase, takenAt: new Date().toISOString(), rows: {} };
const summary = [];
const note = (message) => { summary.push(message); console.log(message); };

if (phase === 'copy') {
  const [pages, faqs, redirects] = await Promise.all([all('seo_pages'), all('page_faqs'), all('seo_redirects')]);

  const pagePaths = new Set(pages.map((row) => row.path));
  const newPages = pages
    .filter((row) => isOldPath(row.path) && !pagePaths.has(mapPath(row.path)))
    .map((row) => ({ ...row, path: mapPath(row.path), canonical_url: mapPath(row.canonical_url) }));
  note(`seo_pages: ${pages.filter((r) => isOldPath(r.path)).length} plural-path rows | ${newPages.length} new-form copies to add`);

  const faqPaths = new Set(faqs.map((row) => row.path));
  const newFaqs = faqs.filter((row) => isOldPath(row.path) && !faqPaths.has(mapPath(row.path))).map(({ id, ...row }) => ({ ...row, path: mapPath(row.path) }));
  note(`page_faqs: ${faqs.filter((r) => isOldPath(r.path)).length} plural-path rows | ${newFaqs.length} new-form copies to add`);

  const redirectFroms = new Set(redirects.map((row) => row.from_path));
  const newRedirects = redirects
    .filter((row) => isOldPath(row.from_path) && !redirectFroms.has(mapPath(row.from_path)))
    .map((row) => ({ ...row, from_path: mapPath(row.from_path), to_path: mapPath(row.to_path) }));
  note(`seo_redirects: ${redirects.length} rows | ${newRedirects.length} new-form copies to add`);

  backup.rows = { seo_pages_added: newPages, page_faqs_added: newFaqs, seo_redirects_added: newRedirects };
  if (apply) {
    writeFileSync(args.backup, JSON.stringify(backup, null, 2));
    for (let i = 0; i < newPages.length; i += 100) await call('POST', 'seo_pages?on_conflict=path', newPages.slice(i, i + 100), { Prefer: 'resolution=ignore-duplicates,return=minimal' });
    for (let i = 0; i < newFaqs.length; i += 100) await call('POST', 'page_faqs', newFaqs.slice(i, i + 100), { Prefer: 'return=minimal' });
    for (let i = 0; i < newRedirects.length; i += 100) await call('POST', 'seo_redirects?on_conflict=from_path', newRedirects.slice(i, i + 100), { Prefer: 'resolution=ignore-duplicates,return=minimal' });
    note(`applied. backup: ${args.backup}`);
  }
}

if (phase === 'cutover') {
  const [guides, pages, clicks] = await Promise.all([all('guides'), all('seo_pages'), all('outbound_clicks')]);

  const changedGuides = guides.map((row) => [row, JSON.parse(mapText(JSON.stringify(row.sections ?? null)))]).filter(([row, sections]) => JSON.stringify(sections) !== JSON.stringify(row.sections));
  note(`guides.sections: ${changedGuides.length} guide(s) with links to rewrite (${changedGuides.map(([row]) => row.slug).join(', ') || 'none'})`);

  // Rows that are not themselves under an old root but whose canonical still names one.
  const strayCanonicals = pages.filter((row) => !isOldPath(row.path) && row.canonical_url && mapPath(row.canonical_url) !== row.canonical_url);
  note(`seo_pages canonical_url on other pages: ${strayCanonicals.length} to rewrite`);

  const clickPaths = [...new Set(clicks.map((row) => row.source_path).filter((path) => path && mapPath(path) !== path))];
  note(`outbound_clicks.source_path: ${clicks.filter((row) => row.source_path && mapPath(row.source_path) !== row.source_path).length} row(s) across ${clickPaths.length} distinct path(s)`);

  backup.rows = {
    guides: changedGuides.map(([row]) => ({ slug: row.slug, sections: row.sections })),
    seo_pages: strayCanonicals.map((row) => ({ path: row.path, canonical_url: row.canonical_url })),
    outbound_clicks_source_paths: clickPaths,
  };
  if (apply) {
    writeFileSync(args.backup, JSON.stringify(backup, null, 2));
    for (const [row, sections] of changedGuides) await call('PATCH', `guides?slug=eq.${encodeURIComponent(row.slug)}`, { sections }, { Prefer: 'return=minimal' });
    for (const row of strayCanonicals) await call('PATCH', `seo_pages?path=eq.${encodeURIComponent(row.path)}`, { canonical_url: mapPath(row.canonical_url) }, { Prefer: 'return=minimal' });
    for (const path of clickPaths) await call('PATCH', `outbound_clicks?source_path=eq.${encodeURIComponent(path)}`, { source_path: mapPath(path) }, { Prefer: 'return=minimal' });
    note(`applied. backup: ${args.backup}`);
  }
}

if (phase === 'cleanup') {
  const [pages, faqs, redirects] = await Promise.all([all('seo_pages'), all('page_faqs'), all('seo_redirects')]);
  const pagePaths = new Set(pages.map((row) => row.path));
  const faqPaths = new Set(faqs.map((row) => row.path));
  const redirectFroms = new Set(redirects.map((row) => row.from_path));
  // Only an old-form row whose new-form copy exists is removed, so a row can never be lost.
  const oldPages = pages.filter((row) => isOldPath(row.path) && pagePaths.has(mapPath(row.path)));
  const oldFaqs = faqs.filter((row) => isOldPath(row.path) && faqPaths.has(mapPath(row.path)));
  const oldRedirects = redirects.filter((row) => isOldPath(row.from_path) && redirectFroms.has(mapPath(row.from_path)));
  note(`old-form rows to delete: seo_pages ${oldPages.length}, page_faqs ${oldFaqs.length}, seo_redirects ${oldRedirects.length}`);
  backup.rows = { seo_pages: oldPages, page_faqs: oldFaqs, seo_redirects: oldRedirects };
  if (apply) {
    writeFileSync(args.backup, JSON.stringify(backup, null, 2));
    for (const row of oldPages) await call('DELETE', `seo_pages?path=eq.${encodeURIComponent(row.path)}`, undefined, { Prefer: 'return=minimal' });
    for (const row of oldFaqs) await call('DELETE', `page_faqs?id=eq.${row.id}`, undefined, { Prefer: 'return=minimal' });
    for (const row of oldRedirects) await call('DELETE', `seo_redirects?from_path=eq.${encodeURIComponent(row.from_path)}`, undefined, { Prefer: 'return=minimal' });
    note(`applied. backup: ${args.backup}`);
  }
}

if (!apply) console.log('\nDRY RUN: nothing was written. Add --apply --backup=FILE to write.');

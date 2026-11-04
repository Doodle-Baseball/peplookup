#!/usr/bin/env node
// SEO build check (B7). Fails the deploy when the site about to go live would:
//   - put a star or emoji in any title or description,
//   - give two or more pages the same title,
//   - list a URL in sitemap.xml that is noindex or doesn't answer 200,
//   - (production only) output noindex on "/" or on more than half its pages,
//   - block Googlebot with "Disallow: /" in robots.txt,
//   - change the number of sitemap URLs by more than 20% from the live site.
//
// Runs as `postbuild` (so `npm run build` on Vercel runs it after `next build`):
// it starts the freshly built site with `next start`, crawls it and exits
// non-zero on any failure, which fails the deployment.
//
//   node scripts/seo-check.mjs                     after a build; starts the build itself
//   node scripts/seo-check.mjs --url http://localhost:3000   check a site that is already running
//
// Outside Vercel the postbuild run is skipped unless SEO_CHECK=1, so a local
// `npm run build` doesn't crawl. Preview builds run every check except the two
// that only make sense in production (previews are noindex on purpose).
//
// A deliberate sitemap change of more than 20% (pages taken out of search on
// purpose, say) is allowed once by setting SEO_CHECK_EXPECTED_SITEMAP_COUNT to
// the exact new count for that deploy; any other count still fails.

import { spawn } from 'node:child_process';
import { createServer } from 'node:net';
import { setTimeout as sleep } from 'node:timers/promises';

const LIVE_ORIGIN = 'https://www.peplookup.com';
const MAX_SITEMAP_CHANGE = 0.2;
const MAX_NOINDEX_SHARE = 0.5;
const CONCURRENCY = 6;
const REQUEST_TIMEOUT_MS = 60_000;

const args = process.argv.slice(2);
const urlFlag = args.indexOf('--url');
const givenBase = urlFlag !== -1 ? args[urlFlag + 1] : null;
const vercelEnv = process.env.VERCEL_ENV ?? null;
// Production means the deploy that will serve www.peplookup.com; only it runs the noindex share checks.
const isProduction = vercelEnv === 'production' || args.includes('--production');

if (!givenBase && !vercelEnv && process.env.SEO_CHECK !== '1') {
  console.log('[seo-check] Skipped: not a Vercel build (set SEO_CHECK=1 to run it after a local build).');
  process.exit(0);
}

const failures = [];
const warnings = [];
const fail = (message) => failures.push(message);
const warn = (message) => warnings.push(message);

/** Pictographic symbols that may never appear in a title or description; ©, ® and ™ are ordinary marks. */
function hasStarOrEmoji(text) {
  return [...text].some(
    (symbol) => /[★☆✩✪✫✬✭✮✯✰⭐]/u.test(symbol) || (/\p{Extended_Pictographic}/u.test(symbol) && !'©®™'.includes(symbol)),
  );
}

function decodeEntities(text) {
  return text
    .replace(/&#x([0-9a-f]+);/gi, (_, hex) => String.fromCodePoint(parseInt(hex, 16)))
    .replace(/&#(\d+);/g, (_, dec) => String.fromCodePoint(Number(dec)))
    .replace(/&quot;/g, '"')
    .replace(/&apos;|&#x27;/g, "'")
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&amp;/g, '&');
}

function metaContent(html, name) {
  const tags = html.match(/<meta\b[^>]*>/gi) ?? [];
  for (const tag of tags) {
    if (!new RegExp(`\\bname=["']${name}["']`, 'i').test(tag)) continue;
    const content = tag.match(/\bcontent=["']([^"']*)["']/i);
    if (content) return decodeEntities(content[1]);
  }
  return null;
}

function pageFacts(html) {
  const title = html.match(/<title[^>]*>([\s\S]*?)<\/title>/i);
  return {
    title: title ? decodeEntities(title[1].trim()) : null,
    description: metaContent(html, 'description'),
    robots: metaContent(html, 'robots'),
  };
}

async function fetchText(url, init = {}) {
  const response = await fetch(url, { redirect: 'manual', signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS), ...init });
  return { status: response.status, text: await response.text() };
}

function sitemapPaths(xml) {
  return [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map((match) => {
    const url = new URL(decodeEntities(match[1].trim()));
    return url.pathname + url.search;
  });
}

async function freePort() {
  return new Promise((resolve, reject) => {
    const server = createServer();
    server.unref();
    server.on('error', reject);
    server.listen(0, () => {
      const { port } = server.address();
      server.close(() => resolve(port));
    });
  });
}

/** Starts the built site with `next start`, the same build that is about to be deployed. */
async function startBuiltSite() {
  const port = await freePort();
  const child = spawn(process.execPath, ['node_modules/next/dist/bin/next', 'start', '-p', String(port)], {
    env: process.env,
    stdio: ['ignore', 'pipe', 'pipe'],
  });
  let output = '';
  child.stdout.on('data', (chunk) => (output += chunk));
  child.stderr.on('data', (chunk) => (output += chunk));
  const base = `http://127.0.0.1:${port}`;
  for (let attempt = 0; attempt < 120; attempt += 1) {
    if (child.exitCode !== null) throw new Error(`next start exited early:\n${output}`);
    try {
      await fetch(`${base}/robots.txt`, { signal: AbortSignal.timeout(2_000) });
      return { base, stop: () => child.kill() };
    } catch {
      await sleep(500);
    }
  }
  child.kill();
  throw new Error(`next start did not answer within 60s:\n${output}`);
}

async function inBatches(items, worker) {
  const results = new Array(items.length);
  let next = 0;
  await Promise.all(
    Array.from({ length: Math.min(CONCURRENCY, items.length) }, async () => {
      while (next < items.length) {
        const index = next++;
        results[index] = await worker(items[index]);
      }
    }),
  );
  return results;
}

/** True when the robots.txt group that applies to Googlebot disallows the whole site. */
function blocksGooglebot(robotsTxt) {
  const groups = [];
  let current = null;
  for (const raw of robotsTxt.split(/\r?\n/)) {
    const line = raw.replace(/#.*/, '').trim();
    if (!line) continue;
    const [key, ...rest] = line.split(':');
    const field = key.trim().toLowerCase();
    const value = rest.join(':').trim();
    if (field === 'user-agent') {
      if (!current || current.rules.length > 0) groups.push((current = { agents: [], rules: [] }));
      current.agents.push(value.toLowerCase());
    } else if (current && (field === 'disallow' || field === 'allow')) {
      current.rules.push({ field, value });
    }
  }
  const googlebot = groups.filter((group) => group.agents.some((agent) => agent === 'googlebot'));
  const applicable = googlebot.length > 0 ? googlebot : groups.filter((group) => group.agents.includes('*'));
  return applicable.some((group) => group.rules.some((rule) => rule.field === 'disallow' && rule.value === '/'));
}

async function main() {
  const site = givenBase ? { base: givenBase.replace(/\/$/, ''), stop: () => {} } : await startBuiltSite();
  console.log(`[seo-check] Checking ${site.base} (${isProduction ? 'production' : vercelEnv ?? 'local'})`);
  try {
    // ------------------------------------------------------------ robots.txt
    const robots = await fetchText(`${site.base}/robots.txt`);
    if (robots.status !== 200) fail(`robots.txt answered ${robots.status}`);
    else if (blocksGooglebot(robots.text)) fail('robots.txt has "Disallow: /" for Googlebot');

    // ------------------------------------------------------------ sitemap
    const sitemap = await fetchText(`${site.base}/sitemap.xml`);
    if (sitemap.status !== 200) {
      fail(`sitemap.xml answered ${sitemap.status}`);
      return;
    }
    const newPaths = sitemapPaths(sitemap.text);

    // The live site is the last deploy: its sitemap is the baseline for the size check.
    let livePaths = [];
    try {
      const live = await fetchText(`${LIVE_ORIGIN}/sitemap.xml`);
      if (live.status === 200) livePaths = sitemapPaths(live.text);
      else warn(`live sitemap.xml answered ${live.status}; size check skipped`);
    } catch (error) {
      warn(`live sitemap.xml could not be read (${error.message}); size check skipped`);
    }

    if (isProduction && livePaths.length > 0) {
      const change = Math.abs(newPaths.length - livePaths.length) / livePaths.length;
      const expected = Number(process.env.SEO_CHECK_EXPECTED_SITEMAP_COUNT);
      if (change > MAX_SITEMAP_CHANGE && expected !== newPaths.length) {
        fail(
          `sitemap.xml would go from ${livePaths.length} to ${newPaths.length} URLs (${Math.round(change * 100)}% change, limit ${MAX_SITEMAP_CHANGE * 100}%). ` +
            `If that is intended, set SEO_CHECK_EXPECTED_SITEMAP_COUNT=${newPaths.length} for this one deploy.`,
        );
      }
    }

    // ------------------------------------------------------------ pages
    // Every URL in the new sitemap, plus every URL that was live before, so an
    // accidental noindex can't hide by also emptying the sitemap.
    const sitemapSet = new Set(newPaths);
    const toCrawl = [...new Set(['/', ...newPaths, ...livePaths])];
    const pages = await inBatches(toCrawl, async (path) => {
      try {
        const { status, text } = await fetchText(`${site.base}${path}`);
        return { path, status, ...pageFacts(text) };
      } catch (error) {
        return { path, status: 0, title: null, description: null, robots: null, error: error.message };
      }
    });

    const titles = new Map();
    let noindexCount = 0;
    let servedCount = 0;
    for (const page of pages) {
      const noindex = /noindex/i.test(page.robots ?? '');
      if (sitemapSet.has(page.path)) {
        if (page.status !== 200) fail(`${page.path} is in sitemap.xml but answered ${page.status || page.error}`);
        if (noindex) fail(`${page.path} is in sitemap.xml but is noindex`);
      }
      if (page.status !== 200) continue;
      servedCount += 1;
      if (noindex) noindexCount += 1;
      if (page.title && hasStarOrEmoji(page.title)) fail(`${page.path} title contains a star or emoji: "${page.title}"`);
      if (page.description && hasStarOrEmoji(page.description)) {
        fail(`${page.path} description contains a star or emoji: "${page.description}"`);
      }
      // Only pages that can be indexed compete for a title in search results.
      if (page.title && !noindex) titles.set(page.title, [...(titles.get(page.title) ?? []), page.path]);
    }
    for (const [title, paths] of titles) {
      if (paths.length > 1) fail(`${paths.length} pages share the title "${title}": ${paths.join(', ')}`);
    }

    if (isProduction) {
      const home = pages.find((page) => page.path === '/');
      if (!home || home.status !== 200) fail(`"/" answered ${home?.status ?? 'nothing'}`);
      else if (/noindex/i.test(home.robots ?? '')) fail('"/" outputs noindex');
      if (servedCount > 0 && noindexCount / servedCount > MAX_NOINDEX_SHARE) {
        fail(`${noindexCount} of ${servedCount} pages output noindex (more than ${MAX_NOINDEX_SHARE * 100}%)`);
      }
    }

    console.log(
      `[seo-check] ${pages.length} pages crawled, ${newPaths.length} URLs in sitemap.xml (live: ${livePaths.length || 'unknown'}), ${noindexCount} noindex.`,
    );
  } finally {
    site.stop();
  }
}

main()
  .catch((error) => fail(`check could not run: ${error.stack ?? error.message}`))
  .finally(() => {
    for (const message of warnings) console.warn(`[seo-check] warning: ${message}`);
    if (failures.length === 0) {
      console.log('[seo-check] Passed.');
      process.exit(0);
    }
    for (const message of failures) console.error(`[seo-check] FAIL: ${message}`);
    console.error(`[seo-check] ${failures.length} problem(s). The deploy is stopped until they are fixed.`);
    process.exit(1);
  });

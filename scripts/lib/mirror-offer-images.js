// Copies supplier product pictures into our own storage ("product-images" bucket), for the
// seed scripts and for scripts/mirror-offer-images.js. The app-side twin is
// src/lib/admin/offer-images.ts; keep the two in step.
//
// Supplier image URLs break (hotlink blocking, shops that move domain, files that get
// removed), and the browser loads them straight from the supplier. Each picture is converted
// to WebP (max 800px wide) and stored as {supplier-slug}-{product-slug}.webp.
const crypto = require('crypto');
const dns = require('dns').promises;
const net = require('net');
const sharp = require('sharp');

const BUCKET = 'product-images';
const MAX_WIDTH = 800;
const WEBP_QUALITY = 80;
const MAX_DOWNLOAD_BYTES = 10 * 1024 * 1024;
const MAX_STORED_BYTES = 1024 * 1024;
const FETCH_TIMEOUT_MS = 20000;
const MAX_REDIRECTS = 3;
// SVG is left out on purpose: it can carry scripts, and a remote one is never a product photo.
const ACCEPTED_FORMATS = new Set(['jpeg', 'png', 'webp', 'gif', 'avif', 'tiff', 'heif']);

function isPrivateAddress(address) {
  const family = net.isIP(address);
  if (family === 4) {
    const [a, b] = address.split('.').map(Number);
    return a === 0 || a === 10 || a === 127 || (a === 169 && b === 254) || (a === 172 && b >= 16 && b <= 31) || (a === 192 && b === 168) || (a === 100 && b >= 64 && b <= 127);
  }
  if (family === 6) {
    const lower = address.toLowerCase();
    if (lower === '::1' || lower === '::') return true;
    const mapped = lower.match(/^::ffff:(\d+\.\d+\.\d+\.\d+)$/);
    if (mapped) return isPrivateAddress(mapped[1]);
    return /^(fc|fd|fe[89ab])/.test(lower);
  }
  return true;
}

async function assertPublicHttpUrl(rawUrl) {
  let url;
  try {
    url = new URL(rawUrl);
  } catch {
    throw new Error('not a valid URL');
  }
  if (url.protocol !== 'https:' && url.protocol !== 'http:') throw new Error('not an http(s) URL');
  const host = url.hostname.replace(/^\[|\]$/g, '');
  let addresses;
  try {
    addresses = net.isIP(host) ? [host] : (await dns.lookup(host, { all: true })).map((entry) => entry.address);
  } catch (error) {
    // Worded like a failed request so the backfill's retry pass picks it up: a dropped connection looks the same as a dead host.
    throw new Error(`request failed (could not look up ${host}: ${error && error.code})`);
  }
  if (addresses.length === 0 || addresses.some(isPrivateAddress)) throw new Error('host is not a public address');
  return url;
}

async function readCapped(response) {
  if (Number(response.headers.get('content-length') || 0) > MAX_DOWNLOAD_BYTES) throw new Error('image is larger than 10 MB');
  if (!response.body) throw new Error('empty response');
  const chunks = [];
  let total = 0;
  const reader = response.body.getReader();
  for (;;) {
    const { done, value } = await reader.read();
    if (done) break;
    total += value.byteLength;
    if (total > MAX_DOWNLOAD_BYTES) {
      await reader.cancel();
      throw new Error('image is larger than 10 MB');
    }
    chunks.push(value);
  }
  return Buffer.concat(chunks);
}

// Some shops drop requests from an agent that names itself, others only answer one that does, so a refused
// request is tried once more with the other. 404, 410 and the like are answers, not refusals, and are not retried.
const USER_AGENTS = ['Mozilla/5.0 (compatible; PepLookupImageCopy/1.0; +https://peplookup.com)', 'Mozilla/5.0'];
const refused = (status) => status === 403 || status === 429 || status >= 500;

async function requestWithAgents(url) {
  let outcome = null;
  for (const agent of USER_AGENTS) {
    try {
      const response = await fetch(url, {
        redirect: 'manual',
        signal: AbortSignal.timeout(FETCH_TIMEOUT_MS),
        headers: { 'user-agent': agent, accept: 'image/*,*/*;q=0.5' },
      });
      if (!refused(response.status)) return response;
      outcome = outcome || response;
    } catch (error) {
      outcome = outcome || error;
    }
  }
  if (outcome instanceof Response) return outcome;
  throw new Error(outcome && outcome.name === 'TimeoutError' ? 'timed out' : `request failed (${outcome && outcome.message})`);
}

async function downloadImage(sourceUrl) {
  let current = sourceUrl;
  for (let hop = 0; hop <= MAX_REDIRECTS; hop += 1) {
    const url = await assertPublicHttpUrl(current);
    const response = await requestWithAgents(url);
    if (response.status >= 300 && response.status < 400) {
      const location = response.headers.get('location');
      if (!location) throw new Error(`redirect without a location (HTTP ${response.status})`);
      current = new URL(location, url).toString();
      continue;
    }
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    return readCapped(response);
  }
  throw new Error('too many redirects');
}

async function convertToWebp(input) {
  let format;
  try {
    format = (await sharp(input).metadata()).format;
  } catch {
    throw new Error('not an image');
  }
  if (!format || !ACCEPTED_FORMATS.has(format)) throw new Error(`unsupported image type (${format || 'unknown'})`);
  const output = await sharp(input).rotate().resize({ width: MAX_WIDTH, withoutEnlargement: true }).webp({ quality: WEBP_QUALITY }).toBuffer();
  if (output.byteLength > MAX_STORED_BYTES) throw new Error('converted image is larger than 1 MB');
  return output;
}

const shortHash = (value) => crypto.createHash('sha256').update(value).digest('hex').slice(0, 8);

/**
 * `{supplier-slug}-{product-slug}.webp`, unless another picture of the same supplier's same
 * compound already holds that name. A supplier often shows a different photo for each size or
 * kit of one compound, so a second, different source gets a short suffix from its own address.
 * `siblings` are { imageUrl, imageSourceUrl } of that supplier's other offers for the compound.
 */
function chooseImageFileName(supplierSlug, productSlug, sourceUrl, siblings) {
  const plain = `${supplierSlug}-${productSlug}.webp`;
  const heldByAnother = siblings.some(
    (sibling) => sibling.imageUrl && sibling.imageUrl.split('?')[0].endsWith(`/${BUCKET}/${plain}`) && sibling.imageSourceUrl !== sourceUrl,
  );
  return heldByAnother ? `${supplierSlug}-${productSlug}-${shortHash(sourceUrl)}.webp` : plain;
}

function isOwnImageUrl(url, supabaseUrl) {
  try {
    const candidate = new URL(url);
    return candidate.host === new URL(supabaseUrl).host && candidate.pathname.startsWith(`/storage/v1/object/public/${BUCKET}/`);
  } catch {
    return false;
  }
}

async function uploadToBucket(client, path, data) {
  const upload = () => client.storage.from(BUCKET).upload(path, data, { contentType: 'image/webp', cacheControl: '31536000', upsert: true });
  const first = await upload();
  if (!first.error) return;
  if (!/bucket not found/i.test(first.error.message)) throw new Error(`upload failed (${first.error.message})`);
  const { error: createError } = await client.storage.createBucket(BUCKET, { public: true, fileSizeLimit: MAX_STORED_BYTES, allowedMimeTypes: ['image/webp'] });
  if (createError) throw new Error(`the "${BUCKET}" bucket does not exist and could not be created (${createError.message})`);
  const retry = await upload();
  if (retry.error) throw new Error(`upload failed (${retry.error.message})`);
}

/** Downloads, converts and (unless dryRun) stores one picture. Resolves to { imageUrl, imageSourceUrl, bytes }. */
async function mirrorImage(client, { sourceUrl, supplierSlug, productSlug, siblings, dryRun }) {
  const webp = await convertToWebp(await downloadImage(sourceUrl));
  const fileName = chooseImageFileName(supplierSlug, productSlug, sourceUrl, siblings);
  if (!dryRun) await uploadToBucket(client, fileName, webp);
  const publicUrl = client.storage.from(BUCKET).getPublicUrl(fileName).data.publicUrl;
  return { imageUrl: `${publicUrl}?v=${shortHash(sourceUrl)}`, imageSourceUrl: sourceUrl, bytes: webp.byteLength, fileName };
}

/** True once 0032_offers_image_source_url.sql has been run. */
async function hasImageSourceColumn(client) {
  const { error } = await client.from('offers').select('image_source_url').limit(1);
  return !error;
}

/**
 * For the seed helper: replaces each row's supplier picture with our copy, in place, and notes the
 * original in `image_source_url`. A picture that can't be copied keeps the supplier's URL. Does
 * nothing (and says so) until the migration that adds the column has been run.
 */
async function mirrorRowImages(client, supplierSlug, rows, supabaseUrl) {
  if (rows.every((row) => !row.image_url)) return;
  if (!(await hasImageSourceColumn(client))) {
    console.log('Product images kept at the supplier: run supabase/migrations/0032_offers_image_source_url.sql, then mirror them with scripts/mirror-offer-images.js.');
    return;
  }
  const { data: stored, error } = await client.from('offers').select('product_slug, image_url, image_source_url').eq('supplier_slug', supplierSlug);
  if (error) throw new Error(`Could not read offers: ${error.message}`);
  const claims = new Map();
  const claimsFor = (productSlug) => {
    if (!claims.has(productSlug)) claims.set(productSlug, stored.filter((row) => row.product_slug === productSlug).map((row) => ({ imageUrl: row.image_url, imageSourceUrl: row.image_source_url })));
    return claims.get(productSlug);
  };

  const done = new Map();
  const failures = [];
  for (const row of rows) {
    const sourceUrl = row.image_url;
    if (!sourceUrl || isOwnImageUrl(sourceUrl, supabaseUrl)) continue;
    const key = `${row.product_slug}|${sourceUrl}`;
    let mirrored = done.get(key);
    if (!mirrored) {
      try {
        mirrored = await mirrorImage(client, { sourceUrl, supplierSlug, productSlug: row.product_slug, siblings: claimsFor(row.product_slug) });
        claimsFor(row.product_slug).push({ imageUrl: mirrored.imageUrl, imageSourceUrl: mirrored.imageSourceUrl });
        done.set(key, mirrored);
      } catch (copyError) {
        failures.push(`${row.product_slug}: ${copyError.message} (${sourceUrl})`);
        continue;
      }
    }
    row.image_url = mirrored.imageUrl;
    row.image_source_url = mirrored.imageSourceUrl;
  }
  console.log(`Product images copied to our storage: ${done.size}${failures.length ? `, kept at the supplier: ${failures.length}` : ''}.`);
  for (const failure of failures) console.log(`  not copied: ${failure}`);
}

module.exports = { BUCKET, chooseImageFileName, convertToWebp, downloadImage, hasImageSourceColumn, isOwnImageUrl, isPrivateAddress, mirrorImage, mirrorRowImages };

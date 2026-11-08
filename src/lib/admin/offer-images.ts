import 'server-only';
import { createHash } from 'node:crypto';
import { lookup } from 'node:dns/promises';
import { isIP } from 'node:net';
import sharp from 'sharp';
import type { SupabaseClient } from '@supabase/supabase-js';

/**
 * Copies a supplier's product picture into our own storage. Supplier image URLs break
 * (hotlink blocking, shops that move domain, files that get removed), and the browser
 * loads these straight from the supplier, so a dead URL is a broken card.
 *
 * The same steps run in scripts/lib/mirror-offer-images.js for the seed scripts and the
 * one-off backfill; keep the two in step.
 */

export const OFFER_IMAGE_BUCKET = 'product-images';

/** Cards show these at 320px or less, so anything wider is only extra bytes. */
const MAX_WIDTH = 800;
const WEBP_QUALITY = 80;
const MAX_DOWNLOAD_BYTES = 10 * 1024 * 1024;
/** The bucket rejects anything bigger; a converted 800px WebP is a small fraction of this. */
const MAX_STORED_BYTES = 1024 * 1024;
const FETCH_TIMEOUT_MS = 20_000;
const MAX_REDIRECTS = 3;
/** SVG is left out on purpose: it can carry scripts, and a remote one is never a product photo. */
const ACCEPTED_FORMATS = new Set(['jpeg', 'png', 'webp', 'gif', 'avif', 'tiff', 'heif']);

export class OfferImageError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'OfferImageError';
  }
}

/** True for addresses a public image host should never resolve to: loopback, private and link-local ranges. */
export function isPrivateAddress(address: string): boolean {
  const family = isIP(address);
  if (family === 4) {
    const [a = 0, b = 0] = address.split('.').map(Number);
    return (
      a === 0 ||
      a === 10 ||
      a === 127 ||
      (a === 169 && b === 254) ||
      (a === 172 && b >= 16 && b <= 31) ||
      (a === 192 && b === 168) ||
      // Carrier-grade NAT.
      (a === 100 && b >= 64 && b <= 127)
    );
  }
  if (family === 6) {
    const lower = address.toLowerCase();
    if (lower === '::1' || lower === '::') return true;
    // An IPv4 address carried inside an IPv6 one (::ffff:10.0.0.1).
    const mapped = lower.match(/^::ffff:(\d+\.\d+\.\d+\.\d+)$/);
    if (mapped?.[1]) return isPrivateAddress(mapped[1]);
    return lower.startsWith('fc') || lower.startsWith('fd') || lower.startsWith('fe8') || lower.startsWith('fe9') || lower.startsWith('fea') || lower.startsWith('feb');
  }
  return true;
}

async function assertPublicHttpUrl(rawUrl: string): Promise<URL> {
  let url: URL;
  try {
    url = new URL(rawUrl);
  } catch {
    throw new OfferImageError('not a valid URL');
  }
  if (url.protocol !== 'https:' && url.protocol !== 'http:') throw new OfferImageError('not an http(s) URL');
  const host = url.hostname.replace(/^\[|\]$/g, '');
  let addresses: string[];
  try {
    addresses = isIP(host) ? [host] : (await lookup(host, { all: true })).map((entry) => entry.address);
  } catch (error) {
    throw new OfferImageError(`request failed (could not look up ${host}: ${(error as NodeJS.ErrnoException).code ?? 'unknown'})`);
  }
  if (addresses.length === 0 || addresses.some(isPrivateAddress)) throw new OfferImageError('host is not a public address');
  return url;
}

async function readCapped(response: Response): Promise<Buffer> {
  const declared = Number(response.headers.get('content-length') ?? 0);
  if (declared > MAX_DOWNLOAD_BYTES) throw new OfferImageError('image is larger than 10 MB');
  if (!response.body) throw new OfferImageError('empty response');
  const chunks: Uint8Array[] = [];
  let total = 0;
  const reader = response.body.getReader();
  for (;;) {
    const { done, value } = await reader.read();
    if (done) break;
    total += value.byteLength;
    if (total > MAX_DOWNLOAD_BYTES) {
      await reader.cancel();
      throw new OfferImageError('image is larger than 10 MB');
    }
    chunks.push(value);
  }
  return Buffer.concat(chunks);
}

// Some shops drop requests from an agent that names itself, others only answer one that does, so a refused
// request is tried once more with the other. 404, 410 and the like are answers, not refusals, and are not retried.
const USER_AGENTS = ['Mozilla/5.0 (compatible; PepLookupImageCopy/1.0; +https://peplookup.com)', 'Mozilla/5.0'];
const isRefusal = (status: number) => status === 403 || status === 429 || status >= 500;

async function requestWithAgents(url: URL): Promise<Response> {
  let outcome: Response | Error | null = null;
  for (const agent of USER_AGENTS) {
    try {
      const response = await fetch(url, {
        redirect: 'manual',
        signal: AbortSignal.timeout(FETCH_TIMEOUT_MS),
        headers: { 'user-agent': agent, accept: 'image/*,*/*;q=0.5' },
      });
      if (!isRefusal(response.status)) return response;
      outcome = outcome ?? response;
    } catch (error) {
      outcome = outcome ?? (error instanceof Error ? error : new Error('unknown'));
    }
  }
  if (outcome instanceof Response) return outcome;
  throw new OfferImageError(outcome?.name === 'TimeoutError' ? 'timed out' : `request failed (${outcome?.message ?? 'unknown'})`);
}

/** Downloads one image, following a few redirects and re-checking the host on each hop. */
export async function downloadImage(sourceUrl: string): Promise<Buffer> {
  let current = sourceUrl;
  for (let hop = 0; hop <= MAX_REDIRECTS; hop += 1) {
    const url = await assertPublicHttpUrl(current);
    const response = await requestWithAgents(url);
    if (response.status >= 300 && response.status < 400) {
      const location = response.headers.get('location');
      if (!location) throw new OfferImageError(`redirect without a location (HTTP ${response.status})`);
      current = new URL(location, url).toString();
      continue;
    }
    if (!response.ok) throw new OfferImageError(`HTTP ${response.status}`);
    return readCapped(response);
  }
  throw new OfferImageError('too many redirects');
}

/** Max 800px wide (never enlarged), WebP, EXIF orientation applied before the metadata is dropped. */
export async function convertToWebp(input: Buffer): Promise<Buffer> {
  let format: string | undefined;
  try {
    format = (await sharp(input).metadata()).format;
  } catch {
    throw new OfferImageError('not an image');
  }
  if (!format || !ACCEPTED_FORMATS.has(format)) throw new OfferImageError(`unsupported image type (${format ?? 'unknown'})`);
  const output = await sharp(input).rotate().resize({ width: MAX_WIDTH, withoutEnlargement: true }).webp({ quality: WEBP_QUALITY }).toBuffer();
  if (output.byteLength > MAX_STORED_BYTES) throw new OfferImageError('converted image is larger than 1 MB');
  return output;
}

function shortHash(value: string): string {
  return createHash('sha256').update(value).digest('hex').slice(0, 8);
}

/** What the file for a supplier's product is called when one picture is all it has. */
function plainFileName(supplierSlug: string, productSlug: string): string {
  return `${supplierSlug}-${productSlug}.webp`;
}

export interface SiblingImage {
  imageUrl: string | null;
  imageSourceUrl: string | null;
}

/**
 * `{supplier-slug}-{product-slug}.webp`, unless another picture of the same supplier's same
 * compound already holds that name. A supplier often shows a different photo for each size or
 * kit of one compound, and one shared name would make each overwrite the last, so a second,
 * different source gets a short suffix taken from its own address.
 */
export function chooseImageFileName(
  supplierSlug: string,
  productSlug: string,
  sourceUrl: string,
  siblings: readonly SiblingImage[],
): string {
  const plain = plainFileName(supplierSlug, productSlug);
  const heldByAnother = siblings.some(
    (sibling) =>
      sibling.imageUrl !== null &&
      sibling.imageUrl.split('?')[0]?.endsWith(`/${OFFER_IMAGE_BUCKET}/${plain}`) &&
      sibling.imageSourceUrl !== sourceUrl,
  );
  return heldByAnother ? `${supplierSlug}-${productSlug}-${shortHash(sourceUrl)}.webp` : plain;
}

/** True when the URL already points at our own copy, so there is nothing to mirror. */
export function isOwnImageUrl(url: string, supabaseUrl: string | undefined = process.env.NEXT_PUBLIC_SUPABASE_URL): boolean {
  if (!supabaseUrl) return false;
  try {
    const candidate = new URL(url);
    return candidate.host === new URL(supabaseUrl).host && candidate.pathname.startsWith(`/storage/v1/object/public/${OFFER_IMAGE_BUCKET}/`);
  } catch {
    return false;
  }
}

export interface MirroredImage {
  /** Our public URL; the query string changes with the source so a replaced picture is not served stale. */
  imageUrl: string;
  imageSourceUrl: string;
}

async function uploadToBucket(client: SupabaseClient, path: string, data: Buffer) {
  const upload = () =>
    client.storage.from(OFFER_IMAGE_BUCKET).upload(path, data, {
      contentType: 'image/webp',
      cacheControl: '31536000',
      // The same offer's picture is replaced under the same name when its source changes.
      upsert: true,
    });

  const first = await upload();
  if (!first.error) return;
  if (!/bucket not found/i.test(first.error.message)) throw new OfferImageError(`upload failed (${first.error.message})`);

  // 0032_offers_image_source_url.sql creates the bucket; this covers a database where
  // that hasn't been run yet, with the same settings.
  const { error: createError } = await client.storage.createBucket(OFFER_IMAGE_BUCKET, {
    public: true,
    fileSizeLimit: MAX_STORED_BYTES,
    allowedMimeTypes: ['image/webp'],
  });
  if (createError) throw new OfferImageError(`the "${OFFER_IMAGE_BUCKET}" bucket does not exist and could not be created (${createError.message})`);
  const retry = await upload();
  if (retry.error) throw new OfferImageError(`upload failed (${retry.error.message})`);
}

/** Downloads, converts and stores one picture. Throws OfferImageError when any step fails. */
export async function mirrorOfferImage(
  client: SupabaseClient,
  input: { sourceUrl: string; supplierSlug: string; productSlug: string; siblings: readonly SiblingImage[] },
): Promise<MirroredImage> {
  const webp = await convertToWebp(await downloadImage(input.sourceUrl));
  const fileName = chooseImageFileName(input.supplierSlug, input.productSlug, input.sourceUrl, input.siblings);
  await uploadToBucket(client, fileName, webp);
  const { data } = client.storage.from(OFFER_IMAGE_BUCKET).getPublicUrl(fileName);
  return { imageUrl: `${data.publicUrl}?v=${shortHash(input.sourceUrl)}`, imageSourceUrl: input.sourceUrl };
}

import 'server-only';
import { randomUUID } from 'node:crypto';
import sharp from 'sharp';
import type { SupabaseClient } from '@supabase/supabase-js';
import { getSupabaseServerClient } from '@/lib/supabase/server';
import { AdminDbError } from '@/lib/admin/vendors';

export const GUIDE_IMAGE_BUCKET = 'guide-images';

const MAX_UPLOAD_BYTES = 2 * 1024 * 1024;
const TARGET_BYTES = 200 * 1024;
/** Covers render at 16:9 and never wider than this, so anything larger is only extra bytes. */
const MAX_WIDTH = 1600;
const MIN_WIDTH = 1200;
const MIN_HEIGHT = 675;
/** Tried in order until the WebP fits under TARGET_BYTES. */
const WEBP_QUALITIES = [80, 72, 64, 56] as const;
const ACCEPTED_FORMATS = new Set(['jpeg', 'png', 'webp']);

export interface GuideCoverUpload {
  url: string;
  width: number;
  height: number;
  bytes: number;
  /** Advisory only: the upload still goes through. */
  warnings: string[];
}

function dimensionWarnings(width: number, height: number): string[] {
  const warnings: string[] = [];
  // Within 1% of 16:9 still crops invisibly at the sizes covers render at.
  if (Math.abs(width / height - 16 / 9) > (16 / 9) * 0.01) {
    warnings.push(`The image is ${width} × ${height}, not 16:9. It will be cropped to 16:9 on the guide and its card.`);
  }
  if (width < MIN_WIDTH || height < MIN_HEIGHT) {
    warnings.push(`The image is ${width} × ${height}, smaller than the 1200 × 675 minimum. It may look soft on large screens.`);
  }
  return warnings;
}

async function toWebp(input: Buffer): Promise<{ data: Buffer; width: number; height: number; overTarget: boolean }> {
  let smallest: { data: Buffer; width: number; height: number } | null = null;
  for (const quality of WEBP_QUALITIES) {
    const { data, info } = await sharp(input)
      // Applies the EXIF orientation before metadata is stripped, so phone photos don't come out sideways.
      .rotate()
      .resize({ width: MAX_WIDTH, withoutEnlargement: true })
      .webp({ quality })
      .toBuffer({ resolveWithObject: true });
    if (data.byteLength <= TARGET_BYTES) return { data, width: info.width, height: info.height, overTarget: false };
    if (!smallest || data.byteLength < smallest.data.byteLength) smallest = { data, width: info.width, height: info.height };
  }
  if (!smallest) throw new AdminDbError('The image could not be converted to WebP.');
  return { ...smallest, overTarget: true };
}

async function uploadToBucket(client: SupabaseClient, path: string, data: Buffer) {
  const upload = () =>
    client.storage.from(GUIDE_IMAGE_BUCKET).upload(path, data, {
      contentType: 'image/webp',
      // Each upload gets a unique name, so the file at a URL never changes.
      cacheControl: '31536000',
      upsert: false,
    });

  const first = await upload();
  if (!first.error) return;
  if (!/bucket not found/i.test(first.error.message)) throw new AdminDbError(`Upload failed: ${first.error.message}`);

  // 0030_guide_cover_images.sql creates the bucket; this covers a database
  // where that hasn't been run yet, with the same settings.
  const { error: createError } = await client.storage.createBucket(GUIDE_IMAGE_BUCKET, {
    public: true,
    fileSizeLimit: MAX_UPLOAD_BYTES,
    allowedMimeTypes: ['image/webp'],
  });
  if (createError) {
    throw new AdminDbError(
      `The "${GUIDE_IMAGE_BUCKET}" storage bucket does not exist and could not be created (${createError.message}). Run supabase/migrations/0030_guide_cover_images.sql in the Supabase SQL editor.`,
    );
  }
  const retry = await upload();
  if (retry.error) throw new AdminDbError(`Upload failed: ${retry.error.message}`);
}

/**
 * Validates an uploaded cover, converts it to WebP and stores it in the
 * public guide-images bucket with the server's secret key. Returns the public
 * URL to save as the guide's cover_image_url.
 */
export async function uploadGuideCover(file: File, slugHint: string): Promise<GuideCoverUpload> {
  const client = getSupabaseServerClient();
  if (!client) {
    throw new AdminDbError('Supabase is not configured, set SUPABASE_SECRET_KEY and NEXT_PUBLIC_SUPABASE_URL.');
  }
  if (file.size === 0) throw new AdminDbError('Choose an image to upload.');
  if (file.size > MAX_UPLOAD_BYTES) {
    throw new AdminDbError(`The image is ${(file.size / 1024 / 1024).toFixed(1)} MB. The limit is 2 MB.`);
  }

  const input = Buffer.from(await file.arrayBuffer());
  // The browser's reported type is only a claim; the decoder decides.
  const metadata = await sharp(input)
    .metadata()
    .catch(() => null);
  if (!metadata?.format || !ACCEPTED_FORMATS.has(metadata.format) || !metadata.width || !metadata.height) {
    throw new AdminDbError('That file is not a JPG, PNG or WebP image.');
  }

  // EXIF orientations 5–8 are rotated 90°, so the stored width is the displayed height.
  const rotated = (metadata.orientation ?? 1) >= 5;
  const width = rotated ? metadata.height : metadata.width;
  const height = rotated ? metadata.width : metadata.height;
  const warnings = dimensionWarnings(width, height);

  const webp = await toWebp(input);
  if (webp.overTarget) {
    warnings.push(
      `The converted image is ${Math.round(webp.data.byteLength / 1024)} KB, above the 200 KB target. A simpler or smaller image will load faster.`,
    );
  }

  const base = slugHint.replace(/[^a-z0-9-]/g, '').slice(0, 60) || 'guide';
  const path = `${base}-${randomUUID().slice(0, 8)}.webp`;
  await uploadToBucket(client, path, webp.data);

  const { data } = client.storage.from(GUIDE_IMAGE_BUCKET).getPublicUrl(path);
  return { url: data.publicUrl, width: webp.width, height: webp.height, bytes: webp.data.byteLength, warnings };
}

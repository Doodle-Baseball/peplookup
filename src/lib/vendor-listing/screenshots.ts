import 'server-only';
import { randomUUID } from 'node:crypto';
import { requireClient, VendorListingDbError } from '@/lib/vendor-listing/requests';

/** Private bucket created by 0034_vendor_listing_manual_payment.sql. */
const BUCKET = 'vendor-payment-screenshots';

/** Long enough to look at a screenshot, short enough that a copied link soon stops working. */
const SIGNED_URL_SECONDS = 60 * 60;

const EXTENSION: Record<string, string> = {
  'image/png': 'png',
  'image/jpeg': 'jpg',
  'image/webp': 'webp',
};

/** Stores the screenshot under the request id and returns its path in the bucket. */
export async function uploadPaymentScreenshot(requestId: string, bytes: Uint8Array, contentType: string): Promise<string> {
  const path = `${requestId}/${randomUUID()}.${EXTENSION[contentType] ?? 'bin'}`;
  const { error } = await requireClient().storage.from(BUCKET).upload(path, bytes, { contentType, upsert: false });
  if (error) {
    throw new VendorListingDbError(
      /bucket not found/i.test(error.message)
        ? 'The payment screenshot bucket is not there yet. Run supabase/migrations/0034_vendor_listing_manual_payment.sql in the Supabase SQL editor first.'
        : `The payment screenshot could not be stored: ${error.message}`,
    );
  }
  return path;
}

export async function deletePaymentScreenshot(path: string): Promise<void> {
  const { error } = await requireClient().storage.from(BUCKET).remove([path]);
  if (error) throw new VendorListingDbError(`The payment screenshot could not be deleted: ${error.message}`);
}

/** Short-lived links for the admin, keyed by path. A path that can't be signed is left out and logged. */
export async function signedScreenshotUrls(paths: readonly string[]): Promise<Record<string, string>> {
  if (paths.length === 0) return {};
  const { data, error } = await requireClient().storage.from(BUCKET).createSignedUrls([...paths], SIGNED_URL_SECONDS);
  if (error) {
    console.error('[vendor-listing] Screenshot links could not be created:', error.message);
    return {};
  }
  const urls: Record<string, string> = {};
  for (const item of data ?? []) {
    if (item.path && item.signedUrl) urls[item.path] = item.signedUrl;
    else if (item.error) console.error(`[vendor-listing] Screenshot link for ${item.path ?? 'unknown path'} failed: ${item.error}`);
  }
  return urls;
}

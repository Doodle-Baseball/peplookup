import 'server-only';
import { unstable_cache } from 'next/cache';
import { getSupabaseServerClient } from '@/lib/supabase/server';
import { fetchCouponPageContentFromDb } from '@/lib/supabase/coupon-page-content';
import {
  defaultCouponPageContent,
  resolveCouponPageContent,
  type CouponPageContent,
  type CouponPageContentOverride,
} from '@/lib/coupon-page-content';
import type { Supplier } from '@/lib/schema';
import { CATALOGUE_REVALIDATE_SECONDS } from '@/lib/cache-ttl';

export const COUPON_CONTENT_CACHE_TAG = 'coupon-page-content';

/**
 * Saved overrides for every vendor, cached like the rest of the repository;
 * the admin revalidates the tag on save so an edit shows straight away.
 */
const getSavedCouponPageContent = unstable_cache(
  async (): Promise<Record<string, CouponPageContentOverride>> => {
    const client = getSupabaseServerClient();
    if (!client) return {};
    const bySlug = await fetchCouponPageContentFromDb(client);
    // Null means the table is unreachable or not migrated yet; the generated
    // text then stands in, so every coupon page keeps all its sections.
    return bySlug === null ? {} : Object.fromEntries(bySlug);
  },
  ['coupon-page-content'],
  { revalidate: CATALOGUE_REVALIDATE_SECONDS, tags: [COUPON_CONTENT_CACHE_TAG] },
);

/** The text a coupon page renders: saved where there is some, generated elsewhere. */
export async function getCouponPageContent(
  supplier: Pick<Supplier, 'slug' | 'name' | 'description' | 'shippingCost'>,
  coupon: NonNullable<Supplier['coupon']>,
): Promise<CouponPageContent> {
  const saved = await getSavedCouponPageContent();
  return resolveCouponPageContent(defaultCouponPageContent(supplier, coupon), saved[supplier.slug] ?? null);
}

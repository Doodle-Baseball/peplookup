import 'server-only';
import { getSupabaseServerClient } from '@/lib/supabase/server';
import { fetchCouponPageContentFromDb, saveCouponPageContentInDb } from '@/lib/supabase/coupon-page-content';
import { AdminDbError } from '@/lib/admin/vendors';
import { getSeoDashboardData, type SeoEntry } from '@/lib/admin/seo';
import { getSupplier, getSuppliers } from '@/lib/repository';
import {
  defaultCouponPageContent,
  resolveCouponPageContent,
  type CouponPageContent,
  type CouponPageContentOverride,
} from '@/lib/coupon-page-content';
import type { Supplier } from '@/lib/schema';

const CONTENT_MIGRATION = 'supabase/migrations/0023_coupon_page_content.sql';

const MISSING_TABLE_MESSAGE = `The coupon page text table is not set up yet. Run ${CONTENT_MIGRATION} in the Supabase SQL editor, then reload this page.`;

function requireClient() {
  const client = getSupabaseServerClient();
  if (!client) {
    throw new AdminDbError('Supabase is not configured. Set SUPABASE_SECRET_KEY and NEXT_PUBLIC_SUPABASE_URL.');
  }
  return client;
}

export interface CouponPageSummary {
  entry: SeoEntry;
  vendorName: string;
  logoUrl: string | null;
  code: string;
  percentOff: number;
  /** True when this page's text has been edited here (a row exists in coupon_page_content). */
  contentCustomized: boolean;
}

export interface CouponPagesData {
  pages: CouponPageSummary[];
  /** Set when the SEO tables are missing; pages are still listed. */
  seoSetupError: string | null;
  /** Set when coupon_page_content is missing; the text can be read but not saved. */
  contentSetupError: string | null;
}

/** Every vendor coupon page, with its SEO state and whether its text has been customised. */
export async function getCouponPagesData(): Promise<CouponPagesData> {
  const [seo, suppliers, saved] = await Promise.all([
    getSeoDashboardData(),
    getSuppliers(),
    fetchCouponPageContentFromDb(requireClient()),
  ]);
  const supplierBySlug = new Map(
    suppliers.filter((supplier) => supplier.coupon !== null).map((supplier) => [supplier.slug, supplier]),
  );

  const pages: CouponPageSummary[] = [];
  for (const entry of seo.entries) {
    if (entry.kind !== 'coupon' || entry.slug === null) continue;
    const supplier = supplierBySlug.get(entry.slug);
    const coupon = supplier?.coupon;
    if (!supplier || !coupon) continue;
    pages.push({
      entry,
      vendorName: supplier.name,
      logoUrl: supplier.logoUrl ?? supplier.faviconUrl,
      code: coupon.code,
      percentOff: coupon.percentOff,
      contentCustomized: saved?.has(entry.slug) ?? false,
    });
  }

  return {
    pages,
    seoSetupError: seo.setupError,
    contentSetupError: saved === null ? MISSING_TABLE_MESSAGE : null,
  };
}

export interface CouponPageEditData {
  supplier: Supplier;
  coupon: NonNullable<Supplier['coupon']>;
  defaults: CouponPageContent;
  /** What the form starts with: saved text where there is some, generated text elsewhere. */
  current: CouponPageContent;
  customized: boolean;
  contentSetupError: string | null;
}

export async function getCouponPageEditData(slug: string): Promise<CouponPageEditData | null> {
  const supplier = await getSupplier(slug);
  if (!supplier?.coupon) return null;
  const saved = await fetchCouponPageContentFromDb(requireClient());
  const override = saved?.get(slug) ?? null;
  const defaults = defaultCouponPageContent(supplier, supplier.coupon);
  return {
    supplier,
    coupon: supplier.coupon,
    defaults,
    current: resolveCouponPageContent(defaults, override),
    customized: override !== null,
    contentSetupError: saved === null ? MISSING_TABLE_MESSAGE : null,
  };
}

export async function saveCouponPageContent(slug: string, content: CouponPageContentOverride): Promise<void> {
  const { error } = await saveCouponPageContentInDb(requireClient(), slug, content);
  if (!error) return;
  if (error.includes('coupon_page_content') || error.includes('schema cache')) {
    throw new AdminDbError(
      `Coupon page text needs the coupon_page_content table. Run ${CONTENT_MIGRATION} in the Supabase SQL editor, then try again.`,
    );
  }
  throw new AdminDbError(error);
}

import 'server-only';
import type { SupabaseClient } from '@supabase/supabase-js';
import type { AccessType, CoaVerificationLevel, Supplier } from '@/lib/schema';

/** Snake_case shape of a row in the `suppliers` table (see supabase/migrations/). */
export interface SupplierRow {
  slug: string;
  name: string;
  logo_url: string | null;
  favicon_url: string | null;
  homepage_url: string;
  affiliate_url: string;
  tier: 'elite' | 'pro' | null;
  trust_rating: number | null;
  lab_score: number | null;
  lab_verified: boolean;
  founded_year: number | null;
  review_rating: number | null;
  review_count_kind: 'exact' | 'atLeast' | null;
  review_count_value: number | null;
  reviews_url: string | null;
  shipping_cost: Supplier['shippingCost'];
  shipping_speed: string | null;
  payment_methods: string[];
  coupon_code: string | null;
  coupon_percent_off: number | null;
  description: string | null;
  hotline: string | null;
  policy_shipping_url: string | null;
  policy_returns_url: string | null;
  policy_privacy_url: string | null;
  policy_terms_url: string | null;
  inventory_refreshed_at: string | null;
  country: string | null;
  is_active: boolean;
  /** Added by 0015_supplier_featured.sql; undefined until that migration runs. */
  is_featured?: boolean;
  created_at: string;
  updated_at: string;
  access_type: AccessType | null;
  supply_countries: string[];
  coa_verification_level: CoaVerificationLevel | null;
  coa_lab_name: string | null;
  domain_registered_at: string | null;
  /** Added by 0013_display_order.sql; undefined until that migration runs. */
  position?: number | null;
}

export function rowToSupplier(row: SupplierRow): Supplier {
  return {
    slug: row.slug,
    name: row.name,
    logoUrl: row.logo_url,
    faviconUrl: row.favicon_url,
    homepageUrl: row.homepage_url,
    affiliateUrl: row.affiliate_url,
    tier: row.tier,
    trustRating: row.trust_rating,
    labScore: row.lab_score,
    labVerified: row.lab_verified,
    foundedYear: row.founded_year,
    reviewRating: row.review_rating,
    reviewCount:
      row.review_count_kind && row.review_count_value !== null
        ? { kind: row.review_count_kind, value: row.review_count_value }
        : null,
    reviewsUrl: row.reviews_url,
    shippingCost: row.shipping_cost,
    shippingSpeed: row.shipping_speed,
    paymentMethods: row.payment_methods,
    coupon:
      row.coupon_code && row.coupon_percent_off !== null
        ? { code: row.coupon_code, percentOff: row.coupon_percent_off }
        : null,
    description: row.description,
    hotline: row.hotline,
    policyUrls: {
      shipping: row.policy_shipping_url,
      returns: row.policy_returns_url,
      privacy: row.policy_privacy_url,
      terms: row.policy_terms_url,
    },
    inventoryRefreshedAt: row.inventory_refreshed_at,
    country: row.country,
    isActive: row.is_active,
    isFeatured: row.is_featured ?? false,
    createdAt: row.created_at,
    accessType: row.access_type,
    supplyCountries: row.supply_countries,
    coaVerificationLevel: row.coa_verification_level,
    coaLabName: row.coa_lab_name,
    domainRegisteredAt: row.domain_registered_at,
    position: row.position ?? null,
  };
}

/**
 * Reads all suppliers from Supabase. Returns null (not []) on any failure,
 * missing table, network error, bad credentials, so callers can fall back
 * to the static seed data instead of showing an empty site.
 */
export async function fetchSuppliersFromDb(
  client: SupabaseClient,
  { includeInactive = false }: { includeInactive?: boolean } = {},
): Promise<Supplier[] | null> {
  let query = client.from('suppliers').select('*').order('created_at', { ascending: false });
  if (!includeInactive) query = query.eq('is_active', true);
  const { data, error } = await query;
  if (error || !data) return null;
  return (data as SupplierRow[]).map(rowToSupplier);
}

export async function fetchSupplierFromDb(
  client: SupabaseClient,
  slug: string,
): Promise<Supplier | null> {
  const { data, error } = await client.from('suppliers').select('*').eq('slug', slug).maybeSingle();
  if (error || !data) return null;
  return rowToSupplier(data as SupplierRow);
}

export interface VendorInput {
  name: string;
  homepageUrl: string;
  affiliateUrl: string;
  description: string | null;
  country: string | null;
  logoUrl: string | null;
  faviconUrl: string | null;
  isActive: boolean;
  foundedYear: number | null;
  accessType: AccessType | null;
  supplyCountries: string[];
  coaVerificationLevel: CoaVerificationLevel | null;
  coaLabName: string | null;
  shippingSpeed: string | null;
  paymentMethods: string[];
  couponCode: string | null;
  couponPercentOff: number | null;
  policyShippingUrl: string | null;
  policyReturnsUrl: string | null;
  /** Headline vendor score out of 5, shown on the reviews panel. */
  reviewRating: number | null;
  /** Public reviews profile (Trustpilot) the panel's "read them all" link points at. */
  reviewsUrl: string | null;
  /** Set server-side from a WHOIS lookup, not directly by the admin form. */
  domainRegisteredAt?: string | null;
}

export function vendorInputToInsertRow(slug: string, input: VendorInput) {
  return {
    slug,
    name: input.name,
    homepage_url: input.homepageUrl,
    affiliate_url: input.affiliateUrl,
    description: input.description,
    country: input.country,
    logo_url: input.logoUrl,
    favicon_url: input.faviconUrl,
    is_active: input.isActive,
    founded_year: input.foundedYear,
    access_type: input.accessType,
    supply_countries: input.supplyCountries,
    coa_verification_level: input.coaVerificationLevel,
    coa_lab_name: input.coaLabName,
    shipping_speed: input.shippingSpeed,
    payment_methods: input.paymentMethods,
    coupon_code: input.couponCode,
    coupon_percent_off: input.couponPercentOff,
    policy_shipping_url: input.policyShippingUrl,
    policy_returns_url: input.policyReturnsUrl,
    review_rating: input.reviewRating,
    reviews_url: input.reviewsUrl,
    ...(input.domainRegisteredAt !== undefined
      ? { domain_registered_at: input.domainRegisteredAt }
      : {}),
  };
}

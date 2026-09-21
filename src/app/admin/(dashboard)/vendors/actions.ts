'use server';

import { revalidatePath, revalidateTag } from 'next/cache';
import { redirect } from 'next/navigation';
import {
  createVendor,
  updateVendor,
  deleteVendor,
  getVendor,
  setVendorActive,
  setVendorFeatured,
  saveVendorReviews,
  refreshAllVendorImages,
  AdminDbError,
} from '@/lib/admin/vendors';
import { createOffer, deleteOffer, getOfferRow, listOffersForVendor, updateOffer } from '@/lib/admin/offers';
import { discountPercentText, offerToVendorProductEntry, type VendorProductEntry } from '@/lib/vendor-products';
import type { VendorInput } from '@/lib/supabase/suppliers';
import {
  accessTypeSchema,
  coaVerificationLevelSchema,
  productFormSchema,
  supplierReviewSchema,
  type ProductForm,
  type Supplier,
  type SupplierReview,
} from '@/lib/schema';
import { toCents } from '@/lib/money';
import { resolveAffiliateUrl } from '@/data/vendor-affiliate-links';
import { getMappedCell, inferFieldMapping, parseCsvText, type VendorImportField } from '@/lib/vendor-import';
import { saveDisplayOrder } from '@/lib/admin/display-order';

export interface VendorFormState {
  error: string | null;
  /** Set on a successful save so the form can show a confirmation without navigating away. */
  savedAt?: number | null;
}

export interface BulkVendorImportState {
  error: string | null;
  success: string | null;
  imported: number;
}

/**
 * Public pages read supplier data too, so a write here must refresh them.
 *
 * `revalidateTag('suppliers')` is the part that actually matters for that:
 * `getSuppliers()`/`getSupplier()` are cached under that tag with a 5-minute
 * window, independent of the route-level cache `revalidatePath` clears, so
 * without it a vendor's affiliate link, policy URLs or coupon code could
 * still read stale on every page that reads supplier data (lab reports,
 * coupons, price checker, the supplier's own page, not just /suppliers
 * itself) for up to 5 minutes after a save.
 */
function revalidatePublicSupplierPages(slug?: string) {
  revalidateTag('suppliers');
  revalidateTag('offers');
  // The vendor form's step 6 writes reviews too, and the review set has its
  // own cache tag that no revalidatePath reaches.
  revalidateTag('supplier-reviews');
  revalidatePath('/admin/vendors');
  revalidatePath('/admin');
  revalidatePath('/suppliers');
  revalidatePath('/suppliers/[slug]', 'page');
  revalidatePath('/products/[slug]', 'page');
  revalidatePath('/lab-reports');
  revalidatePath('/price-checker');
  revalidatePath('/coupons');
  revalidatePath('/');
  if (slug) revalidatePath(`/suppliers/${slug}`);
}

type PendingVendorProduct = VendorProductEntry;

function readVendorProducts(formData: FormData): PendingVendorProduct[] {
  const raw = String(formData.get('vendorProducts') ?? '').trim();
  if (!raw) return [];

  try {
    const parsed = JSON.parse(raw) as PendingVendorProduct[];
    if (!Array.isArray(parsed)) return [];
    return parsed.filter((entry) => {
      const formResult = productFormSchema.safeParse(entry.form);
      return !!entry.compoundSlug && !!entry.productUrl && !!entry.price && formResult.success;
    });
  } catch {
    return [];
  }
}

/** The ordered review list from the step 7 editor; anything malformed is dropped rather than saved half-formed. */
function readVendorReviews(formData: FormData): SupplierReview[] {
  const raw = String(formData.get('vendorReviews') ?? '').trim();
  if (!raw) return [];

  try {
    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.flatMap((entry) => {
      const result = supplierReviewSchema.safeParse(entry);
      return result.success ? [result.data] : [];
    });
  } catch {
    return [];
  }
}

function parseVendorProductSize(sizeText: string, form: ProductForm): number {
  const normalized = sizeText.trim().toLowerCase().replace(/\s+/g, ' ');
  const match = normalized.match(/^(\d+(?:\.\d+)?)\s*(mg|mcg|ml)?$/);
  if (!match) throw new AdminDbError('Each size must be a number with mg, mcg, or mL, such as 10 mg or 250 mcg.');

  const value = Number(match[1]);
  const unit = match[2] ?? 'mg';
  let micrograms = value;
  if (unit === 'mg') micrograms = value * 1000;
  else if (unit === 'ml') micrograms = value * 1000;
  if (!Number.isFinite(micrograms) || micrograms <= 0) {
    throw new AdminDbError('Each size value must be a positive amount.');
  }
  return Math.round(micrograms);
}

/** Ids of saved listings the admin removed from step 5's product list. */
function readRemovedVendorProductIds(formData: FormData): string[] {
  const raw = String(formData.get('removedVendorProducts') ?? '').trim();
  if (!raw) return [];

  try {
    const parsed: unknown = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed.filter((id): id is string => typeof id === 'string' && id.length > 0) : [];
  } catch {
    return [];
  }
}

function salePriceFor(listPrice: number, discountPercentInput: string): number | null {
  const discountPercent = Number(discountPercentInput || 0);
  return discountPercent > 0 ? Math.max(0, Math.round(listPrice * (1 - discountPercent / 100))) : null;
}

/** Replaces every literal occurrence of `from` in `url` with `to`, leaving the rest of the URL untouched. */
function replaceCode(url: string, from: string, to: string): string {
  return url.includes(from) ? url.split(from).join(to) : url;
}

/**
 * Applies step 5's product list. New rows are created; saved rows the admin
 * edited are updated, keeping what the form doesn't show (stock, photo, lab
 * report, pack count); saved rows removed from the list are deleted. Saved
 * rows left untouched are not re-written, unless the vendor's coupon code
 * just changed and this row's URL still carries the old code, that case is
 * written too, purely to swap the code in the URL, so a code update reaches
 * every listing that references it, not just the ones the admin happened to
 * touch this session. Returns whether anything changed.
 */
async function saveVendorProducts(
  supplierSlug: string,
  entries: PendingVendorProduct[],
  removedOfferIds: string[],
  couponCodeChange: { from: string; to: string } | null = null,
): Promise<boolean> {
  let changed = false;

  for (const id of removedOfferIds) {
    const stored = await getOfferRow(id);
    if (!stored || stored.supplierSlug !== supplierSlug) continue;
    await deleteOffer(id);
    changed = true;
  }

  for (const rawEntry of entries) {
    const propagatedProductUrl = couponCodeChange
      ? replaceCode(rawEntry.productUrl, couponCodeChange.from, couponCodeChange.to)
      : rawEntry.productUrl;
    const propagatedCoaUrl = couponCodeChange
      ? replaceCode(rawEntry.coaUrl, couponCodeChange.from, couponCodeChange.to)
      : rawEntry.coaUrl;
    const urlChangedByCoupon = propagatedProductUrl !== rawEntry.productUrl || propagatedCoaUrl !== rawEntry.coaUrl;
    const entry = urlChangedByCoupon
      ? { ...rawEntry, productUrl: propagatedProductUrl, coaUrl: propagatedCoaUrl }
      : rawEntry;

    if (entry.offerId && !entry.edited && !urlChangedByCoupon) continue;

    const formResult = productFormSchema.safeParse(entry.form);
    if (!formResult.success) continue;
    const form = formResult.data;
    const listPrice = toCents(entry.price);
    const vialSize = parseVendorProductSize(entry.size, form);

    if (entry.offerId) {
      const stored = await getOfferRow(entry.offerId);
      if (!stored || stored.supplierSlug !== supplierSlug) continue;
      // An unchanged price and discount keep the stored sale price exactly
      // instead of re-deriving it from a rounded percentage.
      const pricingUnchanged =
        listPrice === stored.listPrice &&
        entry.discountPercent === discountPercentText(stored.listPrice, stored.salePrice);
      await updateOffer(entry.offerId, {
        productSlug: entry.compoundSlug,
        supplierSlug,
        form,
        vialSize,
        vialCount: stored.vialCount,
        listPrice,
        salePrice: pricingUnchanged ? stored.salePrice : salePriceFor(listPrice, entry.discountPercent),
        currency: stored.currency,
        inStock: stored.inStock,
        productUrl: entry.productUrl,
        imageUrl: stored.imageUrl,
        labReport: stored.labReport,
        coaUrl: entry.coaUrl || null,
      });
      changed = true;
      continue;
    }

    await createOffer({
      productSlug: entry.compoundSlug,
      supplierSlug,
      form,
      vialSize,
      vialCount: 1,
      listPrice,
      salePrice: salePriceFor(listPrice, entry.discountPercent),
      currency: 'USD',
      inStock: true,
      productUrl: entry.productUrl,
      imageUrl: null,
      labReport: null,
      coaUrl: entry.coaUrl || null,
    });
    changed = true;
  }

  return changed;
}

function readVendorInput(formData: FormData): VendorInput {
  const name = String(formData.get('name') ?? '').trim();
  const affiliateUrl = String(formData.get('affiliateUrl') ?? '').trim();
  const description = String(formData.get('description') ?? '').trim();
  const country = String(formData.get('country') ?? '').trim();
  const logoUrl = String(formData.get('logoUrl') ?? '').trim();

  if (!name) throw new AdminDbError('Vendor name is required.');
  if (!affiliateUrl) throw new AdminDbError('Affiliate Website Link is required.');

  const foundedYearRaw = String(formData.get('foundedYear') ?? '').trim();
  const foundedYear = foundedYearRaw ? Number(foundedYearRaw) : null;

  const accessTypeRaw = String(formData.get('accessType') ?? '');
  const accessTypeResult = accessTypeSchema.safeParse(accessTypeRaw);
  const accessType = accessTypeResult.success ? accessTypeResult.data : null;

  const coaLevelRaw = String(formData.get('coaVerificationLevel') ?? '');
  const coaLevelResult = coaVerificationLevelSchema.safeParse(coaLevelRaw);
  const coaVerificationLevel = coaLevelResult.success ? coaLevelResult.data : null;

  const coaLabName = String(formData.get('coaLabName') ?? '').trim();
  const shippingSpeed = String(formData.get('shippingSpeed') ?? '').trim();
  // "New Coupon Code" is an update field, not a replacement-by-default: leaving
  // it blank keeps whatever code was already saved (carried in the hidden
  // "existingCouponCode" field) rather than clearing it.
  const existingCouponCode = String(formData.get('existingCouponCode') ?? '').trim();
  const newCouponCode = String(formData.get('newCouponCode') ?? '').trim();
  const couponCode = newCouponCode || existingCouponCode;
  const couponPercentOffRaw = String(formData.get('couponPercentOff') ?? '').trim();
  const policyShippingUrl = String(formData.get('policyShippingUrl') ?? '').trim();
  const policyReturnsUrl = String(formData.get('policyReturnsUrl') ?? '').trim();
  const reviewsUrl = String(formData.get('reviewsUrl') ?? '').trim();

  const reviewRatingRaw = String(formData.get('reviewRating') ?? '').trim();
  const reviewRatingValue = reviewRatingRaw ? Number(reviewRatingRaw) : null;
  if (reviewRatingValue !== null && (!Number.isFinite(reviewRatingValue) || reviewRatingValue < 0 || reviewRatingValue > 5)) {
    throw new AdminDbError('Vendor rating must be a number between 0 and 5.');
  }

  const paymentMethods = String(formData.get('paymentMethods') ?? '')
    .split(',')
    .map((m) => m.trim())
    .filter(Boolean);

  const supplyCountries = formData.getAll('supplyCountries').map(String).filter(Boolean);

  return {
    name,
    homepageUrl: affiliateUrl,
    affiliateUrl: affiliateUrl || resolveAffiliateUrl(affiliateUrl),
    description: description || null,
    country: country || null,
    logoUrl: logoUrl || null,
    faviconUrl: null,
    isActive: formData.get('isActive') === 'on',
    foundedYear,
    accessType,
    supplyCountries,
    coaVerificationLevel,
    coaLabName: coaLabName || null,
    shippingSpeed: shippingSpeed || null,
    paymentMethods,
    couponCode: couponCode || null,
    couponPercentOff: couponPercentOffRaw ? Number(couponPercentOffRaw) : null,
    policyShippingUrl: policyShippingUrl || null,
    policyReturnsUrl: policyReturnsUrl || null,
    reviewRating: reviewRatingValue,
    reviewsUrl: reviewsUrl || null,
  };
}

/**
 * When the vendor's coupon code changes, the same code is very often baked
 * into the affiliate link and policy URLs as a referral parameter; this keeps
 * them in sync with the new code rather than leaving the old one stranded in
 * a URL that no longer matches what the vendor page displays. Only a URL that
 * actually contains the old code is touched, one that never referenced it is
 * left exactly as typed.
 */
function propagateCouponCodeToVendorUrls(input: VendorInput, from: string, to: string): VendorInput {
  return {
    ...input,
    affiliateUrl: replaceCode(input.affiliateUrl, from, to),
    homepageUrl: replaceCode(input.homepageUrl, from, to),
    policyShippingUrl: input.policyShippingUrl ? replaceCode(input.policyShippingUrl, from, to) : input.policyShippingUrl,
    policyReturnsUrl: input.policyReturnsUrl ? replaceCode(input.policyReturnsUrl, from, to) : input.policyReturnsUrl,
  };
}

export async function createVendorAction(
  _prevState: VendorFormState,
  formData: FormData,
): Promise<VendorFormState> {
  let createdVendorSlug: string | undefined;
  // Carried through so a vendor created from, say, step 4 lands back on step 4
  // of its own edit page rather than restarting at step 1.
  const currentStep = String(formData.get('currentStep') ?? '0');
  try {
    const input = readVendorInput(formData);
    const createdVendor = await createVendor(input);
    createdVendorSlug = createdVendor.slug;

    await saveVendorReviews(createdVendor.slug, readVendorReviews(formData));

    if (await saveVendorProducts(createdVendor.slug, readVendorProducts(formData), [])) {
      revalidateTag('offers');
    }
  } catch (error) {
    return { error: error instanceof Error ? error.message : 'Failed to create vendor.' };
  }
  revalidatePublicSupplierPages(createdVendorSlug);
  redirect(`/admin/vendors/${createdVendorSlug}/edit?step=${currentStep}`);
}

export async function updateVendorAction(
  slug: string,
  _prevState: VendorFormState,
  formData: FormData,
): Promise<VendorFormState> {
  try {
    let input = readVendorInput(formData);
    const existingCouponCode = String(formData.get('existingCouponCode') ?? '').trim();
    const codeChanged = Boolean(existingCouponCode && input.couponCode && existingCouponCode !== input.couponCode);
    if (codeChanged) {
      input = propagateCouponCodeToVendorUrls(input, existingCouponCode, input.couponCode!);
    }
    await updateVendor(slug, input);

    await saveVendorReviews(slug, readVendorReviews(formData));

    const productsChanged = await saveVendorProducts(
      slug,
      readVendorProducts(formData),
      readRemovedVendorProductIds(formData),
      codeChanged ? { from: existingCouponCode, to: input.couponCode! } : null,
    );
    if (productsChanged) revalidateTag('offers');
  } catch (error) {
    return { error: error instanceof Error ? error.message : 'Failed to update vendor.' };
  }
  revalidatePublicSupplierPages(slug);
  // No redirect: the admin can save from any step and keep editing in place,
  // rather than being bounced back to the vendor list after every save.
  return { error: null, savedAt: Date.now() };
}

/** The saved vendor's own fields, unchanged, as the shape `updateVendor` writes. */
function supplierToVendorInput(vendor: Supplier): VendorInput {
  return {
    name: vendor.name,
    homepageUrl: vendor.homepageUrl,
    affiliateUrl: vendor.affiliateUrl,
    description: vendor.description,
    country: vendor.country,
    logoUrl: vendor.logoUrl,
    faviconUrl: vendor.faviconUrl,
    isActive: vendor.isActive,
    foundedYear: vendor.foundedYear,
    accessType: vendor.accessType,
    supplyCountries: [...vendor.supplyCountries],
    coaVerificationLevel: vendor.coaVerificationLevel,
    coaLabName: vendor.coaLabName,
    shippingSpeed: vendor.shippingSpeed,
    paymentMethods: [...vendor.paymentMethods],
    couponCode: vendor.coupon?.code ?? null,
    couponPercentOff: vendor.coupon?.percentOff ?? null,
    policyShippingUrl: vendor.policyUrls.shipping,
    policyReturnsUrl: vendor.policyUrls.returns,
    reviewRating: vendor.reviewRating,
    reviewsUrl: vendor.reviewsUrl,
  };
}

/**
 * The Coupon / Promo Code section's own Save button: updates just the coupon
 * code and propagates it everywhere the old code was already used (affiliate
 * link, policy URLs, every saved product URL for this vendor), without
 * requiring the rest of the multi-step form to be filled in or submitted.
 */
export async function updateVendorCouponCodeAction(
  slug: string,
  newCode: string,
): Promise<{ error: string | null; code: string | null }> {
  try {
    const vendor = await getVendor(slug);
    if (!vendor) throw new AdminDbError('Vendor not found.');

    const existingCode = vendor.coupon?.code ?? '';
    const trimmedNew = newCode.trim();
    // Blank means "keep the current code", same rule as the field's own hint.
    const finalCode = trimmedNew || existingCode;
    if (!finalCode) {
      return { error: 'Enter a coupon code to save.', code: null };
    }

    const codeChanged = Boolean(existingCode && finalCode !== existingCode);
    let input = supplierToVendorInput(vendor);
    input.couponCode = finalCode;
    if (codeChanged) {
      input = propagateCouponCodeToVendorUrls(input, existingCode, finalCode);
    }
    await updateVendor(slug, input);

    if (codeChanged) {
      const offers = await listOffersForVendor(slug);
      const entries = offers.map((offer) => offerToVendorProductEntry(offer, offer.productSlug));
      const productsChanged = await saveVendorProducts(slug, entries, [], { from: existingCode, to: finalCode });
      if (productsChanged) revalidateTag('offers');
    }

    revalidatePublicSupplierPages(slug);
    return { error: null, code: finalCode };
  } catch (error) {
    return {
      error: error instanceof Error ? error.message : 'Failed to update the coupon code.',
      code: null,
    };
  }
}

export async function toggleVendorStatusAction(
  slug: string,
  nextIsActive: boolean,
): Promise<{ error: string | null }> {
  try {
    await setVendorActive(slug, nextIsActive);
  } catch (error) {
    return { error: error instanceof Error ? error.message : 'Failed to update status.' };
  }
  revalidatePublicSupplierPages(slug);
  return { error: null };
}

export async function toggleVendorFeaturedAction(
  slug: string,
  nextIsFeatured: boolean,
): Promise<{ error: string | null }> {
  try {
    await setVendorFeatured(slug, nextIsFeatured);
  } catch (error) {
    return { error: error instanceof Error ? error.message : 'Failed to update featured status.' };
  }
  revalidatePublicSupplierPages(slug);
  return { error: null };
}

function parseBulkVendorMapping(raw: string): Partial<Record<VendorImportField, string>> {
  if (!raw) return {};
  try {
    const parsed = JSON.parse(raw) as Partial<Record<VendorImportField, string>>;
    return parsed ?? {};
  } catch {
    return {};
  }
}

function mapAccessType(value: string): VendorInput['accessType'] {
  const normalized = value.trim().toLowerCase();
  if (!normalized) return null;
  const valid = ['ruo', 'legit_script', 'telehealth'];
  return valid.includes(normalized) ? (normalized as VendorInput['accessType']) : null;
}

function rowToVendorInput(row: string[], headers: string[], mapping: Partial<Record<VendorImportField, string>>): VendorInput | null {
  const name = getMappedCell(row, headers, mapping, 'name');
  const affiliateUrlValue = getMappedCell(row, headers, mapping, 'affiliateUrl');
  const affiliateUrl = affiliateUrlValue || '';
  if (!name || !affiliateUrl) return null;
  const yearText = getMappedCell(row, headers, mapping, 'foundedYear');
  const country = getMappedCell(row, headers, mapping, 'country') || null;
  const description = getMappedCell(row, headers, mapping, 'description') || null;
  const logoUrl = getMappedCell(row, headers, mapping, 'logoUrl') || null;
  const shippingSpeed = getMappedCell(row, headers, mapping, 'shippingSpeed') || null;
  const paymentMethods = getMappedCell(row, headers, mapping, 'paymentMethods')
    .split(',')
    .map((part) => part.trim())
    .filter(Boolean);
  const couponCode = getMappedCell(row, headers, mapping, 'couponCode') || null;
  const couponPercentOffText = getMappedCell(row, headers, mapping, 'couponPercentOff');
  const policyShippingUrl = getMappedCell(row, headers, mapping, 'policyShippingUrl') || null;
  const policyReturnsUrl = getMappedCell(row, headers, mapping, 'policyReturnsUrl') || null;

  const normalizedLogoUrl = logoUrl && /\.(png|jpg|jpeg|svg|webp|gif|ico)(\?.*)?$/i.test(logoUrl)
    ? logoUrl
    : null;

  return {
    name,
    homepageUrl: affiliateUrl,
    affiliateUrl,
    description,
    country,
    logoUrl: normalizedLogoUrl,
    faviconUrl: null,
    isActive: true,
    foundedYear: yearText ? Number(yearText) || null : null,
    accessType: mapAccessType(getMappedCell(row, headers, mapping, 'accessType')),
    supplyCountries: [],
    coaVerificationLevel: null,
    coaLabName: null,
    shippingSpeed,
    paymentMethods,
    couponCode,
    couponPercentOff: couponPercentOffText ? Number(couponPercentOffText) || null : null,
    policyShippingUrl,
    policyReturnsUrl,
    reviewRating: null,
    reviewsUrl: null,
  };
}

export async function bulkImportVendorsAction(
  _prevState: BulkVendorImportState,
  formData: FormData,
): Promise<BulkVendorImportState> {
  try {
    const csvText = String(formData.get('csvText') ?? '').trim();
    if (!csvText) {
      return { error: 'Upload a CSV file to import vendors.', success: null, imported: 0 };
    }

    const rows = parseCsvText(csvText);
    if (rows.length < 2) {
      return { error: 'The CSV file must include a header row and at least one vendor row.', success: null, imported: 0 };
    }

    const headers = rows[0] ?? [];
    const mapping = parseBulkVendorMapping(String(formData.get('columnMapping') ?? '{}'));
    const resolvedMapping = { ...inferFieldMapping(headers), ...mapping };

    const createdVendorNames: string[] = [];
    for (const row of rows.slice(1)) {
      const vendorInput = rowToVendorInput(row, headers, resolvedMapping);
      if (!vendorInput) continue;
      const created = await createVendor(vendorInput);
      createdVendorNames.push(created.name);
    }

    if (createdVendorNames.length === 0) {
      return { error: 'No valid vendor rows were found. Check the CSV headers and mapped columns.', success: null, imported: 0 };
    }

    revalidatePublicSupplierPages();
    return {
      error: null,
      success: `Imported ${createdVendorNames.length} vendor${createdVendorNames.length === 1 ? '' : 's'} successfully.`,
      imported: createdVendorNames.length,
    };
  } catch (error) {
    return {
      error: error instanceof Error ? error.message : 'Failed to import vendors.',
      success: null,
      imported: 0,
    };
  }
}

export async function refreshAllVendorImagesAction(): Promise<{ error: string | null; updated: number }> {
  try {
    const updated = await refreshAllVendorImages();
    revalidatePublicSupplierPages();
    return { error: null, updated };
  } catch (error) {
    return {
      error: error instanceof Error ? error.message : 'Failed to refresh supplier images.',
      updated: 0,
    };
  }
}

export async function deleteVendorAction(slug: string): Promise<{ error: string | null }> {
  try {
    await deleteVendor(slug);
  } catch (error) {
    return { error: error instanceof Error ? error.message : 'Failed to delete vendor.' };
  }
  revalidatePublicSupplierPages(slug);
  return { error: null };
}

/** Persists the drag-and-drop order of the vendor directory. */
export async function saveVendorOrderAction(slugs: string[]): Promise<{ error?: string }> {
  try {
    await saveDisplayOrder('suppliers', slugs);
  } catch (error) {
    return { error: error instanceof AdminDbError ? error.message : 'Could not save the new order.' };
  }
  revalidateTag('suppliers');
  revalidatePath('/admin/vendors');
  revalidatePath('/suppliers');
  revalidatePath('/');
  return {};
}

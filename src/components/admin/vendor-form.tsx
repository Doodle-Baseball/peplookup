'use client';

import {
  startTransition,
  useActionState,
  useEffect,
  useMemo,
  useRef,
  useState,
  useTransition,
  type FormEvent,
} from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { updateVendorCouponCodeAction, type VendorFormState } from '@/app/admin/(dashboard)/vendors/actions';
import type { Offer, ProductForm, Supplier, SupplierReview } from '@/lib/schema';
import { COUNTRIES } from '@/lib/countries';
import { faviconUrl } from '@/lib/favicon';
import { formatReviewDate } from '@/lib/format';
import { Field, Select, MultiSelect, TextArea } from '@/components/admin/form-fields';
import { ChevronDownIcon } from '@/components/icons/icons';
import { StarRating } from '@/components/ui/star-rating';
import {
  offerToVendorProductEntry,
  parseVendorProductsCsv,
  vendorProductsCsvTemplate,
  type VendorProductEntry,
} from '@/lib/vendor-products';

const INITIAL_STATE: VendorFormState = { error: null };

const CURRENT_YEAR = new Date().getFullYear();
const YEAR_OPTIONS = Array.from({ length: CURRENT_YEAR - 1989 }, (_, i) => CURRENT_YEAR - i);

const ACCESS_TYPES = [
  { value: 'ruo', label: 'RUO (Research use only)' },
  { value: 'legit_script', label: 'Legit Script' },
  { value: 'telehealth', label: 'TeleHealth' },
] as const;

const COA_LEVELS = [
  { value: 'none', label: 'None' },
  { value: 'product_level', label: 'Product-level' },
  { value: 'batch_level', label: 'Batch-level' },
] as const;

const STEP_LABELS = [
  '1 Key Details',
  '2 Location & Access',
  '3 Commercial Details',
  '4 Contact & Policies',
  '5 Products & Pricing',
  '6 Reviews',
] as const;

type PendingProductEntry = VendorProductEntry;

/** Half points included, vendors commonly publish a 4.5 rather than a flat 4 or 5. */
const REVIEW_RATING_OPTIONS = [5, 4.5, 4, 3.5, 3, 2.5, 2, 1.5, 1];

const REVIEW_ROW_BUTTON_CLASS =
  'inline-flex h-7 w-7 items-center justify-center rounded-chip border border-line bg-surface text-muted transition-colors hover:border-brand hover:text-content disabled:pointer-events-none disabled:opacity-40';

// Stable empty defaults for the omitted-prop case (the new-vendor form never
// passes `reviews`/`products`). A `= []` default parameter creates a brand
// new array on every single render the prop is omitted for, including ones
// triggered by the component's own state changes; an effect keyed on that
// value then sees a "changed" dependency every render and loops forever
// calling its own setState. Module-scope constants give every such render
// the exact same reference instead.
const EMPTY_REVIEWS: SupplierReview[] = [];
const EMPTY_PRODUCTS: { slug: string; name: string }[] = [];

export function VendorForm({
  action,
  vendor,
  reviews: initialReviews = EMPTY_REVIEWS,
  submitLabel,
  products = EMPTY_PRODUCTS,
  existingProducts,
  initialStep,
  storedCoupon,
  detectedCouponCode = null,
}: {
  action: (prevState: VendorFormState, formData: FormData) => Promise<VendorFormState>;
  vendor?: Supplier;
  reviews?: SupplierReview[];
  submitLabel: string;
  products?: { slug: string; name: string }[];
  /** Listings already saved for this vendor: null when they couldn't be loaded, omitted on the new-vendor form. */
  existingProducts?: Offer[] | null;
  /** Step to land on, e.g. returning here right after creating the vendor from step 4. */
  initialStep?: number;
  /**
   * The coupon columns as stored, including a code saved without a percentage,
   * which `vendor.coupon` can't represent. Omitted on the new-vendor form.
   */
  storedCoupon?: { code: string | null; percentOff: number | null };
  /** A code found in the vendor's saved links when none is saved yet; shown until saved. */
  detectedCouponCode?: string | null;
}) {
  const router = useRouter();
  const [rawState, formAction, pending] = useActionState(action, INITIAL_STATE);
  // An unresolvable Server Action (a tab open across a deploy, or a dev
  // rebuild that reassigned action ids) resolves to undefined instead of a
  // state object; falling back keeps the form usable instead of crashing.
  const state = rawState ?? INITIAL_STATE;
  const [iconUrl, setIconUrl] = useState(vendor?.logoUrl ?? '');
  const [affiliateUrl, setAffiliateUrl] = useState(vendor?.affiliateUrl ?? vendor?.homepageUrl ?? '');
  const [vendorName, setVendorName] = useState(vendor?.name ?? '');
  const [newCouponCode, setNewCouponCode] = useState('');
  const savedCouponCode = storedCoupon?.code ?? vendor?.coupon?.code ?? null;
  const savedCouponPercentOff = storedCoupon?.percentOff ?? vendor?.coupon?.percentOff ?? null;
  const [couponPercentOff, setCouponPercentOff] = useState(
    savedCouponPercentOff !== null ? String(savedCouponPercentOff) : '',
  );
  // Keeps the field in step with a fresh save once router.refresh() re-renders with the stored value.
  useEffect(() => {
    setCouponPercentOff(savedCouponPercentOff !== null ? String(savedCouponPercentOff) : '');
  }, [savedCouponPercentOff]);
  const [couponSaving, startCouponSave] = useTransition();
  const [couponSaveMessage, setCouponSaveMessage] = useState<{ tone: 'ok' | 'error'; text: string } | null>(null);
  const [csvImportResult, setCsvImportResult] = useState<{ added: number; errors: string[] } | null>(null);
  const productsCsvInputRef = useRef<HTMLInputElement>(null);
  const [stepIndex, setStepIndex] = useState(() =>
    initialStep !== undefined && initialStep >= 0 && initialStep < STEP_LABELS.length ? initialStep : 0,
  );
  const productNames = useMemo(() => new Map(products.map((product) => [product.slug, product.name])), [products]);
  const [selectedCompoundSlug, setSelectedCompoundSlug] = useState('');
  const [selectedProductType, setSelectedProductType] = useState<ProductForm>('vial');
  const [productSizeInput, setProductSizeInput] = useState('');
  const [productUrlInput, setProductUrlInput] = useState('');
  const [coaUrlInput, setCoaUrlInput] = useState('');
  const [productPriceInput, setProductPriceInput] = useState('');
  // Saved listings start in the list as editable rows; edits and removals are
  // applied to them when the vendor is saved.
  const [pendingProducts, setPendingProducts] = useState<PendingProductEntry[]>(() =>
    [...(existingProducts ?? [])]
      .map((offer) => ({ offer, name: productNames.get(offer.productSlug) ?? offer.productSlug }))
      .sort((a, b) => a.name.localeCompare(b.name) || a.offer.vialSize - b.offer.vialSize)
      .map(({ offer, name }) => offerToVendorProductEntry(offer, name)),
  );
  const [removedOfferIds, setRemovedOfferIds] = useState<string[]>([]);
  const savedProductCount = pendingProducts.filter((item) => item.offerId).length;
  const newProductCount = pendingProducts.length - savedProductCount;
  const [editingProductIndex, setEditingProductIndex] = useState<number | null>(null);
  const [reviewAuthor, setReviewAuthor] = useState('');
  const [reviewInput, setReviewInput] = useState('');
  const [reviewRating, setReviewRating] = useState('5');
  const [reviewDate, setReviewDate] = useState('');
  const [editingReviewIndex, setEditingReviewIndex] = useState<number | null>(null);
  const [reviews, setReviews] = useState<SupplierReview[]>(initialReviews);

  const previewSrc = iconUrl || (affiliateUrl ? faviconUrl(affiliateUrl) : null);
  const selectedCompound = useMemo(
    () => products.find((product) => product.slug === selectedCompoundSlug) ?? null,
    [products, selectedCompoundSlug],
  );
  const isLastStep = stepIndex === STEP_LABELS.length - 1;

  const resetProductForm = () => {
    setEditingProductIndex(null);
    setSelectedCompoundSlug('');
    setSelectedProductType('vial');
    setProductSizeInput('');
    setProductUrlInput('');
    setCoaUrlInput('');
    setProductPriceInput('');
  };

  const addPendingProduct = () => {
    if (!selectedCompoundSlug) return;
    const size = productSizeInput.trim();
    const productUrl = productUrlInput.trim();
    const productPrice = productPriceInput.trim();
    if (!size || !productUrl || !productPrice) return;

    // Per-product discount is no longer editable here, the vendor-level
    // Discount % next to the coupon code now covers that. Editing an existing
    // row still keeps whatever discount it already had rather than silently
    // clearing it just because the admin fixed, say, its URL; a brand new row
    // simply has none.
    const previousEntry = editingProductIndex !== null ? pendingProducts[editingProductIndex] : null;

    const entry: PendingProductEntry = {
      compoundSlug: selectedCompoundSlug,
      compoundName: selectedCompound?.name ?? selectedCompoundSlug,
      form: selectedProductType,
      size,
      productUrl,
      coaUrl: coaUrlInput.trim(),
      price: productPrice,
      discountCode: previousEntry?.discountCode ?? '',
      discountPercent: previousEntry?.discountPercent ?? '',
    };

    setPendingProducts((current) => {
      if (editingProductIndex !== null) {
        const next = [...current];
        const offerId = current[editingProductIndex]?.offerId;
        // Keep the saved listing's id so the edit updates it rather than adding a copy.
        next[editingProductIndex] = offerId ? { ...entry, offerId, edited: true } : entry;
        return next;
      }

      const sameProduct = current.some(
        (item) =>
          item.compoundSlug === entry.compoundSlug &&
          item.form === entry.form &&
          item.size === entry.size &&
          item.productUrl === entry.productUrl,
      );
      return sameProduct ? current : [...current, entry];
    });

    resetProductForm();
  };

  function downloadProductsCsvTemplate() {
    const url = URL.createObjectURL(
      new Blob([vendorProductsCsvTemplate(products[0]?.name)], { type: 'text/csv;charset=utf-8' }),
    );
    const link = document.createElement('a');
    link.href = url;
    link.download = 'vendor-products-template.csv';
    link.click();
    // Revoking synchronously can cancel the download in some browsers.
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  }

  async function handleProductsCsvUpload(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.target.value = ''; // lets the same file be re-selected after fixing it
    if (!file) return;

    const text = await file.text();
    const { rows, fileErrors } = parseVendorProductsCsv(text, products);
    if (fileErrors.length > 0) {
      setCsvImportResult({ added: 0, errors: fileErrors });
      return;
    }

    let added = 0;
    const rowErrors: string[] = [];
    setPendingProducts((current) => {
      const next = [...current];
      for (const row of rows) {
        if (!row.entry) {
          rowErrors.push(`Row ${row.rowNumber}: ${row.errors.join(' ')}`);
          continue;
        }
        const duplicate = next.some(
          (item) =>
            item.compoundSlug === row.entry!.compoundSlug &&
            item.form === row.entry!.form &&
            item.size === row.entry!.size &&
            item.productUrl === row.entry!.productUrl,
        );
        if (duplicate) {
          rowErrors.push(`Row ${row.rowNumber}: already in the product list, skipped.`);
          continue;
        }
        next.push(row.entry);
        added += 1;
      }
      return next;
    });
    setCsvImportResult({ added, errors: rowErrors });
  }

  const resetReviewForm = () => {
    setEditingReviewIndex(null);
    setReviewAuthor('');
    setReviewInput('');
    setReviewRating('5');
    setReviewDate('');
  };

  const submitReview = () => {
    const author = reviewAuthor.trim();
    const body = reviewInput.trim();
    if (!author || !body) return;

    const entry: SupplierReview = {
      author,
      rating: Number(reviewRating) || 5,
      body,
      reviewedAt: reviewDate || null,
    };

    setReviews((current) => {
      if (editingReviewIndex === null) return [...current, entry];
      const next = [...current];
      // Keep the row id so an edit updates in place rather than reading as a delete + add.
      next[editingReviewIndex] = { ...entry, ...(current[editingReviewIndex]?.id ? { id: current[editingReviewIndex].id } : {}) };
      return next;
    });

    resetReviewForm();
  };

  const editReview = (index: number) => {
    const review = reviews[index];
    if (!review) return;
    setEditingReviewIndex(index);
    setReviewAuthor(review.author);
    setReviewRating(String(review.rating));
    setReviewDate(review.reviewedAt ?? '');
    setReviewInput(review.body);
  };

  const removeReview = (index: number) => {
    setReviews((current) => current.filter((_, i) => i !== index));
    if (editingReviewIndex === index) resetReviewForm();
    else if (editingReviewIndex !== null && editingReviewIndex > index) {
      setEditingReviewIndex(editingReviewIndex - 1);
    }
  };

  /** Swaps a review with its neighbour; display order is what gets saved as `position`. */
  const moveReview = (index: number, offset: -1 | 1) => {
    setReviews((current) => {
      const target = index + offset;
      if (target < 0 || target >= current.length) return current;
      const next = [...current];
      [next[index], next[target]] = [next[target]!, next[index]!];
      return next;
    });
    if (editingReviewIndex === index) setEditingReviewIndex(index + offset);
    else if (editingReviewIndex === index + offset) setEditingReviewIndex(index);
  };

  const stepTitle = STEP_LABELS[stepIndex];

  // After a save, refresh this route's server data (fresh vendor, offer ids,
  // review ids) without navigating away, and clear the "New Coupon Code"
  // input now that it has become the current one.
  useEffect(() => {
    if (!state.savedAt) return;
    router.refresh();
    setNewCouponCode('');
  }, [state.savedAt, router]);

  // Once the refresh above lands, `existingProducts` arrives as a new prop;
  // re-derive the pending list from it so a listing that was just created
  // picks up its real id. Without this, saving twice in a row without an
  // actual page reload would re-create the same "new" rows a second time,
  // since the client would still believe they had never been saved.
  useEffect(() => {
    setPendingProducts(
      [...(existingProducts ?? [])]
        .map((offer) => ({ offer, name: productNames.get(offer.productSlug) ?? offer.productSlug }))
        .sort((a, b) => a.name.localeCompare(b.name) || a.offer.vialSize - b.offer.vialSize)
        .map(({ offer, name }) => offerToVendorProductEntry(offer, name)),
    );
    setRemovedOfferIds([]);
    resetProductForm();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [existingProducts]);

  // Same reasoning as above, for the review list.
  useEffect(() => {
    setReviews(initialReviews);
    resetReviewForm();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialReviews]);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    // Dispatched manually rather than via <form action>: React resets every
    // uncontrolled field (defaultValue-based, most of this form) back to its
    // original value after a native form-action submission completes, which
    // would wipe out everything just saved the moment the action returns.
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    startTransition(() => formAction(formData));
  }

  /**
   * The Coupon / Promo Code section's own save, independent of the rest of
   * the form: saves just the code and propagates it across every URL that
   * already used the old one, without requiring the whole multi-step form to
   * be submitted. Only meaningful once the vendor exists (has a slug).
   */
  function saveCouponCode() {
    if (!vendor) return;
    setCouponSaveMessage(null);
    startCouponSave(async () => {
      const result = await updateVendorCouponCodeAction(vendor.slug, newCouponCode, couponPercentOff);
      if (result.error) {
        setCouponSaveMessage({ tone: 'error', text: result.error });
        return;
      }
      setNewCouponCode('');
      setCouponSaveMessage({ tone: 'ok', text: `Coupon code saved: ${result.code}. Updating linked URLs…` });
      router.refresh();
    });
  }

  return (
    <form onSubmit={handleSubmit} className="max-w-4xl space-y-6">
      <div className="rounded-card border border-line bg-surface-raised p-4">
        <div className="flex flex-wrap gap-2 text-xs font-bold text-muted">
          {STEP_LABELS.map((step, index) => {
            const active = index === stepIndex;
            const done = index < stepIndex;
            return (
              <button
                key={step}
                type="button"
                onClick={() => setStepIndex(index)}
                className={`rounded-pill border px-2.5 py-1.5 transition-colors ${
                  active
                    ? 'border-brand bg-brand-soft text-brand-strong'
                    : done
                      ? 'border-ok/40 bg-ok/10 text-ok'
                      : 'border-line bg-surface text-muted hover:border-brand hover:text-content'
                }`}
              >
                {step}
              </button>
            );
          })}
        </div>
      </div>

      <section className={stepIndex === 0 ? 'rounded-card border border-line bg-surface-raised p-4 sm:p-6' : 'hidden'}>
          <div className="mb-5">
            <h2 className="text-sm font-black uppercase tracking-wide text-content">{stepTitle}</h2>
          </div>
          <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
            <Field
              label="Name"
              name="name"
              value={vendorName}
              onChange={(e) => setVendorName(e.target.value)}
              required
              error={state.error?.startsWith('Vendor name') ? 'Vendor name is required.' : undefined}
            />

            <div className="md:col-span-2">
              <label htmlFor="affiliateUrl" className="block text-sm font-semibold text-content">
                Affiliate Website Link
              </label>
              <input
                id="affiliateUrl"
                name="affiliateUrl"
                type="url"
                required
                value={affiliateUrl}
                onChange={(e) => setAffiliateUrl(e.target.value)}
                placeholder="https://"
                className="mt-1.5 w-full rounded-chip border border-line bg-surface px-3.5 py-2.5 text-sm text-content outline-none transition-colors"
              />
              <p className="mt-1 text-xs text-muted">This is the vendor&rsquo;s affiliate website link and is used for redirects.</p>
            </div>

            <Select
              label="Established (Year)"
              name="foundedYear"
              defaultValue={vendor?.foundedYear ? String(vendor.foundedYear) : ''}
            >
              <option value="">Not set</option>
              {YEAR_OPTIONS.map((year) => (
                <option key={year} value={year}>
                  {year}
                </option>
              ))}
            </Select>

            <div className="md:col-span-2">
              <label htmlFor="description" className="block text-sm font-semibold text-content">
                Description
              </label>
              <textarea
                id="description"
                name="description"
                rows={4}
                defaultValue={vendor?.description ?? undefined}
                className="mt-1.5 w-full rounded-chip border border-line bg-surface px-3.5 py-2.5 text-sm text-content outline-none transition-colors"
              />
            </div>

            <div className="md:col-span-2">
              <label htmlFor="logoUrl" className="block text-sm font-semibold text-content">
                Icon URL
              </label>
              <div className="mt-1.5 flex items-center gap-3">
                <input
                  id="logoUrl"
                  name="logoUrl"
                  type="url"
                  value={iconUrl}
                  onChange={(e) => setIconUrl(e.target.value)}
                  placeholder="https:// (optional, uses website favicon if empty)"
                  className="w-full flex-1 rounded-chip border border-line bg-surface px-3.5 py-2.5 text-sm text-content outline-none transition-colors"
                />
                <div className="shrink-0 text-center">
                  <span className="flex h-11 w-11 items-center justify-center overflow-hidden rounded-chip border border-line bg-surface-sunken">
                    {previewSrc ? (
                      <Image src={previewSrc} alt="" width={44} height={44} className="h-full w-full object-contain" unoptimized />
                    ) : (
                      <span aria-hidden="true" className="text-xs text-faint">
                        ?
                      </span>
                    )}
                  </span>
                  <span className="mt-1 block text-[10px] font-semibold uppercase text-faint">Preview</span>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-5 rounded-card border border-line bg-surface p-4">
            <p className="text-sm font-black text-content">Coupon / Promo Code</p>
            <div className="mt-3 grid grid-cols-1 gap-4 md:grid-cols-3">
              <div>
                <label className="block text-sm font-semibold text-content">Current/Existing Coupon Code</label>
                <p className="mt-1.5 w-full truncate rounded-chip border border-line bg-surface-sunken px-3.5 py-2.5 text-sm text-muted">
                  {savedCouponCode || detectedCouponCode || 'None set'}
                </p>
                <p className="mt-1 text-xs text-muted">
                  {savedCouponCode
                    ? `The code currently saved for this vendor${
                        savedCouponPercentOff !== null ? ` (${savedCouponPercentOff}% off)` : ', with no Discount % saved yet'
                      }.`
                    : detectedCouponCode
                      ? 'Found in this vendor’s saved links but not saved yet. Enter the Discount % and click Save to keep it.'
                      : 'The code currently saved for this vendor.'}
                </p>
              </div>
              <div>
                <label htmlFor="newCouponCode" className="block text-sm font-semibold text-content">
                  New Coupon Code
                </label>
                <input
                  id="newCouponCode"
                  name="newCouponCode"
                  type="text"
                  value={newCouponCode}
                  onChange={(e) => setNewCouponCode(e.target.value)}
                  placeholder="Enter the new coupon code here."
                  className="mt-1.5 w-full rounded-chip border border-line bg-surface px-3.5 py-2.5 text-sm text-content outline-none transition-colors"
                />
                <p className="mt-1 text-xs text-muted">
                  Leave blank to keep the current code. Saving updates the affiliate link, shipping and returns
                  policy URLs, and every saved product and COA URL that already contains the old code.
                </p>
              </div>
              <Field
                label="Discount %"
                name="couponPercentOff"
                type="number"
                value={couponPercentOff}
                onChange={(e) => setCouponPercentOff(e.target.value)}
                placeholder="10"
              />
            </div>

            {vendor ? (
              <div className="mt-4 flex flex-wrap items-center gap-3">
                <button
                  type="button"
                  onClick={saveCouponCode}
                  disabled={couponSaving || !(newCouponCode.trim() || savedCouponCode || detectedCouponCode)}
                  className="rounded-chip bg-brand px-5 py-2.5 text-sm font-bold text-white transition-colors hover:bg-brand-strong disabled:pointer-events-none disabled:opacity-50"
                >
                  {couponSaving ? 'Saving…' : 'Save'}
                </button>
                {couponSaveMessage ? (
                  <p
                    role={couponSaveMessage.tone === 'error' ? 'alert' : 'status'}
                    className={`text-sm font-semibold ${couponSaveMessage.tone === 'error' ? 'text-danger' : 'text-ok'}`}
                  >
                    {couponSaveMessage.text}
                  </p>
                ) : null}
              </div>
            ) : (
              <p className="mt-4 text-xs text-muted">Available once the vendor is created. Add it below and save the form first.</p>
            )}

            <input type="hidden" name="existingCouponCode" value={vendor?.coupon?.code ?? ''} />
            {/* The stored code even when it has no percentage yet, so saving the
                form keeps it rather than clearing it. Kept apart from
                existingCouponCode, which decides which URLs get the code swapped. */}
            <input type="hidden" name="storedCouponCode" value={savedCouponCode ?? ''} />
          </div>
      </section>

      <section className={stepIndex === 1 ? 'rounded-card border border-line bg-surface-raised p-4 sm:p-6' : 'hidden'}>
        <div className="mb-5">
          <h2 className="text-sm font-black uppercase tracking-wide text-content">{stepTitle}</h2>
        </div>
        <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
          <Select label="Country (HQ)" name="country" defaultValue={vendor?.country ?? ''}>
            <option value="">Select country</option>
            {COUNTRIES.map((country) => (
              <option key={country} value={country}>
                {country}
              </option>
            ))}
          </Select>

          <Select label="Access Type" name="accessType" defaultValue={vendor?.accessType ?? 'ruo'}>
            {ACCESS_TYPES.map((a) => (
              <option key={a.value} value={a.value}>
                {a.label}
              </option>
            ))}
          </Select>

          <div className="md:col-span-2">
            <MultiSelect
              label="Supply Countries"
              name="supplyCountries"
              defaultValue={vendor?.supplyCountries}
              options={COUNTRIES}
            />
          </div>
        </div>
      </section>

      <section className={stepIndex === 2 ? 'rounded-card border border-line bg-surface-raised p-4 sm:p-6' : 'hidden'}>
        <div className="mb-5">
          <h2 className="text-sm font-black uppercase tracking-wide text-content">{stepTitle}</h2>
        </div>
        <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
          <Select
            label="COA Verification"
            name="coaVerificationLevel"
            defaultValue={vendor?.coaVerificationLevel ?? 'batch_level'}
          >
            {COA_LEVELS.map((level) => (
              <option key={level.value} value={level.value}>
                {level.label}
              </option>
            ))}
          </Select>

          <Field
            label="COA Lab / Provider"
            name="coaLabName"
            defaultValue={vendor?.coaLabName ?? undefined}
            placeholder="Janoshik Analytical"
          />

          <Field
            label="Delivery Time"
            name="shippingSpeed"
            defaultValue={vendor?.shippingSpeed ?? undefined}
            placeholder="e.g. Free · 30 days"
          />

          {/* The coupon code and its Discount % moved to step 1, next to the icon preview. */}

          <Field
            label="Payment Methods"
            name="paymentMethods"
            defaultValue={vendor?.paymentMethods.join(', ')}
            placeholder="e.g. Wire, Crypto, ACH"
            hint="Comma-separated."
          />
        </div>
      </section>

      <section className={stepIndex === 3 ? 'rounded-card border border-line bg-surface-raised p-4 sm:p-6' : 'hidden'}>
        <div className="mb-5">
          <h2 className="text-sm font-black uppercase tracking-wide text-content">{stepTitle}</h2>
        </div>
        <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
          <Field
            label="Shipping Policy URL"
            name="policyShippingUrl"
            type="url"
            defaultValue={vendor?.policyUrls.shipping ?? undefined}
            placeholder="https://"
          />

          <Field
            label="Returns Policy URL"
            name="policyReturnsUrl"
            type="url"
            defaultValue={vendor?.policyUrls.returns ?? undefined}
            placeholder="https://"
          />
        </div>
      </section>

      <section className={stepIndex === 4 ? 'rounded-card border border-line bg-surface-raised p-4 sm:p-6' : 'hidden'}>
        <div className="mb-5">
          <h2 className="text-sm font-black uppercase tracking-wide text-content">{stepTitle}</h2>
        </div>

        <div className="space-y-5">
          <div className="rounded-card border border-line bg-surface p-4">
            <label htmlFor="compoundSelect" className="block text-sm font-semibold text-content">
              Compound
            </label>
            <select
              id="compoundSelect"
              value={selectedCompoundSlug}
              onChange={(e) => setSelectedCompoundSlug(e.target.value)}
              className="mt-1.5 w-full rounded-chip border border-line bg-surface px-3.5 py-2.5 text-sm text-content outline-none transition-colors"
            >
              <option value="">Choose a compound…</option>
              {products.map((product) => (
                <option key={product.slug} value={product.slug}>
                  {product.name}
                </option>
              ))}
            </select>
          </div>

          <div className="rounded-card border border-line bg-surface p-4">
            <p className="text-sm font-semibold text-content">Product type</p>
            <div className="mt-2 flex flex-wrap gap-2">
              {(
                [
                  ['vial', 'Vial'],
                  ['capsule', 'Capsule'],
                  ['spray', 'Spray'],
                  ['pen', 'Pen'],
                  ['serum', 'Serum'],
                ] as const
              ).map(([form, label]) => (
                <button
                  key={form}
                  type="button"
                  onClick={() => setSelectedProductType(form)}
                  className={`rounded-chip px-4 py-2 text-sm font-bold transition-colors ${
                    selectedProductType === form
                      ? 'bg-brand text-white'
                      : 'border border-line bg-surface text-content hover:border-brand hover:text-brand'
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div className="md:col-span-2">
              <label htmlFor="vendorProductSize" className="block text-sm font-semibold text-content">
                Size
              </label>
              <input
                id="vendorProductSize"
                type="text"
                value={productSizeInput}
                onChange={(e) => setProductSizeInput(e.target.value)}
                placeholder="10 mg / 250 mcg / 15 mL"
                className="mt-1.5 w-full rounded-chip border border-line bg-surface px-3.5 py-2.5 text-sm text-content outline-none transition-colors"
              />
            </div>

            <div className="md:col-span-2">
              <Field
                label="Product URL"
                name="vendorProductUrl"
                type="url"
                value={productUrlInput}
                onChange={(e) => setProductUrlInput(e.target.value)}
                placeholder="https://"
              />
            </div>

            <div className="md:col-span-2">
              <Field
                label="COA URL"
                name="vendorCoaUrl"
                type="url"
                value={coaUrlInput}
                onChange={(e) => setCoaUrlInput(e.target.value)}
                placeholder="https://"
              />
            </div>

            {/* Per-product discount % and code moved out: the vendor-level
                Discount % and Coupon / Promo Code in step 1 now cover this. */}
            <div className="md:col-span-2">
              <Field
                label="Price"
                name="vendorPrice"
                type="number"
                value={productPriceInput}
                onChange={(e) => setProductPriceInput(e.target.value)}
                placeholder="89.99"
              />
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-end gap-3">
            <input
              ref={productsCsvInputRef}
              type="file"
              accept=".csv,text/csv"
              className="hidden"
              onChange={handleProductsCsvUpload}
            />
            <button
              type="button"
              onClick={downloadProductsCsvTemplate}
              className="rounded-chip border border-line bg-surface px-4 py-2.5 text-sm font-bold text-content transition-colors hover:border-brand hover:text-brand"
            >
              Download CSV Template
            </button>
            <button
              type="button"
              onClick={() => productsCsvInputRef.current?.click()}
              className="rounded-chip border border-line bg-surface px-4 py-2.5 text-sm font-bold text-content transition-colors hover:border-brand hover:text-brand"
            >
              Upload CSV
            </button>
            <button
              type="button"
              onClick={addPendingProduct}
              className="rounded-chip bg-brand px-5 py-2.5 text-sm font-bold text-white transition-colors hover:bg-brand-strong"
            >
              {editingProductIndex !== null ? 'Save Product' : 'Add Product'}
            </button>
          </div>
          {editingProductIndex !== null ? (
            <div className="flex justify-end">
              <button
                type="button"
                onClick={resetProductForm}
                className="text-sm font-semibold text-muted hover:text-content"
              >
                Cancel edit
              </button>
            </div>
          ) : null}

          {csvImportResult ? (
            <div
              className={`rounded-card border p-3 text-sm ${
                csvImportResult.added > 0
                  ? 'border-ok/30 bg-ok/5 text-content'
                  : 'border-danger/30 bg-danger/5 text-content'
              }`}
            >
              <div className="flex items-start justify-between gap-3">
                <p className="font-bold">
                  {csvImportResult.added} product{csvImportResult.added === 1 ? '' : 's'} added
                  {csvImportResult.errors.length > 0
                    ? `, ${csvImportResult.errors.length} row${csvImportResult.errors.length === 1 ? '' : 's'} skipped`
                    : ''}
                  .
                </p>
                <button
                  type="button"
                  onClick={() => setCsvImportResult(null)}
                  className="shrink-0 text-xs font-bold text-muted hover:text-content"
                >
                  Dismiss
                </button>
              </div>
              {csvImportResult.errors.length > 0 ? (
                <ul className="mt-2 list-disc space-y-1 pl-5 text-xs text-danger">
                  {csvImportResult.errors.map((message, index) => (
                    <li key={index}>{message}</li>
                  ))}
                </ul>
              ) : null}
            </div>
          ) : null}
        </div>

        <input type="hidden" name="vendorProducts" value={JSON.stringify(pendingProducts)} />
        <input type="hidden" name="removedVendorProducts" value={JSON.stringify(removedOfferIds)} />

        <div className="mt-6 rounded-card border border-dashed border-line bg-surface p-4">
          <p className="text-[10px] font-bold uppercase tracking-wide text-faint">
            Products · {savedProductCount} saved{newProductCount > 0 ? `, ${newProductCount} new` : ''}
          </p>
          {existingProducts === null ? (
            <p className="mt-2 text-sm text-danger">
              Saved products couldn&rsquo;t be loaded, so only products added here are listed.
            </p>
          ) : null}
          {removedOfferIds.length > 0 ? (
            <p className="mt-2 text-sm text-danger">
              {removedOfferIds.length} saved product{removedOfferIds.length === 1 ? '' : 's'} will be deleted when you
              save changes.
            </p>
          ) : null}
          {pendingProducts.length === 0 ? (
            <p className="mt-2 text-sm text-muted">No products yet. Add one above.</p>
          ) : (
            <ul className="mt-3 space-y-2">
              {pendingProducts.map((item, index) => (
                <li key={`${item.compoundSlug}-${item.form}-${item.size}-${index}`} className="flex flex-col gap-2 rounded-card border border-line bg-surface-raised px-3 py-2 text-sm text-content sm:flex-row sm:items-center sm:justify-between sm:gap-3">
                  {/* Wraps onto extra lines on a phone instead of squeezing the Edit/Remove buttons. */}
                  <div className="flex min-w-0 flex-wrap items-center gap-x-2 gap-y-1">
                    <span className="font-bold">{item.compoundName}</span>
                    <span className="text-muted">{item.form}</span>
                    <span className="text-muted">{item.size}</span>
                    <span className="font-bold">${item.price}</span>
                    {item.discountPercent ? <span className="-ml-1 text-muted">(-{item.discountPercent}%)</span> : null}
                    <span
                      className={`rounded-pill px-2 py-0.5 text-[10px] font-bold uppercase ${
                        item.offerId ? (item.edited ? 'bg-warn/10 text-warn' : 'bg-ok/10 text-ok') : 'bg-brand-soft text-brand-strong'
                      }`}
                    >
                      {item.offerId ? (item.edited ? 'Edited' : 'Saved') : 'New'}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        const item = pendingProducts[index];
                        if (!item) return;
                        setEditingProductIndex(index);
                        setSelectedCompoundSlug(item.compoundSlug);
                        setSelectedProductType(item.form);
                        setProductSizeInput(item.size);
                        setProductUrlInput(item.productUrl);
                        setCoaUrlInput(item.coaUrl);
                        setProductPriceInput(item.price);
                        setStepIndex(4);
                      }}
                      className="text-xs font-bold text-brand hover:text-brand/80"
                    >
                      Edit
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        const removedOfferId = pendingProducts[index]?.offerId;
                        if (removedOfferId) setRemovedOfferIds((current) => [...current, removedOfferId]);
                        setPendingProducts((current) => current.filter((_, i) => i !== index));
                        if (editingProductIndex === index) {
                          resetProductForm();
                        }
                      }}
                      className="text-xs font-bold text-danger hover:text-danger/80"
                    >
                      Remove
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </section>

      <section className={stepIndex === 5 ? 'rounded-card border border-line bg-surface-raised p-4 sm:p-6' : 'hidden'}>
        <div className="mb-5">
          <h2 className="text-sm font-black uppercase tracking-wide text-content">{stepTitle}</h2>
        </div>

        <div className="space-y-5">
          {/* Vendor-level score and the public profile the panel links out to. */}
          <div className="rounded-card border border-line bg-surface p-4">
            <p className="text-sm font-black text-content">Vendor rating &amp; profile</p>
            <p className="mt-1 text-xs text-muted">
              Shown as the &ldquo;Trust factor&rdquo; badge and the &ldquo;View all reviews&rdquo; link on the
              vendor&rsquo;s public page.
            </p>

            <div className="mt-4 grid grid-cols-1 gap-5 md:grid-cols-2">
              <Field
                label="Vendor rating (out of 5)"
                name="reviewRating"
                type="number"
                step="0.1"
                min="0"
                max="5"
                defaultValue={vendor?.reviewRating !== null && vendor?.reviewRating !== undefined ? String(vendor.reviewRating) : undefined}
                placeholder="4.8"
                hint="Leave empty if the vendor has no score yet."
              />
              <Field
                label="Trustpilot link"
                name="reviewsUrl"
                type="url"
                defaultValue={vendor?.reviewsUrl ?? undefined}
                placeholder="https://www.trustpilot.com/review/example.com"
                hint="Full URL to the vendor's public reviews profile."
              />
            </div>
          </div>

          {/* Individual reviews. */}
          <div className="rounded-card border border-line bg-surface p-4">
            <p className="text-sm font-black text-content">
              {editingReviewIndex !== null ? `Edit review ${editingReviewIndex + 1}` : 'Add a review'}
            </p>

            <div className="mt-4 grid grid-cols-1 gap-5 md:grid-cols-3">
              <Field
                label="Reviewer name"
                name="vendorReviewAuthor"
                value={reviewAuthor}
                onChange={(e) => setReviewAuthor(e.target.value)}
                placeholder="Nicole Belskis"
              />

              <div>
                <label htmlFor="vendorReviewRating" className="block text-sm font-semibold text-content">
                  Rating
                </label>
                <select
                  id="vendorReviewRating"
                  value={reviewRating}
                  onChange={(e) => setReviewRating(e.target.value)}
                  className="mt-1.5 w-full rounded-chip border border-line bg-surface px-3.5 py-2.5 text-sm text-content outline-none transition-colors"
                >
                  {REVIEW_RATING_OPTIONS.map((rating) => (
                    <option key={rating} value={rating}>
                      {rating} / 5
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label htmlFor="vendorReviewDate" className="block text-sm font-semibold text-content">
                  Date
                </label>
                <input
                  id="vendorReviewDate"
                  type="date"
                  value={reviewDate}
                  onChange={(e) => setReviewDate(e.target.value)}
                  className="mt-1.5 w-full rounded-chip border border-line bg-surface px-3.5 py-2.5 text-sm text-content outline-none transition-colors"
                />
                <p className="mt-1 text-xs text-muted">
                  {reviewDate ? `Shows as ${formatReviewDate(reviewDate)}` : 'Optional.'}
                </p>
              </div>
            </div>

            <TextArea
              label="Review message"
              name="vendorReviewBody"
              value={reviewInput}
              onChange={(e) => setReviewInput(e.target.value)}
              rows={4}
              placeholder="What the reviewer wrote, word for word."
            />

            <div className="mt-4 flex items-center justify-end gap-3">
              {editingReviewIndex !== null ? (
                <button
                  type="button"
                  onClick={resetReviewForm}
                  className="text-sm font-semibold text-muted hover:text-content"
                >
                  Cancel edit
                </button>
              ) : null}
              <button
                type="button"
                onClick={submitReview}
                disabled={!reviewAuthor.trim() || !reviewInput.trim()}
                className="rounded-chip bg-brand px-5 py-2.5 text-sm font-bold text-surface transition-colors hover:bg-brand-strong disabled:pointer-events-none disabled:opacity-50"
              >
                {editingReviewIndex !== null ? 'Save review' : 'Add review'}
              </button>
            </div>
          </div>

          <input type="hidden" name="vendorReviews" value={JSON.stringify(reviews)} />

          <div className="rounded-card border border-dashed border-line bg-surface p-4">
            <p className="text-[10px] font-bold uppercase tracking-wide text-faint">
              Reviews on the vendor page ({reviews.length})
            </p>

            {reviews.length === 0 ? (
              <p className="mt-2 text-sm text-muted">No reviews yet. Add one above.</p>
            ) : (
              <ol className="mt-3 space-y-2">
                {reviews.map((review, index) => (
                  <li
                    key={review.id ?? `${review.author}-${index}`}
                    className={`rounded-card border bg-surface-raised p-3 ${
                      editingReviewIndex === index ? 'border-brand' : 'border-line'
                    }`}
                  >
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div className="min-w-0">
                        <p className="flex flex-wrap items-center gap-2 text-sm font-bold text-content">
                          <span className="inline-flex h-5 w-5 items-center justify-center rounded-chip bg-brand-soft text-[10px] font-black text-brand-strong">
                            {index + 1}
                          </span>
                          {review.author}
                          <span className="inline-flex items-center gap-1.5">
                            <StarRating rating={review.rating} starClassName="h-3 w-3" />
                            <span className="text-xs font-bold text-muted">{review.rating}</span>
                          </span>
                        </p>
                        {review.reviewedAt ? (
                          <p className="mt-0.5 text-xs text-faint">{formatReviewDate(review.reviewedAt)}</p>
                        ) : null}
                      </div>

                      <div className="flex shrink-0 items-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => moveReview(index, -1)}
                          disabled={index === 0}
                          aria-label={`Move ${review.author}'s review up`}
                          className={REVIEW_ROW_BUTTON_CLASS}
                        >
                          <ChevronDownIcon className="h-3.5 w-3.5 rotate-180" />
                        </button>
                        <button
                          type="button"
                          onClick={() => moveReview(index, 1)}
                          disabled={index === reviews.length - 1}
                          aria-label={`Move ${review.author}'s review down`}
                          className={REVIEW_ROW_BUTTON_CLASS}
                        >
                          <ChevronDownIcon className="h-3.5 w-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => editReview(index)}
                          className="px-1 text-xs font-bold text-brand hover:text-brand/80"
                        >
                          Edit
                        </button>
                        <button
                          type="button"
                          onClick={() => removeReview(index)}
                          className="px-1 text-xs font-bold text-danger hover:text-danger/80"
                        >
                          Delete
                        </button>
                      </div>
                    </div>

                    <p className="mt-2 text-sm leading-relaxed text-muted">{review.body}</p>
                  </li>
                ))}
              </ol>
            )}
          </div>
        </div>
      </section>

      <input type="hidden" name="currentStep" value={stepIndex} />

      {state.error ? (
        <p role="alert" className="text-sm font-semibold text-danger">
          {state.error}
        </p>
      ) : null}
      {!state.error && state.savedAt ? (
        <p role="status" className="text-sm font-semibold text-ok">
          Changes saved.
        </p>
      ) : null}

      <div className="flex flex-wrap items-center justify-between gap-3 border-t border-line pt-5">
        <div className="flex flex-wrap items-center gap-3">
          <Link
            href="/admin/vendors"
            className="rounded-chip border border-line bg-surface px-5 py-2.5 text-sm font-bold text-content transition-colors hover:border-brand hover:bg-brand-soft hover:text-brand-strong"
          >
            Cancel
          </Link>
          {stepIndex > 0 ? (
            <button
              type="button"
              onClick={() => setStepIndex((current) => Math.max(0, current - 1))}
              className="rounded-chip border border-line bg-surface px-5 py-2.5 text-sm font-bold text-content transition-colors hover:border-brand hover:bg-brand-soft hover:text-brand-strong"
            >
              Back
            </button>
          ) : null}
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {!isLastStep ? (
            <button
              type="button"
              onClick={() => setStepIndex((current) => Math.min(STEP_LABELS.length - 1, current + 1))}
              className="rounded-chip border border-line bg-surface px-5 py-2.5 text-sm font-bold text-content transition-colors hover:border-brand hover:bg-brand-soft hover:text-brand-strong"
            >
              Next
            </button>
          ) : null}
          {/* Available on every step, not just the last, so progress can be saved without stepping through the rest of the form first. */}
          <button
            type="submit"
            disabled={pending}
            className="rounded-chip bg-brand px-5 py-2.5 text-sm font-bold text-white transition-colors hover:bg-brand-strong disabled:opacity-60"
          >
            {pending ? 'Saving…' : 'Save/Submit'}
          </button>
        </div>
      </div>
    </form>
  );
}

import { z } from 'zod';

/** All external data (scrapers, vendor APIs, route params) is validated here. */

export const slugSchema = z
  .string()
  .min(1)
  .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'slug must be lowercase kebab-case');

export const supplierTierSchema = z.enum(['elite', 'pro']);
export type SupplierTier = z.infer<typeof supplierTierSchema>;

/** Vendors report review counts as exact ("436") or bucketed ("100+"). */
export const reviewCountSchema = z.union([
  z.object({ kind: z.literal('exact'), value: z.number().int().nonnegative() }),
  z.object({ kind: z.literal('atLeast'), value: z.number().int().positive() }),
]);
export type ReviewCount = z.infer<typeof reviewCountSchema>;

/**
 * Shipping cost is genuinely heterogeneous across vendors: free, a flat fee, a
 * range, free-above-threshold, or unknown. Modelling it as a union keeps the
 * card honest instead of flattening everything into a lossy string.
 */
export const shippingCostSchema = z.discriminatedUnion('kind', [
  z.object({ kind: z.literal('free') }),
  z.object({ kind: z.literal('flat'), amount: z.number().int().nonnegative() }),
  z.object({
    kind: z.literal('range'),
    min: z.number().int().nonnegative(),
    max: z.number().int().nonnegative(),
  }),
  z.object({ kind: z.literal('freeUpTo'), max: z.number().int().nonnegative() }),
  z.object({ kind: z.literal('varies') }),
  z.object({ kind: z.literal('unknown') }),
]);
export type ShippingCost = z.infer<typeof shippingCostSchema>;

export const couponSchema = z.object({
  code: z.string().min(1),
  percentOff: z.number().int().positive().max(100),
  /** Shown to the user; never used to recompute a price we did not observe. */
  description: z.string().optional(),
});
export type Coupon = z.infer<typeof couponSchema>;

export const labTestSchema = z.enum([
  'identity',
  'purity',
  'impurities',
  'sterility',
  'endotoxins',
  'metals',
]);
export type LabTest = z.infer<typeof labTestSchema>;

export const labGradeSchema = z.enum(['A', 'B', 'C', 'D', 'E', 'pass']);
export type LabGrade = z.infer<typeof labGradeSchema>;

export const labReportSchema = z.object({
  labName: z.string().min(1),
  labUrl: z.string().url().nullable(),
  grade: labGradeSchema,
  /** Out of 10. */
  score: z.number().min(0).max(10),
  results: z.record(labTestSchema, z.enum(['pass', 'fail'])),
  reportUrl: z.string().url().nullable(),
  testedAt: z.string().datetime().nullable(),
});
export type LabReport = z.infer<typeof labReportSchema>;

export const supplierSchema = z.object({
  slug: slugSchema,
  name: z.string().min(1),
  logoUrl: z.string().nullable(),
  faviconUrl: z.string().nullable(),
  homepageUrl: z.string().url(),
  /** OUR affiliate link. Never another aggregator's. */
  affiliateUrl: z.string().url(),
  tier: supplierTierSchema.nullable(),
  /** Editorial trust score out of 5. Null when not yet assessed. */
  trustRating: z.number().min(0).max(5).nullable(),
  /** Aggregate lab score out of 10. Null when the vendor has no verified COAs. */
  labScore: z.number().min(0).max(10).nullable(),
  labVerified: z.boolean(),
  foundedYear: z.number().int().min(1900).max(2100).nullable(),
  reviewRating: z.number().min(0).max(5).nullable(),
  reviewCount: reviewCountSchema.nullable(),
  reviewsUrl: z.string().url().nullable(),
  shippingCost: shippingCostSchema,
  shippingSpeed: z.string().nullable(),
  paymentMethods: z.array(z.string().min(1)),
  coupon: couponSchema.nullable(),
  description: z.string().nullable(),
  hotline: z.string().nullable(),
  policyUrls: z.object({
    shipping: z.string().url().nullable(),
    returns: z.string().url().nullable(),
    privacy: z.string().url().nullable(),
    terms: z.string().url().nullable(),
  }),
  /** When our crawler last refreshed this vendor's catalogue. */
  inventoryRefreshedAt: z.string().datetime().nullable(),
});
export type Supplier = z.infer<typeof supplierSchema>;

export const productFormSchema = z.enum(['vial', 'capsule', 'spray', 'kit']);
export type ProductForm = z.infer<typeof productFormSchema>;

export const productSchema = z.object({
  slug: slugSchema,
  name: z.string().min(1),
  category: z.string().nullable(),
  summary: z.string().nullable(),
  aliases: z.array(z.string()),
});
export type Product = z.infer<typeof productSchema>;

export const currencySchema = z.enum(['USD', 'EUR', 'GBP', 'CAD', 'AUD']);

export const offerSchema = z.object({
  supplierSlug: slugSchema,
  productSlug: slugSchema,
  form: productFormSchema,
  /** Integer micrograms per vial. */
  vialSize: z.number().int().positive(),
  vialCount: z.number().int().positive(),
  /** Integer cents. */
  listPrice: z.number().int().positive(),
  salePrice: z.number().int().positive().nullable(),
  currency: currencySchema,
  inStock: z.boolean(),
  productUrl: z.string().url(),
  labReport: labReportSchema.nullable(),
  /** Required: a price with no observation time cannot be shown responsibly. */
  scrapedAt: z.string().datetime(),
});
export type Offer = z.infer<typeof offerSchema>;

export const supplierListSchema = z.array(supplierSchema);
export const productListSchema = z.array(productSchema);
export const offerListSchema = z.array(offerSchema);

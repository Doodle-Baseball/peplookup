import { z } from 'zod';

/** All external data (scrapers, vendor APIs, route params) is validated here. */

export const slugSchema = z
  .string()
  .min(1)
  .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'slug must be lowercase kebab-case');

export const supplierTierSchema = z.enum(['elite', 'pro']);
export type SupplierTier = z.infer<typeof supplierTierSchema>;

export const accessTypeSchema = z.enum(['ruo', 'legit_script', 'telehealth']);
export type AccessType = z.infer<typeof accessTypeSchema>;

export const coaVerificationLevelSchema = z.enum(['none', 'product_level', 'batch_level']);
export type CoaVerificationLevel = z.infer<typeof coaVerificationLevelSchema>;

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

/**
 * One individually-attributed review for a supplier (see
 * supabase/migrations/0011_supplier_reviews.sql). Distinct from the
 * `reviewRating`/`reviewCount` aggregate on the supplier itself: a vendor can
 * have a headline score without us holding any of the review text behind it.
 */
export const supplierReviewSchema = z.object({
  /** Row id when this came from the database. Absent for a review not yet saved. */
  id: z.string().optional(),
  author: z.string().min(1),
  /** 1–5 in half-point steps, so a vendor's 4.5 survives instead of rounding to 4 or 5. */
  rating: z
    .number()
    .min(1)
    .max(5)
    .refine((value) => Number.isInteger(value * 2), 'rating must be a whole or half point'),
  body: z.string().min(1),
  /** Calendar date the review was left (YYYY-MM-DD), not when it was imported. */
  reviewedAt: z.string().nullable(),
});
export type SupplierReview = z.infer<typeof supplierReviewSchema>;

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
  /** Vendor's operating country. Null until verified, never guessed from the TLD. */
  country: z.string().nullable(),
  /** Admin-controlled: whether this vendor is shown on the public site. */
  isActive: z.boolean(),
  /** Special/Featured vendor, pinned to the top of the public directory. */
  isFeatured: z.boolean().default(false),
  /** When this record was added to our system (not the vendor's founding date). */
  createdAt: z.string().datetime(),
  accessType: accessTypeSchema.nullable(),
  /** Countries the vendor ships to, distinct from `country`, its HQ. */
  supplyCountries: z.array(z.string()),
  coaVerificationLevel: coaVerificationLevelSchema.nullable(),
  /** Name of the third-party lab providing COAs, e.g. "Janoshik Analytical". */
  coaLabName: z.string().nullable(),
  /**
   * Domain registration date from a WHOIS lookup performed when the vendor
   * was saved. Null when the lookup failed or hasn't run yet, never guessed.
   */
  domainRegisteredAt: z.string().datetime().nullable(),
  /** Manual display order set in the admin. Null until placed; nulls sort last. */
  position: z.number().int().nullable().default(null),
});
export type Supplier = z.infer<typeof supplierSchema>;

export const productFormSchema = z.enum(['vial', 'capsule', 'spray', 'kit', 'pen', 'serum']);
export type ProductForm = z.infer<typeof productFormSchema>;

export const intakeTypeSchema = z.enum([
  'injections',
  'oral',
  'topical',
  'nasal',
  'sublingual',
]);
export type IntakeType = z.infer<typeof intakeTypeSchema>;

const benefitSchema = z.object({
  title: z.string().min(1),
  description: z.string().nullable(),
});
const evidenceSchema = z.object({
  title: z.string().min(1),
  body: z.string().nullable(),
  /** Source/citation link for this evidence item, if one has been added. */
  link: z.string().url().nullable(),
});
const interactionSchema = z.object({ pair: z.string().min(1), note: z.string().nullable() });
const qaSchema = z.object({ question: z.string().min(1), answer: z.string().min(1) });

/**
 * Structured research content shown on a compound's detail page, Benefits,
 * Dosage, Evidence, Interactions, FAQ. Every field is optional/nullable:
 * this is editorial content the admin fills in over time, not something we
 * can derive or default without fabricating claims about a compound. A null
 * section title means the page shows its built-in heading.
 */
export const researchSectionsSchema = z.object({
  benefitsTitle: z.string().nullable(),
  benefitsIntro: z.string().nullable(),
  benefits: z.array(benefitSchema),
  dosageTitle: z.string().nullable(),
  dosageIntro: z.string().nullable(),
  route: z.string().nullable(),
  exampleRange: z.string().nullable(),
  frequency: z.string().nullable(),
  timing: z.string().nullable(),
  evidenceTitle: z.string().nullable(),
  evidenceIntro: z.string().nullable(),
  evidence: z.array(evidenceSchema),
  interactionsTitle: z.string().nullable(),
  interactions: z.array(interactionSchema),
  faq: z.array(qaSchema),
});
export type ResearchSections = z.infer<typeof researchSectionsSchema>;

export const productSchema = z.object({
  slug: slugSchema,
  name: z.string().min(1),
  category: z.string().nullable(),
  summary: z.string().nullable(),
  aliases: z.array(z.string()),
  forms: z.array(productFormSchema),
  intakeTypes: z.array(intakeTypeSchema),
  typicalDose: z.string().nullable(),
  cycle: z.string().nullable(),
  storage: z.string().nullable(),
  /** Vendor-neutral reference photos for this compound. External URLs only, no upload storage is wired up. */
  images: z.array(z.string().url()),
  /** False for multi-ingredient stacks/blends (e.g. "CJC-1295 + Ipamorelin"). */
  isCompound: z.boolean(),
  description: z.string().nullable(),
  purposePills: z.array(z.string().min(1)),
  research: researchSectionsSchema,
  /** Vendor picked in the admin form's Vendor dropdown, if any, an association only, not an offer. */
  primarySupplierSlug: z.string().nullable(),
  /** Link to a certificate of analysis / third-party lab test for this compound, if one has been added. */
  coaUrl: z.string().nullable(),
  /** Manual display order set in the admin. Null until placed; nulls sort last. */
  position: z.number().int().nullable().default(null),
});
export type Product = z.infer<typeof productSchema>;

export const currencySchema = z.enum(['USD', 'EUR', 'GBP', 'CAD', 'AUD']);

export const offerSchema = z.object({
  /** Row id when this offer came from the database (admin-entered). Absent on static/demo seed data. */
  id: z.string().optional(),
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
  /** Vendor's own product photo for this listing. Null when unobserved, never a stock photo. */
  imageUrl: z.string().url().nullable(),
  labReport: labReportSchema.nullable(),
  /**
   * A plain link to a COA document with no grade/score attached, for when
   * an admin has the vendor's certificate but hasn't (or can't) score it.
   * `labReport` stays the source of truth once a real grade/score exists;
   * this is the lighter, honest fallback rather than a fabricated grade.
   * Optional (not just nullable) so existing offer objects built before
   * this field existed keep validating without every one being touched.
   */
  coaUrl: z.string().url().nullable().optional(),
  /** Required: a price with no observation time cannot be shown responsibly. */
  scrapedAt: z.string().datetime(),
});
export type Offer = z.infer<typeof offerSchema>;

export const supplierListSchema = z.array(supplierSchema);
export const productListSchema = z.array(productSchema);
export const offerListSchema = z.array(offerSchema);

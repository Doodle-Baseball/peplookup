import type { FaqItem } from '@/data/default-page-faqs';

/**
 * The text sections of a supplier page beyond the About box, editable from
 * /admin/seo: the intro under the H1, "Is {Name} legit?", the market price
 * section's heading and intro, and the FAQs.
 *
 * Until an admin saves something, each one shows exactly what the page built
 * from the supplier's own record, so nothing on a page changes until it is
 * edited. Pure and client-safe, so the admin editor and the tests can call it.
 */
export interface SupplierPageSections {
  /** The paragraph under the H1. */
  intro: string;
  legit: { title: string; body: string };
  /** The market price table's heading and the sentence above it. */
  market: { title: string; body: string };
  faqs: FaqItem[];
}

/** What an admin has saved. Null means "use the text the page builds itself". */
export interface SupplierPageSectionsOverride {
  intro: string | null;
  legitTitle: string | null;
  legitBody: string | null;
  marketTitle: string | null;
  marketBody: string | null;
  /** An empty array is a real choice: the page shows no FAQ section. */
  faqs: FaqItem[] | null;
}

export const EMPTY_SECTIONS_OVERRIDE: SupplierPageSectionsOverride = {
  intro: null,
  legitTitle: null,
  legitBody: null,
  marketTitle: null,
  marketBody: null,
  faqs: null,
};

/** Form field names for these sections in the /admin/seo dialog. */
export const SUPPLIER_SECTION_FIELDS = {
  intro: 'supplierSection_intro',
  legitTitle: 'supplierSection_legitTitle',
  legitBody: 'supplierSection_legitBody',
  marketTitle: 'supplierSection_marketTitle',
  marketBody: 'supplierSection_marketBody',
  faqs: 'supplierSection_faqs',
} as const;

export function defaultSupplierPageSections(input: {
  name: string;
  intro: string;
  legitSummary: string;
  faqs: readonly FaqItem[];
}): SupplierPageSections {
  const { name } = input;
  return {
    intro: input.intro,
    legit: { title: `Is ${name} legit?`, body: input.legitSummary },
    market: {
      title: `${name} vs market average prices`,
      body: `See how ${name}'s prices compare with the average market price for the exact same compound and vial size.`,
    },
    faqs: input.faqs.map((faq) => ({ question: faq.question, answer: faq.answer })),
  };
}

/** Saved text wins field by field; anything not saved falls back to the page's own text. */
export function resolveSupplierPageSections(
  defaults: SupplierPageSections,
  override: SupplierPageSectionsOverride | null,
): SupplierPageSections {
  if (!override) return defaults;
  return {
    intro: override.intro?.trim() || defaults.intro,
    legit: {
      title: override.legitTitle?.trim() || defaults.legit.title,
      body: override.legitBody?.trim() || defaults.legit.body,
    },
    market: {
      title: override.marketTitle?.trim() || defaults.market.title,
      body: override.marketBody?.trim() || defaults.market.body,
    },
    faqs: override.faqs ?? defaults.faqs,
  };
}

function sameFaqs(a: readonly FaqItem[], b: readonly FaqItem[]): boolean {
  return (
    a.length === b.length &&
    a.every((faq, index) => faq.question.trim() === b[index]!.question.trim() && faq.answer.trim() === b[index]!.answer.trim())
  );
}

/**
 * Turns submitted text into what gets stored: blank, or unchanged from the
 * page's own text, is saved as null so the section keeps tracking live data
 * (ratings, COA counts, coupons) instead of freezing today's wording.
 */
export function toSupplierPageSectionsOverride(
  submitted: SupplierPageSections,
  defaults: SupplierPageSections,
): SupplierPageSectionsOverride {
  const stored = (value: string, fallback: string): string | null => {
    const trimmed = value.trim();
    return trimmed === '' || trimmed === fallback.trim() ? null : trimmed;
  };
  const faqs = submitted.faqs
    .map((faq) => ({ question: faq.question.trim(), answer: faq.answer.trim() }))
    .filter((faq) => faq.question !== '' && faq.answer !== '');
  return {
    intro: stored(submitted.intro, defaults.intro),
    legitTitle: stored(submitted.legit.title, defaults.legit.title),
    legitBody: stored(submitted.legit.body, defaults.legit.body),
    marketTitle: stored(submitted.market.title, defaults.market.title),
    marketBody: stored(submitted.market.body, defaults.market.body),
    faqs: sameFaqs(faqs, defaults.faqs) ? null : faqs,
  };
}

export function isEmptySectionsOverride(override: SupplierPageSectionsOverride): boolean {
  return Object.values(override).every((value) => value === null);
}

import { formatReviewCount } from '@/lib/format';
import { ratingSourceLabel } from '@/lib/review-pages';
import { site } from '@/config/site';
import type { FaqItem } from '@/data/default-page-faqs';
import type { Supplier } from '@/lib/schema';

type LegitSupplier = Pick<
  Supplier,
  'name' | 'domainRegisteredAt' | 'reviewRating' | 'reviewCount' | 'reviewsUrl' | 'coaLabName'
>;

/** A store whose website is younger than this is called new. */
const NEW_STORE_MONTHS = 24;

function domainDate(supplier: Pick<Supplier, 'domainRegisteredAt'>): Date | null {
  if (!supplier.domainRegisteredAt) return null;
  const date = new Date(supplier.domainRegisteredAt);
  return Number.isNaN(date.getTime()) ? null : date;
}

/** "a third-party lab" for the generic label, otherwise the lab's own name. */
function labPhrase(coaLabName: string): string {
  return coaLabName.toLowerCase().startsWith('third-party') ? 'a third-party lab' : coaLabName;
}

/**
 * "Is {Name} legit?" in plain words, from the supplier's own record and the
 * COAs the page shows. States only what we hold: a fact we lack gets no
 * sentence, never a placeholder, and the text never passes a verdict.
 */
export function supplierLegitSummary(supplier: LegitSupplier, coaCount: number, now: Date = new Date()): string {
  const sentences: string[] = [];
  const registered = domainDate(supplier);
  if (registered) {
    const ageMonths =
      (now.getUTCFullYear() - registered.getUTCFullYear()) * 12 + (now.getUTCMonth() - registered.getUTCMonth());
    if (ageMonths < NEW_STORE_MONTHS) sentences.push(`${supplier.name} is a new store.`);
    const started = new Intl.DateTimeFormat('en-US', { month: 'long', year: 'numeric', timeZone: 'UTC' }).format(registered);
    sentences.push(`Its website started in ${started}.`);
  }
  if (supplier.reviewRating !== null) {
    const count = formatReviewCount(supplier.reviewCount);
    sentences.push(
      `On ${ratingSourceLabel(supplier.reviewsUrl)}, it has ${supplier.reviewRating.toFixed(1)} out of 5${count ? ` from ${count} reviews` : ''}.`,
    );
  }
  if (coaCount > 0) {
    sentences.push(`We link ${coaCount} of its lab ${coaCount === 1 ? 'report' : 'reports'} (COAs).`);
    if (supplier.coaLabName) sentences.push(`${supplier.name} says ${labPhrase(supplier.coaLabName)} tests them.`);
    sentences.push('Check that the lot number on the report matches your vial.');
  }
  return sentences.join(' ');
}

type FaqSupplier = Pick<Supplier, 'name' | 'country' | 'supplyCountries' | 'foundedYear'>;

/**
 * The FAQ set for the simplified supplier pages. Each answer is built from the
 * record and the COAs the page shows; a question we can't answer is left out.
 */
export function supplierFaqs(supplier: FaqSupplier, coaCount: number): FaqItem[] {
  const { name } = supplier;
  const country = supplier.country ?? (supplier.supplyCountries.length === 1 ? supplier.supplyCountries[0]! : null);
  const place = country === 'United States' ? 'the United States' : country;
  const faqs: FaqItem[] = [];
  if (place) {
    faqs.push({
      question: `Where is ${name} based?`,
      answer: `${name} is based in ${place}${supplier.foundedYear !== null ? ` and has been selling research peptides since ${supplier.foundedYear}` : ''}.`,
    });
  }
  faqs.push({
    question: `What products does ${name} offer?`,
    answer: `${name} offers a range of research peptides and laboratory compounds in different sizes and product forms.`,
  });
  if (coaCount > 0) {
    faqs.push({
      question: `Does ${name} provide Certificates of Analysis (COAs)?`,
      answer: `Yes. ${name} has COA reports available for listed products, with ${coaCount} ${coaCount === 1 ? 'report' : 'reports'} shown on its ${site.name} profile.`,
    });
  }
  return faqs;
}

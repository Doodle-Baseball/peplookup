import { formatReviewCount } from '@/lib/format';
import { ratingSourceLabel } from '@/lib/review-pages';
import { site } from '@/config/site';
import type { FaqItem } from '@/data/default-page-faqs';
import type { Supplier } from '@/lib/schema';

type LegitSupplier = Pick<Supplier, 'name' | 'reviewRating' | 'reviewCount' | 'reviewsUrl' | 'coaLabName'>;

/**
 * "Is {Name} legit?" in plain words, from the supplier's own record and the
 * COAs the page shows. States only what we hold: a fact we lack gets no
 * sentence, never a placeholder, and the text never passes a verdict.
 */
export function supplierLegitSummary(supplier: LegitSupplier, coaCount: number): string {
  const sentences: string[] = [];
  const hasRating = supplier.reviewRating !== null;
  if (supplier.reviewRating !== null) {
    const count = formatReviewCount(supplier.reviewCount);
    sentences.push(
      `${supplier.name} has received customer feedback on ${ratingSourceLabel(supplier.reviewsUrl)}, where it currently holds a ` +
        `${supplier.reviewRating.toFixed(1)} out of 5 rating${count ? ` from ${count} reviews` : ''}.`,
    );
  }
  if (coaCount > 0) {
    const reports = supplier.coaLabName?.toLowerCase().startsWith('third-party')
      ? 'published third-party laboratory reports'
      : 'published laboratory reports';
    sentences.push(`${hasRating ? 'The supplier also' : `${supplier.name}`} provides access to ${reports} through its COA library.`);
  }
  if (sentences.length === 0) return '';
  const reviewable = [coaCount > 0 ? 'the available documentation' : null, hasRating ? 'customer feedback' : null]
    .filter(Boolean)
    .join(' and ');
  sentences.push(`Visitors can review ${reviewable} before evaluating the company.`);
  if (hasRating) {
    sentences.push('Remember that customer ratings reflect individual experiences and do not independently confirm product quality.');
  }
  return sentences.join(' ');
}

/**
 * Shipping terms a supplier states, in our words, for the ones whose policy we
 * have read. A supplier missing here gets no shipping question.
 */
const SHIPPING_ANSWERS: Readonly<Record<string, string>> = {
  'nura-peptide':
    'Nura Peptide offers same-day shipping for eligible orders placed before 3:00 PM Eastern Time, Monday through Friday. ' +
    'Orders placed after the cutoff or on weekends and holidays are processed the next business day.',
};

/** Return terms, from the "Returns & Refunds" section of the supplier's own policy page. */
const RETURN_ANSWERS: Readonly<Record<string, string>> = {
  'nura-peptide':
    'Nura Peptide says unopened products may be eligible for return within 30 days, subject to its return and refund policy. ' +
    'Damaged or incorrect items must be reported within 48 hours of delivery. Approved refunds are processed after the returned ' +
    'products are received and inspected, so contact Nura Peptide customer support before starting a return.',
};

type FaqSupplier = Pick<Supplier, 'slug' | 'name' | 'coupon'>;

/**
 * The FAQ set for the simplified supplier pages. The discount answer is built
 * from the coupon on the record, so it can't quote a code or a percentage the
 * supplier no longer offers; a question we can't answer is left out.
 */
export function supplierFaqs(supplier: FaqSupplier): FaqItem[] {
  const { name, coupon } = supplier;
  const faqs: FaqItem[] = [];
  const shipping = SHIPPING_ANSWERS[supplier.slug];
  if (shipping) faqs.push({ question: `How quickly does ${name} ship orders?`, answer: shipping });
  if (coupon) {
    faqs.push({
      question: `Does ${name} offer a discount code?`,
      answer:
        `Yes. ${site.name} currently lists an exclusive ${coupon.percentOff}% discount for ${name}. Use the coupon code ` +
        `${coupon.code} at checkout to receive the advertised discount. Check that the discount appears before completing your order.`,
    });
  }
  const returns = RETURN_ANSWERS[supplier.slug];
  if (returns) faqs.push({ question: `What is ${name}'s return policy?`, answer: returns });
  return faqs;
}

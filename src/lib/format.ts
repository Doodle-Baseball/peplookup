import type { ReviewCount, ShippingCost } from './schema';
import { formatMoney } from './money';
import { cents } from './money';

/** Relative age of a price observation, e.g. "updated 2h ago". */
export function timeAgo(iso: string, now: Date = new Date()): string {
  const then = new Date(iso).getTime();
  if (Number.isNaN(then)) return 'unknown';
  const seconds = Math.max(0, Math.floor((now.getTime() - then) / 1000));
  if (seconds < 60) return 'just now';
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `${days}d ago`;
  const months = Math.floor(days / 30);
  return months < 12 ? `${months}mo ago` : `${Math.floor(months / 12)}y ago`;
}

/** Hours after which a price is shown as stale rather than served silently. */
export const STALE_AFTER_HOURS = 48;

export function isStale(iso: string, now: Date = new Date()): boolean {
  const then = new Date(iso).getTime();
  if (Number.isNaN(then)) return true;
  return now.getTime() - then > STALE_AFTER_HOURS * 3_600_000;
}

/**
 * A supplier's shipping note is stored as one semicolon-separated line
 * ("Same-day before 3 PM ET; USPS 2–3 business days; UPS 3–5 days"). Split it
 * into its steps, in the order written, each starting with a capital.
 */
export function shippingSteps(speed: string | null | undefined): string[] {
  if (!speed) return [];
  return speed
    .split(';')
    .map((step) => step.trim())
    .filter(Boolean)
    .map((step) => step.charAt(0).toUpperCase() + step.slice(1));
}

export function formatShipping(cost: ShippingCost): string {
  switch (cost.kind) {
    case 'free':
      return 'Free';
    case 'flat':
      return formatMoney(cents(cost.amount));
    case 'range':
      return `${formatMoney(cents(cost.min))} – ${formatMoney(cents(cost.max))}`;
    case 'freeUpTo':
      return `Free – ${formatMoney(cents(cost.max))}`;
    case 'varies':
      return 'Varies';
    case 'unknown':
      // Callers must check this case and omit the row rather than render an
      // empty string, never show a "Not listed" placeholder to the visitor.
      return '';
  }
}

export function formatReviewCount(count: ReviewCount | null): string | null {
  if (count === null) return null;
  return count.kind === 'atLeast' ? `${count.value}+` : String(count.value);
}

export function formatRating(rating: number | null): string {
  return rating === null ? 'N/A' : rating.toFixed(1);
}

/** Publish date for editorial content, e.g. "Jun 2, 2026". */
export function formatDate(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return 'unknown';
  return new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric', year: 'numeric', timeZone: 'UTC' }).format(d);
}

/**
 * Long form for review bylines, e.g. "January 28, 2026". Takes a plain
 * calendar date (YYYY-MM-DD) and pins it to UTC so the day never shifts for
 * readers west of Greenwich.
 */
export function formatReviewDate(date: string): string {
  const d = new Date(`${date}T00:00:00Z`);
  if (Number.isNaN(d.getTime())) return '';
  return new Intl.DateTimeFormat('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
    timeZone: 'UTC',
  }).format(d);
}

export function formatDateTime(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return 'unknown';
  return new Intl.DateTimeFormat('en-US', {
    month: '2-digit',
    day: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
    timeZone: 'UTC',
  }).format(d);
}

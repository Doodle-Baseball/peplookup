import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { parseReviewDate, parseVendorReviewsCsv, trustpilotDomain, vendorReviewsCsvTemplate } from '@/lib/review-import';

const SHEET = 'src/Final_vendor_reviews - peplookup_vendor_reviews.csv';

describe('parseReviewDate', () => {
  it('reads the long form the sheet uses', () => {
    expect(parseReviewDate('September 1, 2026')).toBe('2026-09-01');
    expect(parseReviewDate('January 28, 2026')).toBe('2026-01-28');
  });

  it('passes through an ISO date unchanged', () => {
    expect(parseReviewDate('2026-03-02')).toBe('2026-03-02');
  });

  it('returns null rather than guessing at an unreadable date', () => {
    expect(parseReviewDate('')).toBeNull();
    expect(parseReviewDate('last tuesday')).toBeNull();
    expect(parseReviewDate('31/12/2026')).toBeNull();
  });
});

describe('trustpilotDomain', () => {
  it('extracts the vendor domain from a profile URL', () => {
    expect(trustpilotDomain('https://www.trustpilot.com/review/rivnresearch.com')).toBe('rivnresearch.com');
    expect(trustpilotDomain('https://www.trustpilot.com/review/www.genx.bio?page=2')).toBe('genx.bio');
  });

  it('returns null when the URL is not a profile link', () => {
    expect(trustpilotDomain('https://www.trustpilot.com/')).toBeNull();
  });
});

describe('parseVendorReviewsCsv', () => {
  it('parses the supplied vendor sheet without losing rows', () => {
    const parsed = parseVendorReviewsCsv(readFileSync(SHEET, 'utf8'));
    expect(parsed.length).toBe(38);
    expect(parsed.reduce((n, v) => n + v.reviews.length, 0)).toBe(164);
    expect(parsed.every((v) => v.problems.length === 0)).toBe(true);
  });

  it('keeps low ratings rather than filtering to the positive ones', () => {
    const parsed = parseVendorReviewsCsv(readFileSync(SHEET, 'utf8'));
    const american = parsed.find((v) => v.vendorName === 'Americanpeptides');
    expect(american?.rating).toBe(3.4);
    expect(american?.reviews.map((r) => r.rating)).toEqual([5, 2, 5, 3, 1]);
  });

  it('locates columns by header name, not position', () => {
    const csv = [
      'TrustpilotLink,Vendor Name,1ReviewMsg,1ReviewName,1ReviewRating,1ReviewDate,Vendor Rating',
      'https://www.trustpilot.com/review/example.com,Example Co,Great service.,Jane,4.5,"March 2, 2026",4.2',
    ].join('\n');
    const [row] = parseVendorReviewsCsv(csv);
    expect(row?.vendorName).toBe('Example Co');
    expect(row?.rating).toBe(4.2);
    expect(row?.reviews[0]).toEqual({
      author: 'Jane',
      rating: 4.5,
      body: 'Great service.',
      reviewedAt: '2026-03-02',
    });
  });

  it('reports an unusable review instead of importing it half-formed', () => {
    const csv = [
      'Vendor Name,1ReviewName,1ReviewDate,1ReviewRating,1ReviewMsg',
      'Example Co,Jane,"March 2, 2026",9,Rating is out of range',
    ].join('\n');
    const [row] = parseVendorReviewsCsv(csv);
    expect(row?.reviews).toHaveLength(0);
    expect(row?.problems.join(' ')).toContain('invalid rating');
  });

  it('skips empty review slots without complaint', () => {
    const csv = [
      'Vendor Name,1ReviewName,1ReviewRating,1ReviewMsg,2ReviewName,2ReviewRating,2ReviewMsg',
      'Example Co,Jane,5,Good stuff,,,',
    ].join('\n');
    const [row] = parseVendorReviewsCsv(csv);
    expect(row?.reviews).toHaveLength(1);
    expect(row?.problems).toHaveLength(0);
  });

  it('ships a template the importer can read back', () => {
    const parsed = parseVendorReviewsCsv(vendorReviewsCsvTemplate());
    expect(parsed).toHaveLength(1);
    expect(parsed[0]?.reviews).toHaveLength(1);
    expect(parsed[0]?.problems).toHaveLength(0);
  });
});

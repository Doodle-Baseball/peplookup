import { describe, expect, it } from 'vitest';
import { parseClickSource, uninstallFeedbackSchema } from '../schema';
import { gaClientIdFromCookie } from '../ga4';
import { isDesktopChrome } from '@/components/extension/extension-banner';

describe('parseClickSource', () => {
  it('recognises the extension', () => {
    expect(parseClickSource('extension')).toBe('extension');
    expect(parseClickSource(' Extension ')).toBe('extension');
  });

  it('counts anything else as the website', () => {
    expect(parseClickSource(null)).toBe('website');
    expect(parseClickSource('newsletter')).toBe('website');
  });
});

describe('gaClientIdFromCookie', () => {
  it("reuses the visitor's GA client id", () => {
    expect(gaClientIdFromCookie('GA1.1.1234567890.1700000000')).toBe('1234567890.1700000000');
  });

  it('makes a fresh id without a usable cookie', () => {
    const id = gaClientIdFromCookie(undefined);
    expect(id).toMatch(/^[0-9a-f-]{36}$/);
    expect(gaClientIdFromCookie('garbage')).not.toBe('garbage');
  });
});

describe('uninstallFeedbackSchema', () => {
  it('accepts a reason, a note, or both', () => {
    expect(uninstallFeedbackSchema.safeParse({ reason: 'too_many_popups', details: null }).success).toBe(true);
    expect(uninstallFeedbackSchema.safeParse({ reason: null, details: 'Slow' }).success).toBe(true);
  });

  it('rejects an empty answer and an over-long note', () => {
    expect(uninstallFeedbackSchema.safeParse({ reason: null, details: null }).success).toBe(false);
    expect(uninstallFeedbackSchema.safeParse({ reason: 'other', details: 'x'.repeat(1001) }).success).toBe(false);
  });
});

describe('isDesktopChrome', () => {
  const CHROME_WINDOWS =
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Safari/537.36';

  it('trusts client hints when the browser sends them', () => {
    expect(isDesktopChrome(CHROME_WINDOWS, { mobile: false, brands: [{ brand: 'Google Chrome' }] })).toBe(true);
    expect(isDesktopChrome(CHROME_WINDOWS, { mobile: true, brands: [{ brand: 'Google Chrome' }] })).toBe(false);
    expect(isDesktopChrome(CHROME_WINDOWS, { mobile: false, brands: [{ brand: 'Microsoft Edge' }] })).toBe(false);
  });

  it.each([
    ['Safari', 'Mozilla/5.0 (Macintosh; Intel Mac OS X 14_0) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Safari/605.1.15'],
    ['Firefox', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:131.0) Gecko/20100101 Firefox/131.0'],
    ['Chrome on Android', 'Mozilla/5.0 (Linux; Android 14) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Mobile Safari/537.36'],
    ['Chrome on iPhone', 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) CriOS/130.0 Mobile/15E148 Safari/604.1'],
    ['Edge', `${CHROME_WINDOWS} Edg/130.0.0.0`],
  ])('hides the banner on %s', (_name, userAgent) => {
    expect(isDesktopChrome(userAgent, undefined)).toBe(false);
  });

  it('shows it on desktop Chrome without client hints', () => {
    expect(isDesktopChrome(CHROME_WINDOWS, undefined)).toBe(true);
  });
});

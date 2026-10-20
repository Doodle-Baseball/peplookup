import { describe, expect, it } from 'vitest';
import { isLikelyBot, isPrefetchRequest } from '../bots';

const CHROME =
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Safari/537.36';
const SAFARI_IPHONE =
  'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1';
const FIREFOX = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:131.0) Gecko/20100101 Firefox/131.0';

describe('isLikelyBot', () => {
  it.each([
    ['Googlebot', 'Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)'],
    ['Bingbot', 'Mozilla/5.0 (compatible; bingbot/2.0; +http://www.bing.com/bingbot.htm)'],
    ['AhrefsBot', 'Mozilla/5.0 (compatible; AhrefsBot/7.0; +http://ahrefs.com/robot/)'],
    ['Facebook previews', 'facebookexternalhit/1.1 (+http://www.facebook.com/externalhit_uatext.php)'],
    ['Slack previews', 'Slackbot-LinkExpanding 1.0 (+https://api.slack.com/robots)'],
    ['WhatsApp previews', 'WhatsApp/2.23.20.0'],
    ['GPTBot', 'Mozilla/5.0 AppleWebKit/537.36 (KHTML, like Gecko); compatible; GPTBot/1.2'],
    ['headless Chrome', CHROME.replace('Chrome/', 'HeadlessChrome/')],
    ['curl', 'curl/8.4.0'],
    ['Python requests', 'python-requests/2.31.0'],
    ['an empty user agent', ''],
    ['no user agent', null],
  ])('flags %s', (_name, userAgent) => {
    expect(isLikelyBot(userAgent)).toBe(true);
  });

  it.each([
    ['Chrome', CHROME],
    ['Safari on iPhone', SAFARI_IPHONE],
    ['Firefox', FIREFOX],
    ['Edge', `${CHROME} Edg/130.0.0.0`],
  ])('lets %s through', (_name, userAgent) => {
    expect(isLikelyBot(userAgent)).toBe(false);
  });
});

describe('isPrefetchRequest', () => {
  const headers = (entries: Record<string, string>) => new Headers(entries);

  it('spots Next.js router prefetches and browser speculative loads', () => {
    expect(isPrefetchRequest(headers({ 'next-router-prefetch': '1' }))).toBe(true);
    expect(isPrefetchRequest(headers({ rsc: '1' }))).toBe(true);
    expect(isPrefetchRequest(headers({ 'sec-purpose': 'prefetch;prerender' }))).toBe(true);
    expect(isPrefetchRequest(headers({ purpose: 'prefetch' }))).toBe(true);
  });

  it('treats an ordinary navigation as a click', () => {
    expect(isPrefetchRequest(headers({ accept: 'text/html' }))).toBe(false);
  });
});

import { z } from 'zod';

/**
 * Shared by the browser tracker and the API route, so both sides agree on what
 * counts as "leaving the site" and on how a destination is named.
 */

/** Our own registrable domain; links to it (or any subdomain) are not outbound. */
const OWN_DOMAIN = 'peplookup.com';

export const MAX_URL_LENGTH = 2048;
export const MAX_PATH_LENGTH = 512;

/** Lowercased host without a leading "www.", so example.com and www.example.com are one destination. */
export function normalizeHost(hostname: string): string {
  return hostname.trim().toLowerCase().replace(/^www\./, '');
}

export function isOwnHost(host: string): boolean {
  return host === OWN_DOMAIN || host.endsWith(`.${OWN_DOMAIN}`);
}

/**
 * The destination host of `href` when following it would leave this site, or
 * null for same-site links, non-web schemes (mailto:, tel:) and unparseable
 * input. `currentHostname` is the page's own hostname, which keeps localhost
 * and preview deployments from counting their own links as outbound.
 */
export function outboundHostOf(href: string, currentHostname: string): string | null {
  let url: URL;
  try {
    url = new URL(href);
  } catch {
    return null;
  }
  if (url.protocol !== 'http:' && url.protocol !== 'https:') return null;
  const host = normalizeHost(url.hostname);
  if (!host) return null;
  if (host === normalizeHost(currentHostname) || isOwnHost(host)) return null;
  return host;
}

/** Same-site redirect every vendor/product link on the site goes through (see src/app/go/route.ts). */
const REDIRECT_PATH = '/go';

/**
 * What following `href` would open on another website, as `{ url, host }`, or
 * null when it stays on this site. Vendor links are `/go?to=<vendor url>`, a
 * same-site address that redirects away, so those are resolved to the vendor
 * URL they point at: the click is credited to the vendor, not to our own /go.
 */
export function outboundTargetOf(href: string, currentHostname: string): { url: string; host: string } | null {
  let url: URL;
  try {
    url = new URL(href);
  } catch {
    return null;
  }
  const host = outboundHostOf(href, currentHostname);
  if (host) return { url: href, host };

  if (url.pathname !== REDIRECT_PATH || !isSameSite(url.hostname, currentHostname)) return null;
  const destination = url.searchParams.get('to');
  const destinationHost = destination ? outboundHostOf(destination, currentHostname) : null;
  return destination && destinationHost ? { url: destination, host: destinationHost } : null;
}

function isSameSite(hostname: string, currentHostname: string): boolean {
  const host = normalizeHost(hostname);
  return host === normalizeHost(currentHostname) || isOwnHost(host);
}

export const outboundClickPayloadSchema = z.object({
  url: z.string().max(MAX_URL_LENGTH),
  path: z.string().max(MAX_PATH_LENGTH).optional(),
});

export interface VendorHostEntry {
  slug: string;
  name: string;
  /** Homepage and affiliate URLs; either may be what a visitor's click goes to. */
  urls: readonly string[];
}

/** Maps each vendor's known hosts to that vendor so a click on any of its links is credited to it. */
export function buildVendorHostIndex(vendors: readonly VendorHostEntry[]): Map<string, { slug: string; name: string }> {
  const index = new Map<string, { slug: string; name: string }>();
  for (const vendor of vendors) {
    for (const raw of vendor.urls) {
      try {
        const host = normalizeHost(new URL(raw).hostname);
        // First vendor wins when two share a host, so attribution is stable.
        if (host && !index.has(host)) index.set(host, { slug: vendor.slug, name: vendor.name });
      } catch {
        // A malformed vendor URL just means that vendor can't be matched by it.
      }
    }
  }
  return index;
}

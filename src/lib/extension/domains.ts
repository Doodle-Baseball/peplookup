/**
 * Store domains as the Chrome extension matches them: a bare hostname, lower
 * case, without a scheme, path, port or leading "www.". The extension compares
 * the page's hostname against these, so anything else would never match.
 */

const HOSTNAME_PATTERN = /^(?=.{1,253}$)(?:[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?\.)+[a-z]{2,63}$/;

export type StoreDomainResult = { ok: true; domain: string } | { ok: false; error: string };

/**
 * Validates one admin-entered domain. A leading "www." is dropped rather than
 * rejected, since the extension treats both forms as the same store; a scheme,
 * slash or space is rejected so a pasted URL is fixed by hand, not guessed at.
 */
export function parseStoreDomain(input: string): StoreDomainResult {
  const value = input.trim().toLowerCase();
  if (!value) return { ok: false, error: 'Domain is empty.' };
  if (/^[a-z][a-z0-9+.-]*:/.test(value) || value.includes('//')) {
    return { ok: false, error: `"${input.trim()}" must not include http:// or https://.` };
  }
  if (value.includes('/')) return { ok: false, error: `"${input.trim()}" must not include a slash or a path.` };
  if (/\s/.test(value)) return { ok: false, error: `"${input.trim()}" must not include spaces.` };

  const domain = value.replace(/^www\./, '');
  if (!HOSTNAME_PATTERN.test(domain)) {
    return { ok: false, error: `"${input.trim()}" is not a valid domain, such as example.com.` };
  }
  return { ok: true, domain };
}

/** Every domain valid and unique, in the order entered, or the first problem found. */
export function parseStoreDomains(inputs: readonly string[]): { ok: true; domains: string[] } | { ok: false; error: string } {
  const domains: string[] = [];
  for (const input of inputs) {
    if (!input.trim()) continue;
    const result = parseStoreDomain(input);
    if (!result.ok) return result;
    if (!domains.includes(result.domain)) domains.push(result.domain);
  }
  return { ok: true, domains };
}

/** The store domain a website URL implies, used to pre-fill the first domain. Null when the URL can't be read. */
export function storeDomainFromUrl(url: string): string | null {
  try {
    const { protocol, hostname } = new URL(url.trim());
    if (protocol !== 'http:' && protocol !== 'https:') return null;
    const result = parseStoreDomain(hostname);
    return result.ok ? result.domain : null;
  } catch {
    return null;
  }
}

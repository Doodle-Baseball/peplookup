/**
 * How a link written in a guide's Markdown is rendered:
 * - internal: a path on this site, same tab
 * - sponsored: a supplier's site or a /go affiliate redirect, new tab, rel="sponsored nofollow"
 * - external: any other http(s) site, new tab, rel="noopener noreferrer"
 * - other: in-page anchors and mailto/tel links, rendered as they are
 */
export type GuideLinkKind = 'internal' | 'sponsored' | 'external' | 'other';

/** "www.example.com" and "example.com" are the same supplier. */
export function normaliseHost(host: string): string {
  return host.toLowerCase().replace(/^www\./, '');
}

/** Hosts from a list of URLs, normalised; unparseable entries are skipped. */
export function hostsFromUrls(urls: readonly (string | null | undefined)[]): Set<string> {
  const hosts = new Set<string>();
  for (const url of urls) {
    if (!url) continue;
    try {
      hosts.add(normaliseHost(new URL(url).host));
    } catch {
      // A malformed stored URL can't match a link anyway.
    }
  }
  return hosts;
}

function isGoRedirect(path: string): boolean {
  return path === '/go' || path.startsWith('/go?') || path.startsWith('/go/');
}

export function classifyGuideLink(href: string, sponsoredHosts: ReadonlySet<string>): GuideLinkKind {
  if (href.startsWith('/') && !href.startsWith('//')) return isGoRedirect(href) ? 'sponsored' : 'internal';
  if (!/^https?:\/\//i.test(href)) return 'other';
  try {
    return sponsoredHosts.has(normaliseHost(new URL(href).host)) ? 'sponsored' : 'external';
  } catch {
    return 'other';
  }
}

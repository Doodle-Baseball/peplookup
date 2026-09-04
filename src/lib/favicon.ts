/**
 * Resolves a vendor favicon without us fetching the vendor's site ourselves.
 * The request happens in the visitor's browser via next/image, so it works
 * whether or not our own crawler has reached the vendor yet.
 */
export function faviconUrl(homepageUrl: string, size = 128): string | null {
  try {
    const host = new URL(homepageUrl).hostname;
    return `https://www.google.com/s2/favicons?sz=${size}&domain=${host}`;
  } catch {
    return null;
  }
}

/**
 * The PepLookup Chrome extension's public listing. Fill these in as each one
 * exists; until then the pages show a "coming soon" state instead of a link
 * or picture that isn't real.
 */
export const chromeExtension = {
  name: 'PepLookup Coupon Codes',
  /** The Chrome Web Store listing. Null until the extension is published. */
  chromeWebStoreUrl: null as string | null,
  /**
   * Screenshots for /extension, served from /public/extension/. Empty until
   * the real captures are added, e.g.
   * { src: '/extension/screenshot-1.png', width: 1280, height: 800, alt: 'Code shown on a supplier checkout' }.
   */
  screenshots: [] as readonly { src: string; width: number; height: number; alt: string }[],
} as const;

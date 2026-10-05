/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Hides the dev-only floating route-info overlay ("Static route" badge etc.),
  // build tooling chrome, not part of the site itself. On Next 15.1 this is an
  // object; the bare `false` this used to be was rejected as invalid config and
  // silently ignored.
  devIndicators: { appIsrStatus: false, buildActivity: false },
  // Header Next adds to every response; nothing reads it.
  poweredByHeader: false,
  images: {
    // Supplier logos are fetched from vendor domains. Add each host explicitly.
    remotePatterns: [{ protocol: 'https', hostname: '**' }],
    // Optimised images are re-checked after 60s by default; these files change rarely, so keep them for 30 days.
    minimumCacheTTL: 60 * 60 * 24 * 30,
  },
  async redirects() {
    return [
      // Common misspelling of the community page's address.
      { source: '/comunity', destination: '/community', permanent: true },
      // The payment thanks page lives at /thanks; /tanks is a likely typo for it.
      { source: '/vendor-listing/thanks', destination: '/thanks', permanent: true },
      { source: '/tanks', destination: '/thanks', permanent: true },
      // The supplier listing page used to live at /partners and at /vendor-listing.
      { source: '/partners', destination: '/supplier-listing', permanent: true },
      { source: '/vendor-listing', destination: '/supplier-listing', permanent: true },
      // Vendor coupon and reviews pages live under /coupons and /reviews; these were their addresses at the site root first.
      { source: '/:slug-coupon-code', destination: '/coupons/:slug-coupon-code', permanent: true },
      { source: '/:slug-reviews', destination: '/reviews/:slug-reviews', permanent: true },
    ];
  },
  async headers() {
    // These pages read their filters from the query string, so Next renders them
    // per request and marks the response `no-store`. They hold no per-visitor
    // data, so letting the CDN reuse a render for a few minutes means repeat
    // visits and crawlers don't each run the server. Each distinct query string
    // is cached on its own, so every filter, sort and tab still renders correctly.
    const sharedPageCache = [
      { key: 'Cache-Control', value: 'public, s-maxage=300, stale-while-revalidate=600' },
    ];
    // Files served straight from /public are revalidated on every request by default; these change rarely.
    const staticAssetCache = [{ key: 'Cache-Control', value: 'public, max-age=2592000, stale-while-revalidate=86400' }];
    return [
      { source: '/products/:slug', headers: sharedPageCache },
      { source: '/suppliers', headers: sharedPageCache },
      { source: '/suppliers/:slug', headers: sharedPageCache },
      { source: '/lab-reports', headers: sharedPageCache },
      { source: '/coupons/:slug', headers: sharedPageCache },
      { source: '/reviews/:slug', headers: sharedPageCache },
      { source: '/compounds-images/:path*', headers: staticAssetCache },
      { source: '/favicon.png', headers: staticAssetCache },
    ];
  },
  experimental: {
    // The compound CSV import posts the whole file through a server action;
    // the 1 MB default is only a few hundred compounds with full content.
    serverActions: { bodySizeLimit: '5mb' },
  },
};

export default nextConfig;

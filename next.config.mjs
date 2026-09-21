/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Hides the dev-only floating route-info overlay ("Static route" badge etc.),
  // build tooling chrome, not part of the site itself. On Next 15.1 this is an
  // object; the bare `false` this used to be was rejected as invalid config and
  // silently ignored.
  devIndicators: { appIsrStatus: false, buildActivity: false },
  images: {
    // Supplier logos are fetched from vendor domains. Add each host explicitly.
    remotePatterns: [{ protocol: 'https', hostname: '**' }],
  },
  experimental: {
    // The compound CSV import posts the whole file through a server action;
    // the 1 MB default is only a few hundred compounds with full content.
    serverActions: { bodySizeLimit: '5mb' },
  },
};

export default nextConfig;

import type { Metadata } from 'next';
import './globals.css';
import { site } from '@/config/site';
import { SiteHeader } from '@/components/layout/site-header';
import { SiteFooter } from '@/components/layout/site-footer';
import { ResearchNotice } from '@/components/layout/research-notice';
import { PromoBar } from '@/components/layout/promo-bar';

export const metadata: Metadata = {
  title: { default: `${site.name} — Compare Peptide Prices by Cost per mg`, template: `%s | ${site.name}` },
  description: site.description,
  metadataBase: new URL(`https://${site.domain}`),
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="flex min-h-screen flex-col">
        <a
          href="#main"
          className="sr-only focus:not-sr-only focus:absolute focus:z-50 focus:m-2 focus:rounded-chip focus:bg-brand focus:px-4 focus:py-2 focus:text-white"
        >
          Skip to content
        </a>
        {/* No promotion is live until one is configured; the bar renders nothing. */}
        <PromoBar promotion={null} />
        <SiteHeader />
        <ResearchNotice />
        <main id="main" className="flex-1">
          {children}
        </main>
        <SiteFooter />
      </body>
    </html>
  );
}

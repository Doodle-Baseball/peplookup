import type { Metadata } from 'next';
import { SiteHeader } from '@/components/layout/site-header';
import { SiteFooter } from '@/components/layout/site-footer';
import { ResearchNotice } from '@/components/layout/research-notice';
import { NotFoundContent } from '@/components/layout/not-found-content';
import { site } from '@/config/site';

export const metadata: Metadata = {
  title: `Page not found | ${site.name}`,
  description: 'The page you were looking for could not be found.',
  // A 404 should never be indexed as a real destination.
  robots: { index: false, follow: true },
};

/**
 * Catches every URL that matches no route. It renders outside the marketing
 * layout, so the header and footer are mounted here rather than inherited,
 * the heavy vendor directory and newsletter below the fold are left off, since
 * this page exists to redirect a lost visitor, not to hold them.
 */
export default function NotFound() {
  return (
    <>
      <SiteHeader />
      <ResearchNotice />
      <main id="main" className="flex-1">
        <NotFoundContent />
      </main>
      <SiteFooter />
    </>
  );
}

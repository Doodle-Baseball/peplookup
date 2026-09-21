import type { Metadata } from 'next';
import { WatchlistContent } from '@/components/watchlist/watchlist-content';
import { staticSeoPage } from '@/config/seo-pages';
import { pageMetadata } from '@/lib/seo-defaults';
import { getSeoOverride, withSeo } from '@/lib/seo';

const PAGE = staticSeoPage('/watchlist');

export async function generateMetadata(): Promise<Metadata> {
  return withSeo(PAGE.path, pageMetadata(PAGE));
}

export default async function WatchlistPage() {
  const seo = await getSeoOverride(PAGE.path);
  return (
    <div className="mx-auto max-w-shell px-4 py-10">
      <header className="mb-8">
        <h1 className="text-3xl font-black text-content sm:text-4xl">{seo?.h1 || 'Your Watchlist'}</h1>
        <p className="mt-2 max-w-2xl text-sm text-muted">
          Suppliers and compounds you have saved for quick access. This list lives only in this
          browser: it is never sent to us and does not sync across devices.
        </p>
      </header>

      <WatchlistContent />
    </div>
  );
}

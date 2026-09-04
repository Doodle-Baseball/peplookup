import type { Metadata } from 'next';
import { WatchlistContent } from '@/components/watchlist/watchlist-content';

export const metadata: Metadata = {
  title: 'Watchlist — Track Your Saved Suppliers',
  description: 'Suppliers you have saved for quick access, stored privately on this device.',
  alternates: { canonical: '/watchlist' },
};

export default function WatchlistPage() {
  return (
    <div className="mx-auto max-w-shell px-4 py-10">
      <header className="mb-8">
        <h1 className="text-3xl font-black text-content sm:text-4xl">Your Watchlist</h1>
        <p className="mt-2 max-w-2xl text-sm text-muted">
          Suppliers you have saved for quick access. This list lives only in this browser — it is
          never sent to us and does not sync across devices.
        </p>
      </header>

      <WatchlistContent />
    </div>
  );
}

import type { Metadata } from 'next';
import { LoadingPreview } from './loading-preview';

export const metadata: Metadata = { title: 'Loading preview', robots: { index: false, follow: false } };

export default function LoadPage() {
  return (
    <main className="flex min-h-screen items-end justify-center bg-surface pb-8">
      <p className="text-xs font-semibold text-faint">Loading screen preview, replays every few seconds.</p>
      <LoadingPreview />
    </main>
  );
}

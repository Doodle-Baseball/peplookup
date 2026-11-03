import type { Metadata } from 'next';
import { LoadingPreview } from './loading-preview';
import { privatePageRobots } from '@/lib/seo/indexing';

export const metadata: Metadata = { title: 'Loading preview', robots: privatePageRobots('/load') };

export default function LoadPage() {
  return (
    <main className="flex min-h-screen items-end justify-center bg-surface pb-8">
      <p className="text-xs font-semibold text-faint">Loading screen preview, replays every few seconds.</p>
      <LoadingPreview />
    </main>
  );
}

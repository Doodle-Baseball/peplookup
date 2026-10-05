import type { Metadata } from 'next';
import { AdminPageHeader } from '@/components/admin/page-header';
import { TrafficDashboard } from '@/components/admin/traffic-dashboard';
import type { TrafficSnapshot } from '@/lib/traffic/snapshot';
import { getTrafficSnapshot } from '@/lib/traffic/store';

export const metadata: Metadata = { title: 'Traffic | Admin', robots: { index: false, follow: false } };

// Clicks arrive independently of any page render.
export const dynamic = 'force-dynamic';

export default async function AdminTrafficPage() {
  let initial: TrafficSnapshot | null = null;
  let loadError: string | null = null;
  try {
    initial = await getTrafficSnapshot('all');
  } catch (error) {
    loadError = error instanceof Error ? error.message : 'Traffic could not be loaded.';
  }

  return (
    <>
      <AdminPageHeader title="Traffic" />
      <div className="px-4 py-6 sm:px-8 sm:py-8">
        <TrafficDashboard initial={initial} initialError={loadError} />
      </div>
    </>
  );
}

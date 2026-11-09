import type { ReactNode } from 'react';
import { loadCouponPageOrExit } from '@/lib/coupon-page-route';

/**
 * Resolves the coupon page (or its redirect, or a 404) before anything
 * streams. This layout sits outside the route's loading state, so search
 * engines get the real status instead of a 200 for a page that isn't there.
 */
export default async function CouponPageLayout({
  children,
  params,
}: {
  children: ReactNode;
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  await loadCouponPageOrExit(slug);
  return children;
}

import type { ReactNode } from 'react';
import { notFound } from 'next/navigation';
import { getSupplier } from '@/lib/repository';

/**
 * Checks the supplier exists before anything streams. This layout sits outside
 * the route's loading state, so an unknown slug gets a real 404 status rather
 * than a 200 "not found" page (a soft 404 to search engines). Renamed slugs
 * never reach here: middleware has already sent them on with a 301.
 */
export default async function SupplierLayout({
  children,
  params,
}: {
  children: ReactNode;
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  if (!(await getSupplier(slug))) notFound();
  return children;
}

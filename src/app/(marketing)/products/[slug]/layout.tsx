import type { ReactNode } from 'react';
import { notFound } from 'next/navigation';
import { getProduct } from '@/lib/repository';

/**
 * Checks the compound exists before anything streams. This layout sits outside
 * the route's loading state, so an unknown slug gets a real 404 status rather
 * than a 200 "not found" page (a soft 404 to search engines).
 */
export default async function ProductLayout({
  children,
  params,
}: {
  children: ReactNode;
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  if (!(await getProduct(slug))) notFound();
  return children;
}

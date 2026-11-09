import type { ReactNode } from 'react';
import { notFound } from 'next/navigation';
import { getGuideBySlug } from '@/lib/repository';

/**
 * Checks the guide exists before anything streams. This layout sits outside
 * the route's loading state, so an unknown or removed guide gets a real 404
 * status rather than a 200 "not found" page (a soft 404 to search engines).
 */
export default async function GuideLayout({
  children,
  params,
}: {
  children: ReactNode;
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  if (!(await getGuideBySlug(slug))) notFound();
  return children;
}

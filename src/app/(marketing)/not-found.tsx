import { NotFoundContent } from '@/components/layout/not-found-content';

/**
 * Handles `notFound()` thrown by a page inside the marketing group, an unknown
 * supplier, product or guide slug. The header and footer come from the group's
 * own layout, so only the body is rendered here.
 */
export default function MarketingNotFound() {
  return <NotFoundContent />;
}

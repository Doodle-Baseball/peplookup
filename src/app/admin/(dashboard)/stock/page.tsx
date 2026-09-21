import type { Metadata } from 'next';
import { ComingSoonPage } from '@/components/admin/coming-soon';

export const metadata: Metadata = { title: 'Stock | Admin', robots: { index: false, follow: false } };

export default function AdminStockPage() {
  return (
    <ComingSoonPage
      title="Stock"
      description="Editing vendor offers (price, vial size, stock status) from here is planned next. Offers currently come from the crawler."
    />
  );
}

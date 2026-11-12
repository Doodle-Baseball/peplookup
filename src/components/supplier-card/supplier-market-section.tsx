import type { ReactNode } from 'react';
import { cn } from '@/lib/cn';
import type { SupplierMarketRow } from '@/lib/supplier-market-rows';
import { parseMarketSort } from '@/lib/supplier-market-sort';
import { SupplierMarketTable } from '@/components/supplier-card/supplier-market-table';

/** "{Name} vs other suppliers": the supplier's vial prices against other suppliers' vials of the exact same size. */
export function SupplierMarketSection({
  title,
  supplierName,
  rows,
  couponCode,
  sortParam,
  className,
}: {
  title: ReactNode;
  supplierName: string;
  rows: readonly SupplierMarketRow[];
  couponCode: string | null;
  sortParam: string | undefined;
  className?: string;
}) {
  if (rows.length === 0) return null;

  return (
    <section
      id="vendor-compare"
      aria-labelledby="vendor-compare-heading"
      className={cn(
        'reveal min-w-0 scroll-mt-24 rounded-panel border border-line bg-surface-raised p-5 shadow-card transition-shadow duration-300 hover:shadow-lift sm:p-8',
        className,
      )}
    >
      <h2 id="vendor-compare-heading" className="text-2xl font-black leading-tight text-content break-words sm:text-3xl">
        {title}
      </h2>
      <p className="mt-2 max-w-3xl text-sm leading-6 text-muted sm:text-base">
        See how {supplierName}&apos;s prices compare with the average market price for the exact same compound and vial
        size.
        {couponCode ? ` Prices are shown before applying the ${couponCode} discount.` : null}
      </p>
      <SupplierMarketTable supplierName={supplierName} rows={rows} initialSort={parseMarketSort(sortParam)} />
    </section>
  );
}

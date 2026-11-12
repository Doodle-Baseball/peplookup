'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { cn } from '@/lib/cn';
import { cents, formatMoney } from '@/lib/money';
import { MARKET_SORT_PARAM, type MarketSort, type MarketSortDirection, type MarketSortKey } from '@/lib/supplier-market-sort';
import type { SupplierMarketRow } from '@/lib/supplier-market-rows';
import { ArrowRightIcon } from '@/components/icons/icons';

/** Rows shown before "See all". */
const COLLAPSED_ROW_COUNT = 5;

function compareRows(a: SupplierMarketRow, b: SupplierMarketRow, key: MarketSortKey): number {
  switch (key) {
    case 'compound':
      return a.productName.localeCompare(b.productName);
    case 'size':
      return a.vialMcg - b.vialMcg;
    case 'price':
      return a.price - b.price;
    case 'market':
      return a.othersAveragePrice - b.othersAveragePrice;
  }
}

function SortArrows({ direction }: { direction: MarketSortDirection | null }) {
  return (
    <svg aria-hidden="true" viewBox="0 0 16 16" className="h-3.5 w-3.5 shrink-0" fill="none" stroke="currentColor" strokeWidth={1.5}>
      {direction !== 'desc' ? <path d="M5 13V3m0 0L2.5 5.5M5 3l2.5 2.5" strokeLinecap="round" strokeLinejoin="round" /> : null}
      {direction !== 'asc' ? <path d="M11 3v10m0 0l-2.5-2.5M11 13l2.5-2.5" strokeLinecap="round" strokeLinejoin="round" /> : null}
    </svg>
  );
}

export function SupplierMarketTable({
  supplierName,
  rows,
  initialSort,
}: {
  supplierName: string;
  /** Most-wanted compounds first; that order stands until a column is sorted. */
  rows: readonly SupplierMarketRow[];
  initialSort: MarketSort | null;
}) {
  const [sort, setSort] = useState<MarketSort | null>(initialSort);
  const [isExpanded, setIsExpanded] = useState(false);
  const sortKey = sort?.key ?? null;
  const sortDirection = sort?.direction ?? 'asc';

  const columns: { key: MarketSortKey; label: string; align: 'left' | 'right' }[] = [
    { key: 'compound', label: 'Compound', align: 'left' },
    { key: 'size', label: 'Vial', align: 'left' },
    { key: 'price', label: supplierName, align: 'right' },
    { key: 'market', label: 'Avg market price', align: 'right' },
  ];

  const sortedRows = useMemo(() => {
    if (sort === null) return rows;
    const factor = sort.direction === 'asc' ? 1 : -1;
    return [...rows].sort(
      (a, b) => factor * compareRows(a, b, sort.key) || a.productName.localeCompare(b.productName),
    );
  }, [rows, sort]);
  const visibleRows = isExpanded ? sortedRows : sortedRows.slice(0, COLLAPSED_ROW_COUNT);

  function sortBy(key: MarketSortKey) {
    const direction: MarketSortDirection = key === sortKey && sortDirection === 'asc' ? 'desc' : 'asc';
    setSort({ key, direction });
    // Kept in the URL without a server round trip, so the sorted table can be shared.
    const url = new URL(window.location.href);
    url.searchParams.set(MARKET_SORT_PARAM, `${key}-${direction}`);
    window.history.replaceState(window.history.state, '', url);
  }

  return (
    <>
      <div className="mt-6 overflow-x-auto rounded-card border border-line bg-surface shadow-card">
        <table className="w-full border-collapse text-sm">
          <thead className="border-b border-line bg-accent-tint">
            <tr>
              {columns.map((column) => {
                const isActive = column.key === sortKey;
                return (
                  <th
                    key={column.key}
                    scope="col"
                    aria-sort={isActive ? (sortDirection === 'asc' ? 'ascending' : 'descending') : 'none'}
                    className={cn('whitespace-nowrap px-3 py-3 sm:px-4', column.align === 'right' ? 'text-right' : 'text-left')}
                  >
                    <button
                      type="button"
                      onClick={() => sortBy(column.key)}
                      className={cn(
                        'inline-flex items-center gap-1.5 rounded-chip font-mono text-micro font-bold uppercase tracking-wide transition-colors hover:text-accent-strong focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent',
                        column.align === 'right' && 'flex-row-reverse',
                        isActive ? 'text-content' : 'text-accent-strong',
                      )}
                    >
                      {column.label}
                      <SortArrows direction={isActive ? sortDirection : null} />
                    </button>
                  </th>
                );
              })}
              <th scope="col" className="px-3 py-3 sm:px-4">
                <span className="sr-only">Compare</span>
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-line">
            {visibleRows.map((row) => (
              <tr key={row.productSlug} className="group/row transition-colors duration-200 hover:bg-accent-tint/40">
                <th scope="row" className="px-3 py-3.5 text-left font-semibold text-content sm:px-4">
                  {row.productName}
                </th>
                <td className="whitespace-nowrap px-3 py-3.5 sm:px-4">
                  <span className="inline-flex rounded-pill border border-line bg-surface-raised px-2.5 py-0.5 font-mono text-xs font-bold text-content">
                    {row.sizeLabel}
                  </span>
                </td>
                <td className="whitespace-nowrap px-3 py-3.5 text-right font-mono font-bold text-content sm:px-4">
                  {formatMoney(row.price, row.currency)}
                </td>
                <td className="whitespace-nowrap px-3 py-3.5 text-right font-mono text-content sm:px-4">
                  {formatMoney(cents(Math.round(row.othersAveragePrice)), row.currency)}
                </td>
                <td className="whitespace-nowrap px-3 py-3.5 text-right sm:px-4">
                  <Link
                    href={`/product/${row.productSlug}`}
                    aria-label={`Compare ${row.productName} prices`}
                    className="inline-flex items-center gap-1 font-bold text-accent-strong transition-colors hover:text-accent"
                  >
                    Compare
                    <ArrowRightIcon className="h-3.5 w-3.5 transition-transform duration-200 group-hover/row:translate-x-0.5" />
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {rows.length > COLLAPSED_ROW_COUNT ? (
        <button
          type="button"
          onClick={() => setIsExpanded((expanded) => !expanded)}
          aria-expanded={isExpanded}
          className="group/all mt-5 inline-flex items-center gap-1.5 rounded-chip text-sm font-bold text-accent-strong transition-colors hover:text-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
        >
          {isExpanded ? 'Show fewer' : `See all ${rows.length} ${supplierName} prices`}
          <ArrowRightIcon
            className={cn(
              'h-4 w-4 transition-transform duration-200',
              isExpanded ? '-rotate-90' : 'rotate-90 group-hover/all:translate-y-0.5',
            )}
          />
        </button>
      ) : null}
    </>
  );
}

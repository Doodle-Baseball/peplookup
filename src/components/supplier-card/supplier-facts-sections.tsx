import type { ReactNode } from 'react';
import { cn } from '@/lib/cn';
import { formatMoney, formatPerMg } from '@/lib/money';
import { ordinal, type CouponPriceRow, type SupplierFacts } from '@/lib/supplier-facts';

/** Same panel as the supplier page's content boxes. */
const PANEL_CLASS = 'rounded-panel border border-line bg-surface-raised shadow-card';
const TH_CLASS = 'whitespace-nowrap px-4 py-3 text-left font-mono text-micro font-bold uppercase tracking-wide text-accent-strong';
const TD_CLASS = 'whitespace-nowrap px-4 py-3 text-sm text-content';

function rankText(rank: number, supplierCount: number): string {
  return `${ordinal(rank)} of ${supplierCount}`;
}

/**
 * "At a glance": one row of the facts true only for this supplier. A column
 * whose fact we don't hold is left out, never shown as zero or a dash.
 */
export function SupplierGlanceTable({ facts, className }: { facts: SupplierFacts; className?: string }) {
  const columns: { label: string; value: string }[] = [
    ...(facts.listingCount > 0 ? [{ label: 'Products', value: String(facts.listingCount) }] : []),
    ...(facts.compoundCount > 0 ? [{ label: 'Compounds', value: String(facts.compoundCount) }] : []),
    ...(facts.coaListingCount > 0
      ? [
          {
            label: 'COA coverage',
            value: `${facts.coaListingCount} of ${facts.listingCount} (${Math.round((facts.coaListingCount / facts.listingCount) * 100)}%)`,
          },
        ]
      : []),
    ...(facts.bestRanks.length > 0
      ? [
          {
            label: 'Best price ranks',
            value: facts.bestRanks
              .map((standing) => `${rankText(standing.rank, standing.supplierCount)} for ${standing.productName}`)
              .join(', '),
          },
        ]
      : []),
    ...(facts.coupon ? [{ label: 'Code', value: `${facts.coupon.code}, ${facts.coupon.percentOff}% off` }] : []),
  ];
  if (columns.length === 0) return null;

  return (
    <section aria-labelledby="glance-heading" className={cn(PANEL_CLASS, 'overflow-hidden', className)}>
      <h2 id="glance-heading" className="border-b border-line px-5 py-4 text-lg font-black text-content sm:px-6">
        {facts.name} at a glance
      </h2>
      <div className="overflow-x-auto">
        <table className="w-full border-collapse">
          <thead className="bg-accent-tint">
            <tr>
              {columns.map((column) => (
                <th key={column.label} scope="col" className={TH_CLASS}>
                  {column.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            <tr>
              {columns.map((column) => (
                <td key={column.label} className={cn(TD_CLASS, 'font-bold')}>
                  {column.value}
                </td>
              ))}
            </tr>
          </tbody>
        </table>
      </div>
    </section>
  );
}

/**
 * "{Name} vs other suppliers" as numbers: for its five main compounds, its
 * cost per mg against the cheapest supplier and the median of every supplier
 * selling it. Only compounds at least two suppliers sell are compared.
 */
export function SupplierPriceComparison({
  facts,
  title,
  className,
  intro,
  ownLabel = facts.name,
  footer,
}: {
  facts: SupplierFacts;
  title: string;
  className?: string;
  /** Replaces the one-line description under the heading. */
  intro?: ReactNode;
  /** How the supplier's own columns are named ("Their $/mg"); the supplier's name by default. */
  ownLabel?: string;
  footer?: ReactNode;
}) {
  const rows = facts.standings.filter((standing) => standing.supplierCount >= 2).slice(0, 5);
  if (rows.length === 0) return null;

  return (
    <section aria-labelledby="vendor-compare-heading" className={cn(PANEL_CLASS, 'reveal overflow-hidden', className)}>
      <div className="px-5 pt-5 sm:px-8 sm:pt-8">
        <p className="eyebrow">Comparison</p>
        <h2 id="vendor-compare-heading" className="mt-3 text-2xl font-black leading-tight text-content break-words sm:text-3xl">
          {title}
        </h2>
        {intro ?? (
          <p className="mt-2 text-sm text-muted">
            In-stock prices per mg, compared with every active supplier that lists the same compound.
          </p>
        )}
      </div>
      <div className="mt-5 overflow-x-auto">
        <table className="w-full border-collapse">
          <thead className="border-y border-line bg-accent-tint">
            <tr>
              <th scope="col" className={TH_CLASS}>Compound</th>
              <th scope="col" className={TH_CLASS}>{ownLabel} $/mg</th>
              <th scope="col" className={TH_CLASS}>Cheapest $/mg (supplier)</th>
              <th scope="col" className={TH_CLASS}>Median $/mg</th>
              <th scope="col" className={TH_CLASS}>{ownLabel} rank</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-line">
            {rows.map((row) => (
              <tr key={row.productSlug}>
                <th scope="row" className={cn(TD_CLASS, 'text-left font-bold')}>
                  {row.productName}
                </th>
                <td className={TD_CLASS}>{formatPerMg(row.ownPerMg, row.currency)}</td>
                <td className={TD_CLASS}>
                  {formatPerMg(row.cheapest.perMg, row.currency)} ({row.cheapest.supplierName})
                </td>
                <td className={TD_CLASS}>{formatPerMg(row.medianPerMg, row.currency)}</td>
                <td className={cn(TD_CLASS, 'font-bold')}>{rankText(row.rank, row.supplierCount)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {footer}
    </section>
  );
}

/** "Prices after the code" on a coupon page: the code's effect on real listings, and where that lands. */
export function CouponPriceTable({
  supplierName,
  percentOff,
  rows,
  className,
}: {
  supplierName: string;
  percentOff: number;
  rows: readonly CouponPriceRow[];
  className?: string;
}) {
  if (rows.length === 0) return null;

  return (
    <section aria-labelledby="after-code-heading" className={cn(PANEL_CLASS, 'reveal overflow-hidden', className)}>
      <div className="px-5 pt-5 sm:px-6 sm:pt-6">
        <p className="eyebrow">With the code</p>
        <h2 id="after-code-heading" className="mt-2 text-2xl font-black text-content sm:text-3xl">
          {supplierName} prices <span className="text-accent">after the code</span>
        </h2>
        <p className="mt-2 text-sm text-muted">
          Each compound&rsquo;s cheapest in-stock listing with no sale price of its own, with {percentOff}% off. The rank
          compares that price with every other active supplier&rsquo;s listed price.
        </p>
      </div>
      <div className="mt-5 overflow-x-auto">
        <table className="w-full border-collapse">
          <thead className="border-y border-line bg-accent-tint">
            <tr>
              <th scope="col" className={TH_CLASS}>Compound</th>
              <th scope="col" className={TH_CLASS}>Price</th>
              <th scope="col" className={TH_CLASS}>Price after {percentOff}% off</th>
              <th scope="col" className={TH_CLASS}>$/mg after code</th>
              <th scope="col" className={TH_CLASS}>Rank vs all suppliers</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-line">
            {rows.map((row) => (
              <tr key={`${row.productName}-${row.size}`}>
                <th scope="row" className={cn(TD_CLASS, 'text-left font-bold')}>
                  {row.productName} <span className="font-normal text-muted">{row.size}</span>
                </th>
                <td className={TD_CLASS}>{formatMoney(row.price, row.currency)}</td>
                <td className={cn(TD_CLASS, 'font-bold text-accent-strong')}>{formatMoney(row.priceAfterCode, row.currency)}</td>
                <td className={TD_CLASS}>{formatPerMg(row.perMgAfterCode, row.currency)}</td>
                <td className={cn(TD_CLASS, 'font-bold')}>{rankText(row.rank, row.supplierCount)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}

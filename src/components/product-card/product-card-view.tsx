'use client';

import { useMemo, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import type { ProductCardData, ProductCardRow } from '@/lib/product-summary';
import { formatMoney, formatPerMg, cents } from '@/lib/money';
import { ShareButton } from '@/components/ui/share-button';
import { FavoriteButton } from '@/components/supplier-card/favorite-button';
import { ProductInfoModal } from '@/components/product-card/product-info-modal';
import { CopyCode } from '@/components/ui/copy-code';
import { site } from '@/config/site';
import type { ProductForm } from '@/lib/schema';
import { ChevronRightIcon, ExternalIcon, FlaskIcon, StarIcon } from '@/components/icons/icons';
import { splitCategories } from '@/lib/categories';
import { CARD_ROW_LIMIT as ROW_LIMIT, rowCountKey } from '@/lib/product-filters';

const FORM_LABELS: Record<ProductForm, string> = {
  vial: 'Vial',
  capsule: 'Capsule',
  spray: 'Spray',
  kit: 'Kit',
  pen: 'Pen',
  serum: 'Serum',
};

const DISPLAY_FORMS: ProductForm[] = ['vial', 'capsule', 'spray'];
/** Forms few compounds are sold in; their tabs only show when this compound has such listings. */
const OCCASIONAL_FORMS: ProductForm[] = ['pen', 'serum'];
const DOSAGE_OPTIONS = {
  vial: ['2 mg', '5 mg', '6 mg', '10 mg', '15 mg', '20 mg', '30 mg', '40 mg', '50 mg', '100 mg'],
  capsule: ['250 mcg', '500 mcg', '1 mg', '2 mg', '2.5 mg', '5 mg', '10 mg', '20 mg', '30 mg', '50 mg'],
  spray: ['1 mg', '2 mg', '5 mg', '10 mg', '15 mg', '20 mg', '30 mg', '50 mg', '15 mL', '30 mL'],
} as const;

export function ProductCardView({ data, view = 'total' }: { data: ProductCardData; view?: 'total' | 'permg' }) {
  // Few compounds are sold as pens or serums, so always-on tabs for them would be empty on most cards.
  const availableForms: ProductForm[] = [
    ...DISPLAY_FORMS,
    ...OCCASIONAL_FORMS.filter((form) => data.rows.some((r) => r.form === form)),
  ];
  const [selectedForm, setSelectedForm] = useState<ProductForm | null>(availableForms[0] ?? null);
  const rowsForForm = useMemo(
    () => data.rows.filter((r) => r.form === selectedForm),
    [data.rows, selectedForm],
  );

  const doseOptions = useMemo<[string, { vialSize: number; bestPerMg: number }][]>(() => {
    const map = new Map<string, { vialSize: number; bestPerMg: number }>();
    for (const row of rowsForForm) {
      const existing = map.get(row.doseLabel);
      const perMg = row.perMg ?? Infinity;
      if (!existing) map.set(row.doseLabel, { vialSize: row.vialSize, bestPerMg: perMg });
      else if (perMg < existing.bestPerMg) existing.bestPerMg = perMg;
    }
    const liveOptions = [...map.entries()].sort((a, b) => a[1].vialSize - b[1].vialSize);
    if (liveOptions.length > 0) return liveOptions;

    const selectedKey =
      selectedForm && selectedForm !== 'kit' && selectedForm !== 'pen' && selectedForm !== 'serum' ? selectedForm : 'vial';
    const fallback: readonly string[] = DOSAGE_OPTIONS[selectedKey];
    return fallback.map((label: string) => [label, { vialSize: 0, bestPerMg: 0 }] as const);
  }, [rowsForForm, selectedForm]);

  const bestDoseLabel = useMemo(() => {
    let best: string | null = null;
    let bestPerMg = Infinity;
    for (const [label, { bestPerMg: perMg }] of doseOptions) {
      if (perMg < bestPerMg) {
        bestPerMg = perMg;
        best = label;
      }
    }
    return best;
  }, [doseOptions]);

  const [selectedDose, setSelectedDose] = useState<string | null>(null);
  const [visibleDoseCount, setVisibleDoseCount] = useState(3);
  const activeDose = selectedDose;

  const visibleDoseOptions = doseOptions.slice(0, visibleDoseCount);
  const hiddenDoseCount = Math.max(0, doseOptions.length - visibleDoseCount);

  const rowsForDose = useMemo(
    () => (activeDose ? rowsForForm.filter((r) => r.doseLabel === activeDose) : rowsForForm),
    [rowsForForm, activeDose],
  );
  const sortedRows = useMemo(() => {
    return [...rowsForDose].sort((a, b) => {
      if (a.inStock !== b.inStock) return a.inStock ? -1 : 1;
      return a.priceCents - b.priceCents;
    });
  }, [rowsForDose]);
  const shownRows = sortedRows.slice(0, ROW_LIMIT);
  // Counted from the untrimmed offers on the server: `data.rows` only carries
  // the listings this card can reach, so counting it would undersell the rest.
  const totalForSelection = selectedForm
    ? (activeDose
        ? data.rowCounts.byFormDose[rowCountKey(selectedForm, activeDose)]
        : data.rowCounts.byForm[selectedForm]) ?? sortedRows.length
    : sortedRows.length;
  const remaining = Math.max(0, totalForSelection - shownRows.length);

  return (
    <article className="card-3d flex h-full flex-col gap-4 rounded-card border border-line bg-surface-raised p-5">
      <header className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <Link href={`/products/${data.slug}`} className="text-lg font-black text-content hover:text-brand">
            {data.name}
          </Link>
          {data.category ? (
            <div className="mt-1.5 flex flex-wrap gap-1.5">
              {splitCategories(data.category).map((category) => (
                <span
                  key={category}
                  className="block w-fit rounded-pill border border-line bg-surface px-2.5 py-0.5 text-xs font-bold text-content"
                >
                  {category}
                </span>
              ))}
            </div>
          ) : null}
        </div>
        <div className="flex shrink-0 items-center gap-0.5">
          <ProductInfoModal slug={data.slug} name={data.name} category={data.category} summary={data.summary} />
          <ShareButton
            title={data.name}
            url={`https://${site.domain}/products/${data.slug}`}
            className="h-8 w-8 border-0 bg-transparent text-muted hover:text-brand"
          />
          <FavoriteButton slug={data.slug} name={data.name} kind="product" className="h-8 w-8" />
        </div>
      </header>

      {data.rows.length === 0 ? (
        <p className="rounded-card border border-dashed border-line p-6 text-center text-sm text-muted">
          No prices recorded yet.
        </p>
      ) : (
        <>
          {availableForms.length > 0 ? (
            <div className="flex items-center justify-end gap-3">
              <div className="flex gap-1">
                {availableForms.map((form) => (
                  <button
                    key={form}
                    type="button"
                    onClick={() => {
                      setSelectedForm(form);
                      setSelectedDose(null);
                    }}
                    className={`rounded-chip px-2.5 py-1 text-micro font-bold uppercase transition-colors ${
                      form === selectedForm
                        ? 'bg-brand text-surface'
                        : 'border border-line text-muted hover:border-brand hover:bg-brand hover:text-surface'
                    }`}
                  >
                    {FORM_LABELS[form]}
                  </button>
                ))}
              </div>
            </div>
          ) : null}

          {doseOptions.length > 0 ? (
            <div className="pb-1">
              <div className="flex gap-1.5 overflow-x-auto [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
                {visibleDoseOptions.map(([label]: [string, { vialSize: number; bestPerMg: number }]) => (
                  <button
                    key={label}
                    type="button"
                    onClick={() => setSelectedDose(label)}
                    className={`inline-flex h-fit shrink-0 items-center gap-1 rounded-chip border px-2.5 py-1.5 text-xs font-bold transition-colors ${
                      label === activeDose
                        ? 'border-brand bg-brand-soft text-brand-strong'
                        : 'border-line text-content hover:border-brand hover:bg-brand hover:text-surface'
                    }`}
                  >
                    {label === bestDoseLabel ? <StarIcon className="h-3 w-3 text-rating" /> : null}
                    {label}
                  </button>
                ))}
                {hiddenDoseCount > 0 ? (
                  <button
                    type="button"
                    onClick={() => setVisibleDoseCount((current) => Math.min(current + 3, doseOptions.length))}
                    className="inline-flex h-fit shrink-0 items-center gap-1 rounded-chip border border-dashed border-line px-2.5 py-1.5 text-xs font-bold text-faint transition-colors hover:border-brand hover:bg-brand hover:text-surface"
                  >
                    +{hiddenDoseCount} More
                  </button>
                ) : null}
              </div>
            </div>
          ) : null}

          <ul className="space-y-2">
            {shownRows.map((row, i) => (
              <MiniPriceRow
                key={`${row.supplierSlug}-${row.doseLabel}`}
                row={row}
                isBest={i === 0 && row.inStock}
                view={view}
              />
            ))}
          </ul>

          {remaining > 0 ? (
            <Link
              href={`/products/${data.slug}?form=${selectedForm}`}
              className="flex items-center justify-center gap-1 pt-1 text-sm font-bold text-muted hover:text-brand"
            >
              +{remaining} more
              <ChevronRightIcon className="h-3.5 w-3.5" />
            </Link>
          ) : null}
        </>
      )}
    </article>
  );
}

function MiniPriceRow({
  row,
  isBest,
  view,
}: {
  row: ProductCardRow;
  isBest: boolean;
  view: 'total' | 'permg';
}) {
  return (
    <li
      className={`flex items-center justify-between gap-3 rounded-chip border p-2.5 ${
        isBest ? 'border-brand/30 bg-brand-tint' : 'border-line bg-surface'
      }`}
    >
      <div className="flex min-w-0 items-center gap-2.5">
        <span className="flex h-[45px] w-[45px] shrink-0 items-center justify-center overflow-hidden rounded-chip border border-line bg-surface-raised">
          {row.supplierLogo ? (
            <Image src={row.supplierLogo} alt="" width={45} height={45} className="h-full w-full object-contain" unoptimized />
          ) : (
            <span aria-hidden="true" className="text-xs font-bold text-faint">
              {row.supplierName.charAt(0)}
            </span>
          )}
        </span>
        <div className="min-w-0">
          <div className="flex items-center gap-1.5">
            <Link href={`/suppliers/${row.supplierSlug}`} className="truncate text-sm font-bold text-content hover:text-brand">
              {row.supplierName}
            </Link>
            {row.hasLabReport ? <FlaskIcon className="h-3 w-3 shrink-0 text-brand" aria-label="Lab report available" /> : null}
          </div>
          <p className={`text-micro font-semibold ${row.inStock ? 'text-brand-strong' : 'text-danger'}`}>
            {row.inStock ? 'In Stock' : 'Out of Stock'}
          </p>
        </div>
      </div>

      <div className="flex shrink-0 items-center gap-2">
        <div className="text-right">
          {view === 'permg' ? (
            <span className="text-sm font-black text-content">
              {row.perMg !== null ? formatPerMg(row.perMg, row.currency) : ''}
            </span>
          ) : (
            <div className="flex items-baseline gap-1">
              {row.discounted ? (
                <span className="text-micro text-faint line-through">
                  {formatMoney(cents(row.listPriceCents), row.currency)}
                </span>
              ) : null}
              <span className="text-sm font-black text-content">
                {formatMoney(cents(row.priceCents), row.currency)}
              </span>
            </div>
          )}
          {row.couponCode ? (
            <CopyCode code={row.couponCode} className="mt-1 gap-1 px-1.5 py-0.5 text-micro" />
          ) : null}
        </div>
        <a
          href={`/go?to=${encodeURIComponent(row.productUrl)}`}
          target="_blank"
          rel="sponsored noopener"
          aria-label={`View offer from ${row.supplierName}`}
          className="text-muted hover:text-brand"
        >
          <ExternalIcon className="h-4 w-4" />
        </a>
      </div>
    </li>
  );
}

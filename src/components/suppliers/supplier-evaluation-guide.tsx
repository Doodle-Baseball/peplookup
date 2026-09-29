import { ShieldCheckIcon } from '@/components/icons/icons';

/**
 * Supporting text for the supplier directory, rendered on the server so the
 * copy is in the initial HTML for search engines. `supplierCount` must be the
 * same number the page's "Suppliers listed" stat shows, so the two never drift.
 *
 * Laid out like the FAQ panel below it (same panel, eyebrow and heading
 * treatment): heading on the left from `lg` up, stacked above the text on
 * smaller screens.
 */
export function SupplierEvaluationGuide({ supplierCount }: { supplierCount: number }) {
  return (
    <section id="supplier-evaluation-guide" className="mx-auto max-w-shell scroll-mt-24 px-4 pb-8">
      <div className="rounded-panel border border-line bg-surface-raised p-5 shadow-card sm:p-8">
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3 lg:gap-10">
          <div>
            <p className="eyebrow">Supplier guide</p>
            <h2 className="mt-3 text-[clamp(1.75rem,7vw,3rem)] font-black leading-[1.05] text-content">
              What to look for in a research peptide <span className="italic text-accent">supplier</span>
            </h2>
          </div>

          <div className="space-y-4 lg:col-span-2">
            <p className="text-base leading-7 text-muted sm:text-lg sm:leading-8">
              Cost per milligram matters more than the headline price, since pack sizes vary widely between
              vendors. Beyond price, check whether a certificate of analysis is published for the specific product
              and batch, confirm the shipping origin and typical delivery window, note which payment methods are
              accepted, and check for an active discount code before ordering.
            </p>

            <div className="flex items-start gap-3 rounded-card border border-accent/25 bg-accent-tint p-4 sm:p-5">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-chip bg-surface-raised text-accent-strong shadow-card">
                <ShieldCheckIcon className="h-5 w-5" />
              </span>
              {/* One string, so the number isn't split out by React's text-node markers in the raw HTML. */}
              <p className="min-w-0 text-sm leading-7 text-content sm:text-base">
                {`PepLookup tracks ${supplierCount} suppliers this way: normalized, verified, and updated as listings change. Being included in this directory is not a paid placement or an endorsement.`}
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

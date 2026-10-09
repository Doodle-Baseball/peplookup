import { ShieldCheckIcon } from '@/components/icons/icons';

/**
 * Supporting text for the supplier directory, rendered on the server so the
 * copy is in the initial HTML for search engines.
 *
 * Laid out like the FAQ panel below it (same panel, eyebrow and heading
 * treatment): heading on the left from `lg` up, stacked above the text on
 * smaller screens.
 */
export function SupplierEvaluationGuide() {
  return (
    <section id="supplier-evaluation-guide" className="mx-auto max-w-shell scroll-mt-24 px-4 pb-8">
      <div className="rounded-panel border border-line bg-surface-raised p-5 shadow-card sm:p-8">
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3 lg:gap-10">
          <div>
            <p className="eyebrow">Supplier guide</p>
            <h2 className="mt-3 text-[clamp(1.75rem,7vw,3rem)] font-black leading-[1.05] text-content">
              How to Choose a Peptide <span className="italic text-accent">Supplier</span>
            </h2>
          </div>

          <div className="space-y-4 lg:col-span-2">
            <p className="text-base leading-7 text-muted sm:text-lg sm:leading-8">
              Before ordering from a research peptide supplier, compare cost per milligram, not the headline price,
              since pack sizes vary. Then check for a certificate of analysis for your exact batch, the shipping origin
              and delivery window, payment methods, recent public reviews and any active coupon code. Every profile in
              this peptide suppliers directory shows these side by side.
            </p>

            <div className="flex items-start gap-3 rounded-card border border-accent/25 bg-accent-tint p-4 sm:p-5">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-chip bg-surface-raised text-accent-strong shadow-card">
                <ShieldCheckIcon className="h-5 w-5" />
              </span>
              <p className="min-w-0 text-sm leading-7 text-content sm:text-base">
                PepLookup tracks 80+ suppliers this way: prices normalized to cost per mg and updated as listings
                change. Being listed is not an endorsement. Some Visit Site links are affiliate links, which
                doesn&rsquo;t change prices or the order of the list.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

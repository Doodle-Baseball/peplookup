import { site } from '@/config/site';
import { LISTED_PLAN_ID, formatPlanPrice, vendorListingPlan } from '@/config/vendor-listing';
import {
  ArrowRightIcon,
  CheckBadgeIcon,
  DocumentIcon,
  GlobeIcon,
  ShieldCheckIcon,
  WalletIcon,
} from '@/components/icons/icons';
import { AccentedHeading } from '@/components/ui/accented-heading';
import { ScrollToApplyLink } from '@/components/vendor-listing/scroll-to-apply-link';
import { cn } from '@/lib/cn';

/** The bar under the hero, scrolling like the home page's ticker bar. */
const BAR_ITEMS: readonly string[] = [
  'Dedicated Supplier Page',
  'Backlink to Your Site',
  'Supplier Reviews',
  'Supplier Recommendations',
  'FEATURED Badge',
];

/**
 * Decorative rising trend for the hero card, in a 556x180 box. It carries no
 * numbers: it illustrates where a listing sits, not a traffic figure.
 */
const TREND_LINE =
  'M8 152 C 48 144, 88 146, 118 138 S 168 120, 208 108 S 276 94, 306 84 S 366 72, 396 60 S 438 38, 478 28 S 526 16, 548 10';
const TREND_AREA = `${TREND_LINE} L548 180 L8 180 Z`;

function FloatingChip({ children, icon, className }: { children: React.ReactNode; icon: React.ReactNode; className: string }) {
  return (
    <div
      aria-hidden="true"
      className={cn(
        'listing-chip-pop absolute z-10 hidden items-center gap-2 rounded-chip border border-line bg-surface-raised/90 px-3 py-1.5 text-xs font-normal text-muted shadow-lift backdrop-blur-md sm:flex',
        className,
      )}
    >
      <span className="flex h-6 w-6 items-center justify-center rounded-chip bg-accent-tint text-accent">{icon}</span>
      {children}
    </div>
  );
}

/**
 * Illustrative "your listing" card, shown as the front of a small stack of
 * cards tilted in 3D: the real number of suppliers compared, a decorative
 * rising line, and where the listing appears.
 */
function ListingPreviewCard({ supplierCount }: { supplierCount: number }) {
  return (
    <div className="listing-card-stage animate-fade-up animate-delay-300 relative mx-auto w-full max-w-md lg:max-w-none">
      <div className="listing-card-tilt relative">
        {/* Two paler cards behind the front one give the stack its depth. */}
        <div aria-hidden="true" className="absolute inset-x-10 -bottom-6 top-6 rounded-panel border border-line bg-surface-raised/50 shadow-card" />
        <div aria-hidden="true" className="absolute inset-x-5 -bottom-3 top-3 rounded-panel border border-line bg-surface-raised/80 shadow-card" />

        <FloatingChip icon={<DocumentIcon className="h-3.5 w-3.5" />} className="-top-4 right-6">
          COA page linked
        </FloatingChip>
        <FloatingChip icon={<GlobeIcon className="h-3.5 w-3.5" />} className="-left-6 top-1/3">
          Backlink added
        </FloatingChip>
        <FloatingChip icon={<ShieldCheckIcon className="h-3.5 w-3.5" />} className="-bottom-4 right-1/4">
          Compared by cost per mg
        </FloatingChip>

        <div className="listing-card-3d relative overflow-hidden rounded-panel border border-line bg-gradient-to-br from-surface-raised via-surface-raised to-accent-tint p-5 sm:p-6">
          {/* A soft sheen across the top edge, as if lit from above. */}
          <div aria-hidden="true" className="pointer-events-none absolute inset-x-0 top-0 h-24 bg-gradient-to-b from-surface-raised to-transparent" />
          <div aria-hidden="true" className="pointer-events-none absolute -right-16 -top-16 h-48 w-48 rounded-full bg-accent-soft/50 blur-3xl" />

          <div className="relative flex items-start justify-between gap-3">
            <div>
              <p className="font-mono text-micro font-normal uppercase tracking-widest text-muted">
                {supplierCount > 0 ? 'Suppliers compared' : `Your listing on ${site.name}`}
              </p>
              <p className="mt-1 text-3xl font-medium tracking-tight text-content">
                {supplierCount > 0 ? supplierCount.toLocaleString('en-US') : 'Your Brand'}
              </p>
            </div>
            <span className="inline-flex items-center gap-1.5 rounded-pill border border-accent/15 bg-surface-raised px-2.5 py-1 text-xs font-normal text-accent-strong shadow-card">
              <CheckBadgeIcon className="h-3.5 w-3.5" />
              Featured
            </span>
          </div>

          <div aria-hidden="true" className="relative mt-4">
            <div className="absolute inset-x-0 top-1/3 border-t border-dashed border-line" />
            <div className="absolute inset-x-0 top-2/3 border-t border-dashed border-line" />
            <svg viewBox="0 0 556 180" className="relative h-auto w-full overflow-visible">
              <defs>
                <linearGradient id="listing-hero-area" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" style={{ stopColor: 'rgb(var(--accent))', stopOpacity: 0.2 }} />
                  <stop offset="100%" style={{ stopColor: 'rgb(var(--accent))', stopOpacity: 0 }} />
                </linearGradient>
              </defs>
              <path d={TREND_AREA} fill="url(#listing-hero-area)" className="animate-listing-area" />
              <path
                d={TREND_LINE}
                pathLength={1}
                fill="none"
                strokeWidth={2.5}
                strokeLinecap="round"
                className="animate-listing-draw stroke-accent"
              />
              <circle cx={548} cy={10} r={9} className="animate-listing-area fill-accent-soft" />
              <circle cx={548} cy={10} r={5} strokeWidth={2.5} className="animate-listing-area fill-surface-raised stroke-accent" />
            </svg>
          </div>

          <div className="relative mt-4 grid grid-cols-3 gap-2 text-center text-xs font-normal text-muted">
            {['Directory', 'Brand page', 'Your store'].map((label) => (
              <span key={label} className="rounded-chip border border-line bg-surface-raised/80 py-2 shadow-card">
                {label}
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

/**
 * What every listing includes, as the home page's black ticker: the items
 * scroll right to left, rendered twice so the loop is seamless. The list is
 * read once by screen readers; the moving copy is hidden from them.
 */
function BenefitsBar() {
  return (
    <div className="marquee panel-dark rounded-bar py-4 shadow-panel">
      <ul className="sr-only">
        {BAR_ITEMS.map((item) => (
          <li key={item}>{item}</li>
        ))}
      </ul>
      <div className="marquee-track" aria-hidden="true">
        {[0, 1].map((copy) => (
          <div key={copy} className="flex shrink-0 items-center">
            {BAR_ITEMS.map((item) => (
              <span
                key={`${copy}-${item}`}
                className="flex items-center whitespace-nowrap px-8 font-mono text-sm font-bold uppercase tracking-widest text-white/90"
              >
                {item}
                <span className="ml-8 text-white/25">·</span>
              </span>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

/**
 * Hero in the site theme. On a laptop the first screen holds only the pitch,
 * the buttons and the illustrative card; the bar follows on scroll.
 */
export function ListingHero({ heading, supplierCount }: { heading: string | null; supplierCount: number }) {
  const plan = vendorListingPlan(LISTED_PLAN_ID);
  const price = `${formatPlanPrice(plan)}/${plan.interval === 'month' ? 'month' : 'year'}`;

  return (
    <section className="relative overflow-hidden">
      <div aria-hidden="true" className="listing-hero-glow pointer-events-none absolute inset-0">
        <div className="absolute -left-32 top-0 h-96 w-96 rounded-full bg-accent-soft/60 blur-3xl" />
        <div className="absolute -right-32 top-1/4 h-96 w-96 rounded-full bg-accent-tint blur-3xl" />
      </div>

      <div className="listing-hero-screen relative mx-auto grid max-w-shell items-center gap-12 px-4 pb-10 pt-8 sm:pt-12 lg:grid-cols-2 lg:gap-16 lg:py-10">
        <div>
          <p className="animate-fade-up inline-flex items-center gap-2.5 rounded-pill border border-line bg-surface-raised px-4 py-2 font-mono text-micro font-bold uppercase tracking-widest text-content shadow-card">
            <span className="relative flex h-2 w-2">
              <span aria-hidden="true" className="badge-ping absolute inline-flex h-full w-full rounded-full bg-warn" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-warn" />
            </span>
            Free listings are closed
          </p>

          <h1 className="animate-fade-up animate-delay-100 mt-6 text-4xl font-black leading-tight tracking-tight text-content sm:text-5xl lg:text-6xl">
            {heading ? (
              <AccentedHeading text={heading} />
            ) : (
              <>
                Promote your peptide brand. <span className="text-accent">Reach more buyers.</span>
              </>
            )}
          </h1>

          <p className="animate-fade-up animate-delay-200 mt-5 max-w-xl text-lg leading-relaxed text-muted lg:text-xl">
            Put your brand where researchers compare suppliers by cost per mg. You get a dedicated brand page, your
            products in our comparison directory, and a backlink to your store.
          </p>

          <div className="animate-fade-up animate-delay-300 mt-8 flex flex-col items-start gap-3 sm:flex-row sm:items-center sm:gap-4">
            <ScrollToApplyLink className="btn-3d group inline-flex items-center gap-2 rounded-pill bg-brand px-8 py-4 text-base font-bold text-white">
              Get listed for {price}
              <ArrowRightIcon className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </ScrollToApplyLink>
            <span className="inline-flex items-center gap-2 rounded-pill border border-accent/25 bg-accent-tint px-5 py-3 text-sm font-semibold text-accent-strong sm:text-base">
              <WalletIcon className="h-4 w-4 shrink-0" />
              Pay with Bitcoin or PayPal
            </span>
          </div>
        </div>

        <ListingPreviewCard supplierCount={supplierCount} />
      </div>

      <div className="relative mx-auto max-w-shell px-4 pb-10">
        <BenefitsBar />
      </div>
    </section>
  );
}

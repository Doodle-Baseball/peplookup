import Link from 'next/link';
import {
  ArrowRightIcon,
  CalendarIcon,
  ExternalIcon,
  GlobeIcon,
  StarIcon,
  TruckIcon,
  WalletIcon,
} from '@/components/icons/icons';
import { CopyCode } from '@/components/ui/copy-code';
import { SupplierLogo } from '@/components/ui/supplier-logo';
import { shortCountry, shortPayments, shortProcessing, type PromotedSupplier } from '@/lib/promoted-supplier';

/** "October", from the render date, so the heading rolls over with the month. */
function currentMonthName(now: Date): string {
  return new Intl.DateTimeFormat('en-US', { month: 'long', timeZone: 'UTC' }).format(now);
}

/** The intro, written from the live counts so it can never drift from the tiles beside it. */
function introText(promo: PromotedSupplier): string {
  // Leads with the same figure as the first tile, "Products in stock".
  const products = `${promo.inStockListingCount.toLocaleString('en-US')} ${promo.inStockListingCount === 1 ? 'product' : 'products'} in stock`;
  const compounds = `${promo.inStockCompoundCount.toLocaleString('en-US')} ${promo.inStockCompoundCount === 1 ? 'compound' : 'compounds'}`;
  const parts = [`${products} across ${compounds}`];
  if (promo.coaListingCount > 0) {
    parts.push(
      promo.coaListingCount === promo.listingCount
        ? `all ${promo.listingCount} of their listings backed by a published COA`
        : `${promo.coaListingCount} of their ${promo.listingCount} listings backed by a published COA`,
    );
  }
  if (promo.coupon) parts.push(`${promo.coupon.percentOff}% off with code ${promo.coupon.code.toUpperCase()}`);
  const list = parts.length > 1 ? `${parts.slice(0, -1).join(', ')}${parts.length > 2 ? ',' : ''} and ${parts.at(-1)}` : parts[0];
  return `${list}. See how their live prices compare with every other supplier on their profile.`;
}

function StatTile({ value, label }: { value: number; label: string }) {
  return (
    <div className="rounded-card border border-line bg-surface p-3 sm:p-5">
      <p className="text-2xl font-black tabular-nums tracking-tight text-content sm:text-4xl">
        {value.toLocaleString('en-US')}
      </p>
      <p className="mt-1 font-mono text-micro font-bold uppercase tracking-wide text-muted">{label}</p>
    </div>
  );
}

function FactChip({ icon, children }: { icon: React.ReactNode; children: React.ReactNode }) {
  return (
    <li className="inline-flex shrink-0 items-center gap-1 whitespace-nowrap rounded-pill border border-line bg-surface px-2.5 py-1.5 text-micro font-bold tracking-normal text-content">
      {icon}
      {children}
    </li>
  );
}

/** Short facts under the tiles, wrapping onto a second line so every one shows in full. */
function FactRow({ promo }: { promo: PromotedSupplier }) {
  return (
    <ul className="mt-4 flex flex-wrap gap-1.5">
      {promo.rating ? (
        <FactChip icon={<StarIcon aria-hidden="true" className="h-3.5 w-3.5 text-coupon" />}>
          {promo.rating.url ? (
            <a href={promo.rating.url} target="_blank" rel="nofollow noopener noreferrer" className="hover:underline">
              {promo.rating.value}/5 {promo.rating.sourceLabel}
            </a>
          ) : (
            <>
              {promo.rating.value}/5 {promo.rating.sourceLabel}
            </>
          )}
        </FactChip>
      ) : null}
      {promo.country ? (
        <FactChip icon={<GlobeIcon aria-hidden="true" className="h-3.5 w-3.5 text-accent" />}>{shortCountry(promo.country)}</FactChip>
      ) : null}
      {promo.processingTime ? (
        <FactChip icon={<TruckIcon aria-hidden="true" className="h-3.5 w-3.5 text-accent" />}>{shortProcessing(promo.processingTime)}</FactChip>
      ) : null}
      {promo.foundedYear ? (
        <FactChip icon={<CalendarIcon aria-hidden="true" className="h-3.5 w-3.5 text-accent" />}>Est. {promo.foundedYear}</FactChip>
      ) : null}
      {promo.paymentMethods.length > 0 ? (
        <FactChip icon={<WalletIcon aria-hidden="true" className="h-3.5 w-3.5 text-accent" />}>{shortPayments(promo.paymentMethods)}</FactChip>
      ) : null}
    </ul>
  );
}

/** The supplier's icon on its own, with no card behind it. */
function PartnerLogo({ promo }: { promo: PromotedSupplier }) {
  return (
    <SupplierLogo
      src={promo.logoUrl}
      name={promo.name}
      size={96}
      className="h-20 w-20 shrink-0 rounded-chip border-2 bg-transparent sm:h-24 sm:w-24"
      initialClassName="text-3xl font-black"
    />
  );
}

/**
 * The month's promoted supplier, above the supplier directory. Every figure
 * comes from the supplier's record and live listings. The shop links are
 * marked sponsored and announce themselves to screen readers as affiliate
 * links; the profile link is where a visitor can compare the supplier's
 * prices with every other supplier.
 */
export function FeaturedPartnerSection({ promo, now = new Date() }: { promo: PromotedSupplier; now?: Date }) {
  const profilePath = `/suppliers/${promo.slug}`;
  const month = currentMonthName(now);

  return (
    <section aria-labelledby="featured-partner-heading" className="mx-auto w-full max-w-shell px-4 pt-12 sm:pt-16">
      <p className="eyebrow">Partner spotlight</p>
      <h2
        id="featured-partner-heading"
        className="mt-3 text-[clamp(2rem,5vw,3.25rem)] font-black leading-[0.95] text-content"
      >
        {month}&rsquo;s Best <span className="text-accent">Supplier.</span>
      </h2>

      <div className="mt-8 rounded-panel border border-line bg-surface-raised p-5 shadow-card sm:p-8">
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-5 lg:gap-10">
          <div className="min-w-0 lg:col-span-3">
            <div className="flex items-center gap-4 sm:gap-5">
              <PartnerLogo promo={promo} />
              <div className="min-w-0">
                <h3 className="text-3xl font-black leading-tight text-content sm:text-4xl">{promo.name}</h3>
                <a
                  href={promo.shopUrl}
                  target="_blank"
                  rel="nofollow noopener noreferrer sponsored"
                  className="mt-1 inline-flex items-center gap-1 font-mono text-xs text-muted transition-colors hover:text-accent-strong"
                >
                  {promo.websiteHost}
                  <ExternalIcon aria-hidden="true" className="h-3 w-3" />
                  <span className="sr-only">(affiliate link, opens in a new tab)</span>
                </a>
              </div>
            </div>

            <p className="mt-6 max-w-2xl text-sm leading-7 text-muted sm:text-base">{introText(promo)}</p>

            <div className="mt-6 grid grid-cols-3 gap-2 sm:gap-4">
              <StatTile value={promo.inStockListingCount} label="Products in stock" />
              <StatTile value={promo.listingCount} label="Listings tracked" />
              <StatTile value={promo.coaListingCount} label="Listings with COAs" />
            </div>

            <FactRow promo={promo} />
          </div>

          <div className="flex flex-col gap-4 lg:col-span-2 lg:justify-center">
            {promo.coupon ? (
              <div className="rounded-card border-2 border-dashed border-accent/40 bg-surface-raised p-5 sm:p-6">
                <p className="font-mono text-micro font-bold uppercase tracking-wide text-muted">Partner discount</p>
                <p className="mt-2 text-5xl font-black tracking-tight text-accent-strong sm:text-6xl">
                  {promo.coupon.percentOff}% off
                </p>
                <div className="mt-4 flex flex-wrap items-center gap-2 text-sm text-muted">
                  With code
                  <CopyCode
                    code={promo.coupon.code}
                    className="border-accent/40 bg-accent-tint px-3 py-1.5 text-sm text-accent-strong hover:bg-accent-soft"
                  />
                </div>
              </div>
            ) : null}

            <a
              href={promo.shopUrl}
              target="_blank"
              rel="nofollow noopener noreferrer sponsored"
              className="btn-3d group/shop relative inline-flex items-center justify-center gap-2 overflow-hidden rounded-pill bg-brand px-6 py-3.5 text-sm font-bold text-white transition-colors hover:bg-brand-strong"
            >
              <span
                aria-hidden="true"
                className="animate-sheen pointer-events-none absolute inset-y-0 left-0 w-1/3 bg-gradient-to-r from-transparent via-surface-raised/25 to-transparent"
              />
              <span className="relative">Shop {promo.name}</span>
              <ExternalIcon
                aria-hidden="true"
                className="relative h-4 w-4 transition-transform group-hover/shop:-translate-y-0.5 group-hover/shop:translate-x-0.5"
              />
              <span className="sr-only">(affiliate link, opens in a new tab)</span>
            </a>
            <Link
              href={profilePath}
              className="group/profile inline-flex items-center justify-center gap-2 rounded-pill border border-line bg-surface-raised px-6 py-3.5 text-sm font-bold text-content shadow-card transition-all hover:-translate-y-0.5 hover:border-accent hover:text-accent-strong"
            >
              View Profile
              <ArrowRightIcon aria-hidden="true" className="h-4 w-4 transition-transform group-hover/profile:translate-x-1" />
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}

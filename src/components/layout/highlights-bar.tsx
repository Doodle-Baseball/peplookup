import type { ReactNode } from 'react';
import { ExternalIcon, ShieldCheckIcon, StarIcon, TagIcon, TruckIcon, WalletIcon } from '@/components/icons/icons';
import { promotedFacts, type PromotedFactKind } from '@/components/layout/highlights-bar-items';
import { SupplierLogo } from '@/components/ui/supplier-logo';
import { site } from '@/config/site';
import type { PromotedSupplier } from '@/lib/promoted-supplier';
import { cn } from '@/lib/cn';

const FACT_ICONS: Readonly<Record<PromotedFactKind, ReactNode>> = {
  coupon: <TagIcon aria-hidden="true" className="h-3.5 w-3.5 shrink-0" />,
  rating: <StarIcon aria-hidden="true" className="h-3.5 w-3.5 shrink-0 text-coupon" />,
  processing: <TruckIcon aria-hidden="true" className="h-3.5 w-3.5 shrink-0" />,
  payments: <WalletIcon aria-hidden="true" className="h-3.5 w-3.5 shrink-0" />,
};

/**
 * Which facts fit beside the pill at which width, each on one line: the
 * coupon from lg, rating and processing from xl, payments on 2xl where the
 * bar widens.
 */
const FACT_VISIBILITY: Readonly<Record<PromotedFactKind, string>> = {
  coupon: 'flex',
  rating: 'hidden xl:flex',
  processing: 'hidden xl:flex',
  payments: 'hidden 2xl:flex',
};

/** Staggered entrance for the facts, capped at the longest delay the theme defines. */
const ENTRANCE_DELAYS = ['animate-delay-100', 'animate-delay-200', 'animate-delay-300', 'animate-delay-400'];

const CHIP_CLASS =
  'animate-fade-up items-center gap-1.5 whitespace-nowrap rounded-pill px-3 py-1 font-mono text-xs font-bold uppercase tracking-wider';

/** White text on a frosted chip, legible against the green bar. */
const LIGHT_CHIP_CLASS = 'border border-surface-raised/40 bg-surface-raised/15 text-surface-raised shadow-sm';

/**
 * The promoted supplier as a white pill linking to its shop. Labelled
 * "Featured partner" and marked sponsored, so the relationship is stated on
 * the link itself. On phones it carries the discount, since the facts are hidden.
 */
function PartnerPill({ promo }: { promo: PromotedSupplier }) {
  return (
    <a
      href={promo.shopUrl}
      target="_blank"
      rel="nofollow noopener noreferrer sponsored"
      title={`Affiliate link: ${site.name} may earn a commission. Featured placement never changes prices or price-per-mg rankings.`}
      className="group/pill animate-fade-up flex min-w-0 shrink-0 items-center gap-2 whitespace-nowrap rounded-pill bg-surface-raised py-1 pl-1 pr-1 font-mono text-xs font-bold uppercase tracking-wider text-content shadow-lift ring-1 ring-surface-raised/50 transition-all hover:-translate-y-px hover:shadow-panel focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-surface-raised focus-visible:ring-offset-2 focus-visible:ring-offset-accent-strong"
    >
      <SupplierLogo
        src={promo.logoUrl}
        name={promo.name}
        size={24}
        alt=""
        className="h-6 w-6 rounded-full"
        initialClassName="text-micro"
      />
      <span className="hidden items-center gap-1.5 text-accent-strong sm:inline-flex">
        <span className="relative flex h-1.5 w-1.5" aria-hidden="true">
          <span className="absolute inline-flex h-full w-full rounded-full bg-accent opacity-60 motion-safe:animate-ping" />
          <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-accent" />
        </span>
        Featured partner
      </span>
      <span aria-hidden="true" className="hidden h-3 w-px bg-line sm:inline-block" />
      <span className="truncate">{promo.name}</span>
      <span className="hidden normal-case tracking-normal text-muted md:inline">{promo.websiteHost}</span>
      {promo.coupon ? (
        <span className="shrink-0 rounded-pill bg-accent-tint px-2 py-0.5 text-accent-strong lg:hidden">
          {promo.coupon.percentOff}% off
        </span>
      ) : null}
      <span className="inline-flex shrink-0 items-center gap-1 rounded-pill bg-accent-strong px-2.5 py-1 text-surface-raised transition-colors group-hover/pill:bg-accent">
        Shop
        <ExternalIcon
          aria-hidden="true"
          className="h-3 w-3 transition-transform group-hover/pill:-translate-y-px group-hover/pill:translate-x-0.5"
        />
      </span>
      <span className="sr-only">(affiliate link, opens in a new tab)</span>
    </a>
  );
}

function PartnerFacts({ promo }: { promo: PromotedSupplier }) {
  return (
    <ul className="hidden items-center gap-2 lg:flex">
      {promotedFacts(promo).map((fact, index) => {
        const delay = ENTRANCE_DELAYS[Math.min(index, ENTRANCE_DELAYS.length - 1)];
        if (fact.kind === 'coupon' && promo.coupon) {
          // The coupon reads as a ticket: white body, green dashed code stub.
          return (
            <li
              key={fact.kind}
              className={cn(CHIP_CLASS, FACT_VISIBILITY.coupon, delay, 'bg-surface-raised py-0.5 pr-0.5 text-accent-strong shadow-card')}
            >
              {FACT_ICONS.coupon}
              {promo.coupon.percentOff}% off with code
              <span className="rounded-pill border border-dashed border-accent bg-accent-tint px-2 py-0.5 text-accent-strong">
                {promo.coupon.code}
              </span>
            </li>
          );
        }
        return (
          <li
            key={fact.kind}
            className={cn(
              CHIP_CLASS,
              FACT_VISIBILITY[fact.kind],
              delay,
              LIGHT_CHIP_CLASS,
            )}
          >
            {FACT_ICONS[fact.kind]}
            {fact.text}
          </li>
        );
      })}
    </ul>
  );
}

function SiteStats({ stats }: { stats: readonly string[] }) {
  return (
    <ul className="flex flex-wrap items-center justify-center gap-2">
      {stats.map((stat, index) => (
        <li
          key={stat}
          className={cn(
            CHIP_CLASS,
            'flex',
            LIGHT_CHIP_CLASS,
            ENTRANCE_DELAYS[Math.min(index, ENTRANCE_DELAYS.length - 1)],
          )}
        >
          <ShieldCheckIcon aria-hidden="true" className="h-3.5 w-3.5 shrink-0" />
          {stat}
        </li>
      ))}
    </ul>
  );
}

/**
 * Static strip above the navbar on the theme's green, with a soft band of
 * light crossing it now and then. With a promoted supplier it is all
 * about them: the shop pill, then their coupon, rating, processing and
 * payments as chips that fade in one after another. Without one it shows the
 * site's catalogue stats. Every animation is skipped for reduced-motion users.
 * It scrolls away with the page while the navbar stays sticky.
 */
export function HighlightsBar({ promo, stats }: { promo: PromotedSupplier | null; stats: readonly string[] }) {
  if (!promo && stats.length === 0) return null;

  return (
    <aside
      aria-label={promo ? `Featured partner: ${promo.name}` : 'Site highlights'}
      className="relative mb-2 overflow-hidden bg-gradient-to-r from-accent-strong via-accent to-accent-strong text-surface-raised shadow-card sm:mb-3"
    >
      <div aria-hidden="true" className="pointer-events-none absolute inset-0">
        <span className="animate-sheen absolute inset-y-0 left-0 w-1/4 bg-gradient-to-r from-transparent via-surface-raised/15 to-transparent" />
        <span className="absolute inset-x-0 top-0 h-px bg-surface-raised/25" />
        <span className="absolute inset-x-0 bottom-0 h-px bg-brand/20" />
      </div>
      <div
        className={cn(
          'relative mx-auto flex max-w-shell items-center gap-4 px-3 py-2.5 sm:px-4 2xl:max-w-screen-2xl',
          promo ? 'justify-center lg:justify-between' : 'justify-center',
        )}
      >
        {promo ? (
          <>
            <PartnerPill promo={promo} />
            <PartnerFacts promo={promo} />
          </>
        ) : (
          <SiteStats stats={stats} />
        )}
      </div>
    </aside>
  );
}

import type { ReactNode } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { site } from '@/config/site';
import { chromeExtension } from '@/config/extension';
import { cn } from '@/lib/cn';
import { AddToChromeButton } from '@/components/extension/add-to-chrome-button';
import { ScrollToSectionLink } from '@/components/extension/scroll-to-section-link';
import { StarRating } from '@/components/ui/star-rating';
import {
  ArrowRightIcon,
  ChevronDownIcon,
  CopyIcon,
  LockIcon,
  RepeatIcon,
  ShieldCheckIcon,
  StarIcon,
  StoreIcon,
  TagIcon,
} from '@/components/icons/icons';

/** The section the pill scrolls to. */
export const EXTENSION_PROMO_ID = 'chrome-extension';

const ICON_SRC = '/extension/icon-128.png';

/** The extension's name as it appears on the Chrome Web Store. */
const STORE_NAME = 'Peptide Coupon Codes & Ratings';

/** One supplier from the extension's own feed, shown in the preview exactly as the extension would show it. */
export interface ExtensionPreviewSupplier {
  name: string;
  discount: string;
  code: string;
  trustpilot: { rating: number; reviews: number | null } | null;
}

type Variant = 'coupons' | 'reviews';

interface Point {
  icon: ReactNode;
  title: string;
  body: string;
}

function copyFor(variant: Variant, supportedCount: number | null) {
  const stores =
    supportedCount !== null && supportedCount > 0
      ? `${supportedCount} supported supplier stores`
      : 'supported supplier stores';
  if (variant === 'reviews') {
    return {
      pill: 'See supplier ratings on their own stores with our free Chrome extension',
      eyebrow: 'Free Chrome extension',
      heading: (
        <>
          Check a supplier&rsquo;s rating <span className="text-accent">while you shop</span>
        </>
      ),
      intro: `${STORE_NAME} by ${site.name} shows the supplier's Trustpilot rating, with its ${site.name} code, the moment you open the store in Chrome. No coming back to this page to check a score before you buy.`,
      points: [
        {
          icon: <StarIcon className="h-5 w-5" />,
          title: 'Trustpilot rating on the store',
          body: `Shown on ${stores}, wherever the supplier has a Trustpilot rating.`,
        },
        {
          icon: <TagIcon className="h-5 w-5" />,
          title: 'The code beside it',
          body: 'The same verified code and discount this site lists for that supplier.',
        },
        {
          icon: <RepeatIcon className="h-5 w-5" />,
          title: 'Kept up to date',
          body: `Ratings and codes refresh from ${site.name} every 6 hours.`,
        },
        {
          icon: <LockIcon className="h-5 w-5" />,
          title: 'Nothing collected',
          body: 'No account, no sign-in and no personal data collected.',
        },
      ] satisfies Point[],
    };
  }
  return {
    pill: 'Get these codes automatically with our free Chrome extension',
    eyebrow: 'Free Chrome extension',
    heading: (
      <>
        Your peptide coupon code, <span className="text-accent">right at checkout</span>
      </>
    ),
    intro: `${STORE_NAME} by ${site.name} shows the verified code for the store you are on. Open a supported supplier in Chrome and a small card shows its code, discount and Trustpilot rating, so you never have to come back here to copy it.`,
    points: [
      {
        icon: <StoreIcon className="h-5 w-5" />,
        title: `Works on ${supportedCount ?? 'supported'} stores`,
        body: `Every supplier with an active ${site.name} code and a store we can match.`,
      },
      {
        icon: <CopyIcon className="h-5 w-5" />,
        title: 'Copy or fill in one click',
        body: 'Paste the code yourself, or let it fill the coupon field for you.',
      },
      {
        icon: <ShieldCheckIcon className="h-5 w-5" />,
        title: 'You stay in control',
        body: 'It never presses Apply, places an order or submits a form.',
      },
      {
        icon: <LockIcon className="h-5 w-5" />,
        title: 'Nothing collected',
        body: 'No account, no sign-in and no personal data collected.',
      },
    ] satisfies Point[],
  };
}

/**
 * A raised black pill under a page's intro that scrolls down to the extension
 * section without adding `#chrome-extension` to the URL.
 */
export function ExtensionPromoPill({ variant = 'coupons', className }: { variant?: Variant; className?: string }) {
  const { pill } = copyFor(variant, null);
  return (
    <ScrollToSectionLink
      targetId={EXTENSION_PROMO_ID}
      className={cn(
        'btn-3d group inline-flex max-w-full items-center gap-3 rounded-pill bg-brand py-2 pl-2 pr-2 text-sm font-bold text-white ring-4 ring-brand/10 sm:text-base',
        className,
      )}
    >
      <Image
        src={ICON_SRC}
        alt=""
        width={40}
        height={40}
        className="h-10 w-10 shrink-0 rounded-pill ring-2 ring-white/30"
      />
      <span className="hidden shrink-0 rounded-pill bg-accent px-2.5 py-1 text-micro font-black uppercase tracking-wide text-white sm:inline">
        Free
      </span>
      <span className="min-w-0 leading-snug sm:truncate">{pill}</span>
      <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-pill bg-accent text-white">
        <ChevronDownIcon className="h-4 w-4 motion-safe:animate-bounce" />
      </span>
    </ScrollToSectionLink>
  );
}

/** What the extension's card looks like on a supplier's store, filled with a real supplier from its feed. */
function ExtensionCardPreview({ supplier }: { supplier: ExtensionPreviewSupplier }) {
  return (
    <figure className="tilt-card mx-auto w-full max-w-md rounded-panel border border-line bg-surface-raised p-5 shadow-lift sm:p-6">
      <figcaption className="flex items-center gap-2 border-b border-line pb-3">
        <Image src={ICON_SRC} alt="" width={28} height={28} className="h-7 w-7 rounded-pill" />
        <span className="font-mono text-micro font-bold uppercase tracking-wide text-muted">
          {site.name} found a code
        </span>
      </figcaption>
      <p className="mt-4 text-lg font-black text-content">{supplier.name}</p>
      <p className="mt-0.5 text-sm font-bold text-accent-strong">{supplier.discount}</p>
      {supplier.trustpilot ? (
        <p className="mt-2 flex items-center gap-2 text-xs font-semibold text-muted">
          <StarRating rating={supplier.trustpilot.rating} starClassName="h-3.5 w-3.5" />
          {supplier.trustpilot.rating.toFixed(1)} on Trustpilot
        </p>
      ) : null}
      <div className="mt-4 flex items-center justify-between gap-3 rounded-chip border-2 border-dashed border-accent/40 bg-accent-tint px-4 py-3">
        <span className="font-mono text-base font-black tracking-wide text-accent-strong">{supplier.code}</span>
        <span className="inline-flex items-center gap-1 text-xs font-bold text-content">
          <CopyIcon className="h-3.5 w-3.5" />
          Copy code
        </span>
      </div>
      <div className="mt-3 grid grid-cols-2 gap-2 text-xs font-bold">
        <span className="rounded-chip bg-brand px-3 py-2 text-center text-surface">Fill code</span>
        <span className="rounded-chip border border-line bg-surface px-3 py-2 text-center text-content">Not now</span>
      </div>
      <p className="mt-3 text-center text-micro text-faint">
        Preview of the card shown on the supplier&rsquo;s own store
      </p>
    </figure>
  );
}

/**
 * The PepLookup Chrome extension, described by what it actually does (see
 * the extension's own spec): a card on supported supplier stores with the
 * code, discount and Trustpilot rating, copy or fill in one click, never a
 * submitted form. `supportedCount` and `preview` come from the extension's
 * live feed; each is left out when the feed can't be read.
 */
export function ExtensionPromoSection({
  variant = 'coupons',
  supportedCount,
  preview,
  className,
}: {
  variant?: Variant;
  supportedCount: number | null;
  preview: ExtensionPreviewSupplier | null;
  className?: string;
}) {
  const copy = copyFor(variant, supportedCount);

  return (
    // Two offset panels behind the section give it a stacked, 3D depth.
    <div className={cn('relative isolate pb-4 sm:pb-6', className)}>
      <div
        aria-hidden="true"
        className="absolute inset-x-6 bottom-0 top-6 -z-20 rounded-panel bg-accent-soft/60 shadow-card sm:inset-x-12"
      />
      <div
        aria-hidden="true"
        className="absolute inset-x-3 bottom-2 top-3 -z-10 rounded-panel bg-accent-tint shadow-card sm:inset-x-6 sm:bottom-3"
      />

      <section
        id={EXTENSION_PROMO_ID}
        aria-labelledby="extension-promo-heading"
        // Focus target for the pill, which moves focus here instead of using a #hash.
        tabIndex={-1}
        className="reveal relative scroll-mt-24 overflow-hidden rounded-panel border border-accent/25 bg-gradient-to-br from-accent-tint via-surface-raised to-surface-raised px-5 py-7 shadow-panel focus:outline-none sm:px-10 sm:py-10 lg:px-12 lg:py-12"
      >
        <div aria-hidden="true" className="dot-grid pointer-events-none absolute inset-0 opacity-50" />
        <div aria-hidden="true" className="pointer-events-none absolute inset-x-0 top-0 h-px bg-white" />
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -right-16 -top-20 h-72 w-72 rounded-full bg-accent/15 blur-3xl"
        />
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -bottom-24 -left-20 h-64 w-64 rounded-full bg-brand/10 blur-3xl"
        />

        <div className="relative grid grid-cols-1 gap-8 lg:grid-cols-5 lg:items-center lg:gap-12">
          <div className="min-w-0 lg:col-span-3">
            <div className="flex items-center gap-4">
              <Image
                src={ICON_SRC}
                alt={`${chromeExtension.name} icon`}
                width={64}
                height={64}
                className="h-14 w-14 shrink-0 rounded-card shadow-lift sm:h-16 sm:w-16"
              />
              <p className="eyebrow">{copy.eyebrow}</p>
            </div>
            <h2
              id="extension-promo-heading"
              className="mt-4 text-2xl font-black leading-tight text-content sm:text-4xl"
            >
              {copy.heading}
            </h2>
            <p className="mt-3 max-w-2xl text-base leading-7 text-muted">{copy.intro}</p>

            <ul className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-2">
              {copy.points.map((point) => (
                <li
                  key={point.title}
                  className="tilt-card flex items-start gap-3 rounded-card border border-line bg-surface-raised p-4 shadow-card"
                >
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-chip bg-accent-tint text-accent-strong">
                    {point.icon}
                  </span>
                  <span className="min-w-0">
                    <span className="block text-sm font-black text-content">{point.title}</span>
                    <span className="mt-0.5 block text-sm leading-6 text-muted">{point.body}</span>
                  </span>
                </li>
              ))}
            </ul>

            <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center">
              <AddToChromeButton />
              <Link
                href="/extension"
                className="group inline-flex items-center justify-center gap-1.5 rounded-chip px-4 py-3 text-sm font-bold text-brand-strong hover:underline"
              >
                How the extension works
                <ArrowRightIcon className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </Link>
            </div>

            <p className="mt-4 text-xs leading-5 text-muted">
              Free to install. Some supplier links are affiliate links: {site.name} may earn a commission on orders
              placed through them, at no extra cost to you.
            </p>
          </div>

          {preview ? (
            <div className="lg:col-span-2">
              <ExtensionCardPreview supplier={preview} />
            </div>
          ) : null}
        </div>
      </section>
    </div>
  );
}

/** The supplier the preview shows: the first in the feed with a Trustpilot rating, else the first at all. */
export function previewSupplierFrom(
  suppliers: readonly {
    name: string;
    discount: string;
    code: string;
    trustpilot: { rating: number; reviews: number | null } | null;
  }[],
): ExtensionPreviewSupplier | null {
  const pick = suppliers.find((supplier) => supplier.trustpilot) ?? suppliers[0];
  return pick
    ? {
        name: pick.name,
        discount: pick.discount,
        code: pick.code,
        trustpilot: pick.trustpilot,
      }
    : null;
}

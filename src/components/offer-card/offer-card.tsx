import Image from 'next/image';
import Link from 'next/link';
import type { Offer, Product, Supplier } from '@/lib/schema';
import { toListing } from '@/lib/repository';
import { effectivePrice, hasDiscount, pricePerMg, discountPercent, couponAdjustedPrice, pricePerMgFor } from '@/lib/price';
import { formatMoney, formatPerMg } from '@/lib/money';
import { timeAgo, isStale } from '@/lib/format';
import { cn } from '@/lib/cn';
import { BoxIcon, ExternalIcon, FlaskIcon } from '@/components/icons/icons';
import { CopyCode } from '@/components/ui/copy-code';

interface OfferCardProps {
  offer: Offer;
  product: Product;
  supplier: Supplier;
  headingEntity: 'product' | 'supplier';
  isBestPrice?: boolean;
  /** 'row' (default) for a vendor-comparison list; 'grid' for an image tile in a catalogue grid. */
  layout?: 'row' | 'grid';
}

/**
 * One vendor's price observation for one product. Used on both the product
 * page (heading = supplier, since the product is already the page context)
 * and the supplier's product catalogue (heading = product, since the vendor
 * is already the page context), the underlying offer data is identical.
 */
export function OfferCard({
  offer,
  product,
  supplier,
  headingEntity,
  isBestPrice = false,
  layout = 'row',
}: OfferCardProps) {
  const listing = toListing(offer);
  const observedPrice = effectivePrice(listing);
  const observedDiscount = hasDiscount(listing);
  // A coupon only steps in when there's no already-recorded sale price: a
  // scraped price is a fact, a coupon is a rule, and the fact wins.
  const couponPercentOff = !observedDiscount ? (supplier.coupon?.percentOff ?? null) : null;
  const price = couponPercentOff !== null ? couponAdjustedPrice(observedPrice, couponPercentOff) : observedPrice;
  const discounted = observedDiscount || couponPercentOff !== null;
  const percentOff = discountPercent(listing) ?? couponPercentOff;
  const perMg = couponPercentOff !== null ? pricePerMgFor(price, listing) : pricePerMg(listing);
  const stale = isStale(offer.scrapedAt);
  const logo = supplier.logoUrl ?? supplier.faviconUrl;

  const buyHref = `/go?to=${encodeURIComponent(offer.productUrl)}`;
  const compareHref = `/products/${product.slug}`;

  if (layout === 'grid') {
    return (
      <li className="tilt-card group flex flex-col gap-3 rounded-card border border-line bg-surface p-4 hover:border-accent/40">
        <span className="flex h-44 w-full items-center justify-center overflow-hidden rounded-chip bg-surface-raised">
          {offer.imageUrl ? (
            <Image
              src={offer.imageUrl}
              alt=""
              width={320}
              height={320}
              className="h-full w-full object-contain transition-transform duration-200 group-hover:scale-105"
              unoptimized
            />
          ) : (
            <BoxIcon className="h-10 w-10 text-faint transition-transform duration-200 group-hover:-translate-y-1 group-hover:text-accent" />
          )}
        </span>

        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <Link
              href={compareHref}
              className="block truncate text-base font-bold text-content transition-colors hover:text-accent"
            >
              {product.name}
            </Link>
            {/* A vendor lists several sizes and kits of one compound, so each tile needs its own size. */}
            <p className="mt-0.5 text-xs text-muted">
              <span className="font-semibold text-content">Size</span>{' '}
              {offer.vialCount > 1
                ? `${(offer.vialSize / 1000).toLocaleString()} mg · ${offer.vialCount} vials`
                : `${(offer.vialSize / 1000).toLocaleString()} mg`}
            </p>
            <p className={cn('mt-0.5 flex items-center gap-1 text-xs font-semibold', offer.inStock ? 'text-ok' : 'text-danger')}>
              <span aria-hidden="true" className={cn('h-1.5 w-1.5 rounded-pill', offer.inStock ? 'bg-ok' : 'bg-danger')} />
              {offer.inStock ? 'In stock' : 'Out of stock'}
            </p>
          </div>
          <div className="shrink-0 text-right">
            <span className="inline-block rounded-pill bg-accent-tint px-2.5 py-1 text-sm font-black text-accent-strong">
              {formatMoney(price, listing.currency)}
            </span>
            {discounted ? (
              <span className="mt-1 block text-xs text-faint line-through">
                {formatMoney(listing.listPrice, listing.currency)}
              </span>
            ) : null}
            {couponPercentOff !== null && supplier.coupon ? (
              <CopyCode code={supplier.coupon.code} className="mt-1 gap-1 px-1.5 py-0.5 text-micro" />
            ) : null}
          </div>
        </div>

        <p className={cn('text-xs', stale ? 'font-semibold text-warn' : 'text-muted')}>
          {perMg !== null ? formatPerMg(perMg, listing.currency) : 'Price per mg unavailable'} · seen{' '}
          {timeAgo(offer.scrapedAt)}
        </p>

        <div className="mt-auto grid grid-cols-2 gap-2 pt-1">
          <a
            href={buyHref}
            target="_blank"
            rel="sponsored noopener"
            className="btn-3d inline-flex items-center justify-center gap-1.5 rounded-chip bg-brand px-3 py-2.5 text-sm font-bold text-surface"
          >
            Buy now
            <ExternalIcon className="h-3.5 w-3.5" />
          </a>
          <Link
            href={compareHref}
            className="inline-flex items-center justify-center rounded-chip border border-line bg-surface-raised px-3 py-2.5 text-sm font-bold text-content transition-colors hover:border-accent hover:text-accent-strong"
          >
            Compare
          </Link>
        </div>
      </li>
    );
  }

  return (
    <li className="tilt-card flex flex-col gap-3 rounded-card border border-line bg-surface-raised p-4 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex min-w-0 items-center gap-3">
        {headingEntity === 'supplier' ? (
          <>
            <span className="flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-chip border border-line bg-surface">
              {logo ? (
                <Image src={logo} alt="" width={40} height={40} className="h-full w-full object-contain" unoptimized />
              ) : (
                <span aria-hidden="true" className="text-sm font-bold text-faint">
                  {supplier.name.charAt(0)}
                </span>
              )}
            </span>
            <div className="min-w-0">
              <Link
                href={`/suppliers/${supplier.slug}`}
                className="truncate text-sm font-bold text-content hover:text-brand"
              >
                {supplier.name}
              </Link>
              <p className="truncate text-xs text-muted">
                {offer.vialCount > 1
                  ? `${(offer.vialSize / 1000).toLocaleString()} mg · ${offer.vialCount} vials`
                  : `${offer.vialCount}× ${(offer.vialSize / 1000).toLocaleString()}mg ${offer.form}`}
                {offer.labReport || offer.coaUrl ? (
                  <span className="ml-1.5 inline-flex items-center gap-0.5 text-brand-strong">
                    <FlaskIcon className="h-3 w-3" /> COA
                  </span>
                ) : null}
              </p>
            </div>
          </>
        ) : (
          <div className="min-w-0">
            <Link
              href={compareHref}
              className="truncate text-sm font-bold text-content hover:text-brand"
            >
              {product.name}
            </Link>
            <p className="truncate text-xs text-muted">
              {offer.vialCount > 1
                ? `${(offer.vialSize / 1000).toLocaleString()} mg · ${offer.vialCount} vials`
                : `${offer.vialCount}× ${(offer.vialSize / 1000).toLocaleString()}mg ${offer.form}`}
              {offer.labReport || offer.coaUrl ? (
                <span className="ml-1.5 inline-flex items-center gap-0.5 text-brand-strong">
                  <FlaskIcon className="h-3 w-3" /> COA
                </span>
              ) : null}
            </p>
          </div>
        )}
        {isBestPrice ? (
          <span className="shrink-0 rounded-pill bg-brand px-2 py-0.5 text-micro font-bold uppercase text-surface">
            Best price
          </span>
        ) : null}
      </div>

      <div className="flex shrink-0 items-center justify-between gap-4 sm:justify-end">
        <div className="text-right">
          <div className="flex items-baseline justify-end gap-1.5">
            {discounted ? (
              <span className="text-xs text-faint line-through">{formatMoney(listing.listPrice, listing.currency)}</span>
            ) : null}
            <span className="text-base font-bold text-content">{formatMoney(price, listing.currency)}</span>
            {percentOff !== null ? (
              <span className="text-micro font-bold text-promo">-{percentOff}%</span>
            ) : null}
          </div>
          <p className="text-xs text-muted">
            {perMg !== null ? formatPerMg(perMg, listing.currency) : 'Price per mg unavailable'}
          </p>
          <p className={`text-micro ${stale ? 'font-bold text-warn' : 'text-faint'}`}>
            {offer.inStock ? 'In stock' : 'Out of stock'} · seen {timeAgo(offer.scrapedAt)}
          </p>
          {/* Price above already has the coupon applied, so this tells the buyer which code earns it. */}
          {couponPercentOff !== null && supplier.coupon ? (
            <CopyCode code={supplier.coupon.code} className="mt-1 gap-1 px-1.5 py-0.5 text-micro" />
          ) : null}
        </div>

        <a
          href={buyHref}
          target="_blank"
          rel="sponsored noopener"
          className="btn-3d inline-flex shrink-0 items-center gap-1.5 rounded-chip bg-brand px-3 py-2.5 text-sm font-bold text-surface"
        >
          View offer
          <ExternalIcon className="h-3.5 w-3.5" />
        </a>
      </div>
    </li>
  );
}

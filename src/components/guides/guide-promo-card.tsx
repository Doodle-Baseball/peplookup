import Image from 'next/image';
import type { PromotedSupplier } from '@/lib/promoted-supplier';
import { SupplierLogo } from '@/components/ui/supplier-logo';
import { GuidePromoActions } from './guide-promo-actions';

/**
 * Sidebar coupon card for the promoted supplier. Every value comes from the
 * supplier's live record and listings; without a coupon there is nothing to
 * offer here, so the card isn't rendered.
 */
export function GuidePromoCard({
  promo,
  product,
}: {
  promo: PromotedSupplier;
  /** One of the supplier's in-stock products, for the artwork; the logo stands in without one. */
  product: { name: string; imageUrl: string } | null;
}) {
  if (!promo.coupon) return null;
  const { code, percentOff } = promo.coupon;

  return (
    <section
      aria-label={`${percentOff}% off at ${promo.name}`}
      className="panel-dark tilt-card group/promo overflow-hidden rounded-panel p-5 ring-1 ring-white/10"
    >
      <div className="relative flex h-40 items-center justify-center overflow-hidden rounded-card bg-white">
        {product ? (
          <Image
            src={product.imageUrl}
            alt={`${product.name} from ${promo.name}`}
            width={160}
            height={160}
            unoptimized
            referrerPolicy="no-referrer"
            className="vial-3d vial-3d-matte relative z-0 h-32 w-32 object-contain transition-transform duration-300 group-hover/promo:scale-105"
          />
        ) : (
          <SupplierLogo src={promo.logoUrl} name={promo.name} size={64} className="h-16 w-16" />
        )}
        <span aria-hidden="true" className="vial-3d-shadow absolute bottom-2 h-3 w-24 rounded-pill" />
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-2">
        <p className="eyebrow">{promo.name}</p>
        <span className="inline-flex items-center gap-1.5 rounded-pill border border-white/15 bg-white/10 px-2.5 py-0.5 text-xs font-bold text-white">
          <span aria-hidden="true" className="h-1.5 w-1.5 rounded-pill bg-ok" />
          {percentOff}% OFF
        </span>
      </div>
      <p className="mt-2 text-lg font-black leading-snug text-white">
        Save {percentOff}% at {promo.name}
      </p>

      <GuidePromoActions code={code} shopUrl={promo.shopUrl} supplierName={promo.name} />

      <p className="mt-3 text-center text-micro font-semibold uppercase tracking-wide text-white/50">
        Affiliate link · we may earn a commission
      </p>
    </section>
  );
}

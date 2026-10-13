import type { Supplier } from '@/lib/schema';
import { site } from '@/config/site';
import { SupplierLogo } from '@/components/ui/supplier-logo';
import { ExternalIcon, StarIcon } from '@/components/icons/icons';

/**
 * Site-wide strip above the navbar for the supplier marked Featured in the
 * admin. Featured is an editorial pick, not a score, so the bar labels it as
 * such and shows only facts held for the supplier (country, coupon); with no
 * featured supplier it renders nothing. The whole bar is one link to the
 * supplier's own site, the same affiliate link the supplier cards' "Visit
 * Site" button uses, so it carries the same sponsored rel and disclosure.
 */
export function FeaturedSupplierBar({ suppliers }: { suppliers: readonly Supplier[] }) {
  const featured = suppliers.find((supplier) => supplier.isFeatured);
  if (!featured) return null;

  const coupon = featured.coupon;

  return (
    <aside aria-label="Featured supplier">
      <a
        href={featured.affiliateUrl || featured.homepageUrl}
        target="_blank"
        rel="nofollow noopener noreferrer sponsored"
        title={`Visit ${featured.name}. An editorial pick by ${site.name}; this is an affiliate link. Featured placement does not change prices or price-per-mg rankings.`}
        className="group relative block overflow-hidden bg-gradient-to-r from-accent-strong via-accent to-accent-strong text-surface-raised focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-accent-soft"
      >
        {/* Soft light sheen behind the content; decorative only. */}
        <span
          aria-hidden="true"
          className="pointer-events-none absolute inset-y-0 left-1/2 w-2/3 -translate-x-1/2 bg-gradient-to-r from-transparent via-surface-raised/10 to-transparent"
        />
        <span className="relative mx-auto flex max-w-shell flex-wrap items-center justify-center gap-x-4 gap-y-2 px-4 py-2 text-sm">
          <span className="inline-flex items-center gap-1 rounded-pill border border-accent-soft/60 bg-accent-strong/60 px-2.5 py-1 text-micro font-black uppercase tracking-wide">
            <StarIcon className="h-3 w-3 fill-current text-accent-soft" />
            Featured supplier
          </span>

          <span className="flex items-center gap-2 font-bold">
            <SupplierLogo
              src={featured.logoUrl ?? featured.faviconUrl}
              name={featured.name}
              size={24}
              className="h-6 w-6 rounded-chip bg-surface-raised"
              initialClassName="text-xs text-accent-strong"
            />
            {featured.name}
            {featured.country ? (
              <span className="hidden font-normal text-surface-raised/80 sm:inline">· {featured.country}</span>
            ) : null}
          </span>

          {coupon ? (
            <span className="hidden items-center gap-1.5 md:inline-flex">
              <span className="text-surface-raised/80">{coupon.percentOff}% off with code</span>
              <span className="rounded-chip border border-dashed border-accent-soft/70 bg-accent-tint px-2 py-0.5 font-mono text-xs font-bold uppercase text-accent-strong">
                {coupon.code}
              </span>
            </span>
          ) : null}

          <span className="inline-flex items-center gap-1.5 rounded-pill bg-surface-raised px-3.5 py-1 text-xs font-bold text-accent-strong transition-colors group-hover:bg-accent-tint">
            Visit website
            <ExternalIcon className="h-3.5 w-3.5" />
          </span>
        </span>
      </a>
    </aside>
  );
}

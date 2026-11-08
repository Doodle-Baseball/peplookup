import type { ReactNode } from 'react';
import Link from 'next/link';
import { cn } from '@/lib/cn';
import { ArrowRightIcon, ExternalIcon } from '@/components/icons/icons';
import type { GlanceRow } from '@/lib/supplier-page-rewrite';

/** Same panel and heading treatment as the supplier page's other content boxes. */
const PANEL_CLASS = 'rounded-panel border border-line bg-surface-raised shadow-card';
const BOX_CLASS = cn(PANEL_CLASS, 'reveal min-w-0 scroll-mt-24 p-5 sm:p-8 lg:p-10');
const H2_CLASS = 'mt-3 text-2xl font-black leading-tight text-content break-words sm:text-3xl lg:text-4xl';
const LINK_CLASS = 'group inline-flex items-center gap-1.5 text-sm font-bold text-accent-strong hover:underline';

/** "About {name}" with the name accented, as the other boxes accent the vendor. */
function Heading({ id, before, name, after }: { id: string; before?: string; name: string; after?: string }) {
  return (
    <h2 id={id} className={H2_CLASS}>
      {before ? `${before} ` : null}
      <span className="text-accent">{name}</span>
      {after ? ` ${after}` : null}
    </h2>
  );
}

function ArrowLink({ href, children }: { href: string; children: ReactNode }) {
  return (
    <Link href={href} className={LINK_CLASS}>
      {children}
      <ArrowRightIcon className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
    </Link>
  );
}

export function SupplierGlance({ name, rows, className }: { name: string; rows: readonly GlanceRow[]; className?: string }) {
  if (rows.length === 0) return null;
  return (
    <section aria-labelledby="glance-heading" className={cn(BOX_CLASS, className)}>
      <p className="eyebrow">At a glance</p>
      <Heading id="glance-heading" name={name} after="at a glance" />
      <div className="mt-5 overflow-x-auto rounded-card border border-line">
        <table className="w-full border-collapse text-sm sm:text-base">
          <tbody className="divide-y divide-line">
            {rows.map((row) => (
              <tr key={row.label}>
                <th scope="row" className="w-1/3 bg-accent-tint px-4 py-3 text-left font-mono text-micro font-bold uppercase tracking-wide text-accent-strong">
                  {row.label}
                </th>
                <td className="px-4 py-3 font-bold text-content">
                  {row.href ? (
                    <a href={row.href} target="_blank" rel="noopener" className="inline-flex items-center gap-1 hover:underline">
                      {row.value}
                      <ExternalIcon className="h-3.5 w-3.5 shrink-0" />
                    </a>
                  ) : (
                    row.value
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}

export function SupplierAbout({ name, paragraphs, className }: { name: string; paragraphs: readonly string[]; className?: string }) {
  return (
    <section aria-labelledby="about-heading" className={cn(BOX_CLASS, className)}>
      <p className="eyebrow">Overview</p>
      <Heading id="about-heading" before="About" name={name} />
      <div className="mt-4 max-w-6xl space-y-4 text-sm leading-7 text-muted break-words sm:text-base">
        {paragraphs.map((paragraph) => (
          <p key={paragraph}>{paragraph}</p>
        ))}
      </div>
    </section>
  );
}

export function SupplierCouponSection({
  name,
  text,
  couponPath,
  reviewsPath,
  className,
}: {
  name: string;
  text: string;
  couponPath: string;
  /** This supplier's reviews page, when it has one; the link is left out otherwise. */
  reviewsPath: string | null;
  className?: string;
}) {
  return (
    <section aria-labelledby="coupon-heading" className={cn(BOX_CLASS, className)}>
      <p className="eyebrow">Coupon</p>
      <Heading id="coupon-heading" name={name} after="coupon code" />
      <p className="mt-4 max-w-6xl text-sm leading-7 text-muted sm:text-base">{text}</p>
      <div className="mt-5 flex flex-wrap gap-x-6 gap-y-2">
        <ArrowLink href={couponPath}>More about this code</ArrowLink>
        {reviewsPath ? <ArrowLink href={reviewsPath}>What do other buyers say?</ArrowLink> : null}
      </div>
    </section>
  );
}

/** The price table's intro and its "See all price comparisons" link, for SupplierPriceComparison. */
export function ComparisonIntro({ text }: { text: string }) {
  return <p className="mt-3 max-w-6xl text-sm leading-7 text-muted sm:text-base">{text}</p>;
}

export function ComparisonFooter() {
  return (
    <div className="px-5 pb-5 pt-4 sm:px-8 sm:pb-8">
      <ArrowLink href="/price-checker">See all price comparisons</ArrowLink>
    </div>
  );
}

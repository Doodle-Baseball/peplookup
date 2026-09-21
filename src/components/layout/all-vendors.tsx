import Link from 'next/link';
import type { Supplier } from '@/lib/schema';
import { cn } from '@/lib/cn';
import { ChevronDownIcon } from '@/components/icons/icons';
import { SupplierLogo } from '@/components/ui/supplier-logo';

/**
 * Two rows of the widest (5-column) layout. This section sits above the footer
 * on every page, so showing all vendors up front added ~3,000px of scrolling to
 * every page on a phone.
 */
const INITIAL_VISIBLE_VENDORS = 10;

/**
 * Full A–Z supplier directory shown above the newsletter section. Pulls straight
 * from the supplier list passed in, every listed vendor appears automatically,
 * nothing curated or hand-picked here.
 */
export function AllVendors({ suppliers }: { suppliers: readonly Supplier[] }) {
  if (suppliers.length === 0) return null;

  const sorted = [...suppliers].sort((a, b) => a.name.localeCompare(b.name));
  const visible = sorted.slice(0, INITIAL_VISIBLE_VENDORS);
  const collapsed = sorted.slice(INITIAL_VISIBLE_VENDORS);

  return (
    <section className="reveal mx-auto max-w-shell px-4 py-12 sm:py-16">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="eyebrow">The directory</p>
          <h2 className="mt-3 text-[clamp(2rem,5vw,3.25rem)] font-black leading-[0.95] text-content">
            All <span className="text-accent">vendors.</span>
          </h2>
        </div>
        <p className="font-mono text-xs uppercase tracking-[0.15em] text-muted">{sorted.length} listed</p>
      </div>

      <VendorGrid suppliers={visible} className="mt-8" />

      {collapsed.length > 0 ? (
        // Native <details> needs no client JS, and the collapsed links stay in
        // the HTML so crawlers still reach every supplier page.
        //
        // Named group ("group/vendors"): hovering any card inside bubbles :hover
        // up to this <details> too, and a plain unnamed `group` here would make
        // Tailwind's `.group:hover .group-hover\:*` selector match every card's
        // text at once, not just the one actually under the pointer.
        <details className="group/vendors">
          <summary className="mx-auto mt-5 flex w-fit cursor-pointer list-none items-center gap-2 rounded-pill border border-line bg-surface-raised px-5 py-2.5 text-sm font-bold text-content shadow-card transition-colors hover:border-brand">
            <span className="group-open/vendors:hidden">Show all {sorted.length} vendors</span>
            <span className="hidden group-open/vendors:inline">Show fewer vendors</span>
            <ChevronDownIcon className="h-4 w-4 transition-transform group-open/vendors:rotate-180" />
          </summary>
          <VendorGrid suppliers={collapsed} className="mt-5" />
        </details>
      ) : null}
    </section>
  );
}

function VendorGrid({ suppliers, className }: { suppliers: readonly Supplier[]; className?: string }) {
  return (
    <ul className={cn('grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5', className)}>
      {suppliers.map((supplier) => (
        <li key={supplier.slug} className="min-w-0">
          <Link
            href={`/suppliers/${supplier.slug}`}
            className="card-3d group flex min-w-0 items-center gap-2.5 rounded-card border border-line bg-surface-raised p-2.5 transition-colors hover:border-brand hover:bg-brand sm:gap-3 sm:p-3"
          >
            <SupplierLogo
              src={supplier.logoUrl ?? supplier.faviconUrl}
              name={supplier.name}
              size={40}
              className="card-3d-layer h-9 w-9 rounded-chip bg-surface transition-colors group-hover:border-white/40 group-hover:bg-white sm:h-10 sm:w-10"
            />
            <span className="truncate text-sm font-bold text-content transition-colors group-hover:text-white sm:text-base">
              {supplier.name}
            </span>
          </Link>
        </li>
      ))}
    </ul>
  );
}

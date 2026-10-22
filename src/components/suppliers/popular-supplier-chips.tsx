'use client';

import { cn } from '@/lib/cn';
import { SupplierLogo } from '@/components/ui/supplier-logo';
import { useSupplierDirectory } from './supplier-directory-state';

export interface PopularSupplier {
  slug: string;
  name: string;
  logoUrl: string | null;
}

/** Quick-pick chips under the directory search; each one searches for that supplier. */
export function PopularSupplierChips({ suppliers }: { suppliers: readonly PopularSupplier[] }) {
  const { query, setQuery } = useSupplierDirectory();

  return (
    <div className="mt-5 border-t border-line pt-4">
      <p className="eyebrow">Popular suppliers</p>
      {/* overflow-x-auto also clips vertically, so the top/side padding gives the
          hover lift and the pills' borders room; the negative margin and reduced
          mt keep the row exactly where it sat. */}
      <ul className="scrollbar-hide -mx-1 mt-2 flex flex-nowrap gap-2 overflow-x-auto px-1 pb-1 pt-1">
        {suppliers.map((supplier) => {
          const isActive = query.trim().toLowerCase() === supplier.name.toLowerCase();
          return (
            <li key={supplier.slug} className="shrink-0">
              <button
                type="button"
                onClick={() => setQuery(supplier.name)}
                aria-pressed={isActive}
                className={cn(
                  'inline-flex items-center gap-2 rounded-pill border py-1.5 pl-1.5 pr-3.5 text-sm font-semibold transition-all duration-200 hover:-translate-y-0.5',
                  isActive
                    ? 'border-brand bg-brand text-surface'
                    : 'border-line bg-surface text-content hover:border-accent hover:bg-accent-tint hover:text-accent-strong',
                )}
              >
                {/* `border-0` overrides SupplierLogo's own default border: left as-is,
                    it sits right at the pill's tight left padding and its fixed grey
                    ring doesn't update on hover, reading as a broken/notched border
                    where the two overlap. */}
                <SupplierLogo
                  src={supplier.logoUrl}
                  name={supplier.name}
                  size={24}
                  className="h-6 w-6 rounded-full border-0"
                  initialClassName="text-micro"
                />
                {supplier.name}
              </button>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

import Link from 'next/link';
import { getProducts, getSuppliers } from '@/lib/repository';
import { SearchIcon, ArrowRightIcon } from '@/components/icons/icons';
import { Newsletter } from '@/components/layout/newsletter';

export default async function HomePage() {
  const [products, suppliers] = await Promise.all([getProducts(), getSuppliers()]);

  return (
    <>
      <section className="mx-auto max-w-shell px-4 py-16 text-center">
        <h1 className="text-4xl font-black tracking-tight text-content sm:text-6xl">
          Compare Peptide Prices by <span className="italic text-brand">Cost per mg.</span>
        </h1>
        <p className="mx-auto mt-4 max-w-2xl text-base text-muted sm:text-lg">
          Every listed price normalised to a single comparable unit, with the vendor and the time we
          observed it attached.
        </p>

        <form action="/" className="mx-auto mt-8 max-w-2xl">
          <label htmlFor="q" className="sr-only">
            Search peptides
          </label>
          <div className="flex items-center gap-3 rounded-card border border-line bg-surface-raised px-4 py-3">
            <SearchIcon className="h-5 w-5 shrink-0 text-brand" />
            <input
              id="q"
              name="q"
              type="search"
              placeholder="Search peptides by name…"
              className="min-w-0 flex-1 bg-transparent text-base text-content outline-none placeholder:text-faint"
            />
          </div>
        </form>
      </section>

      <section className="mx-auto max-w-shell px-4 pb-12">
        <h2 className="text-micro font-bold uppercase text-faint">Popular compounds</h2>
        <ul className="mt-3 flex flex-wrap gap-2">
          {products.map((product) => (
            <li key={product.slug}>
              <Link
                href={`/products/${product.slug}`}
                className="inline-block rounded-pill border border-line bg-surface-raised px-4 py-2 text-sm font-semibold text-content hover:border-brand hover:text-brand"
              >
                {product.name}
              </Link>
            </li>
          ))}
        </ul>
      </section>

      <section className="mx-auto max-w-shell px-4 pb-4">
        <div className="rounded-card border border-line bg-surface-raised p-8">
          <h2 className="text-xl font-black text-content">No prices published yet</h2>
          <p className="mt-2 max-w-2xl text-sm text-muted">
            {suppliers.length} supplier{suppliers.length === 1 ? '' : 's'} are listed, but no vendor
            prices have been observed yet. Prices appear here once the crawler records them from a
            live vendor page, each stamped with the time it was seen. We never publish a price we
            have not observed.
          </p>
          <Link
            href="/suppliers"
            className="mt-5 inline-flex items-center gap-2 rounded-chip bg-brand px-5 py-3 text-sm font-bold text-white hover:bg-brand-strong"
          >
            Browse suppliers
            <ArrowRightIcon className="h-4 w-4" />
          </Link>
        </div>
      </section>

      <Newsletter />
    </>
  );
}

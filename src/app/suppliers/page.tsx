import type { Metadata } from 'next';
import { getSuppliers, countProductsForSupplier } from '@/lib/repository';
import { SupplierCard } from '@/components/supplier-card/supplier-card';
import { Newsletter } from '@/components/layout/newsletter';
import { BoltIcon, SearchIcon } from '@/components/icons/icons';

export const metadata: Metadata = {
  title: 'Peptide Suppliers Directory — Verified & Compared',
  description:
    'Browse verified peptide suppliers and compare trust ratings, lab grades, shipping, payment methods and discount codes.',
  alternates: { canonical: '/suppliers' },
};

const POPULAR_QUERIES = [
  'Elevate Research Co',
  'Peptime',
  'Refined Bio Labs',
];

export default async function SuppliersPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  // Search state lives in the URL (?q=) rather than component state, so a
  // filtered view is a link someone can share or bookmark.
  const { q } = await searchParams;
  const query = (q ?? '').trim();

  const suppliers = await getSuppliers();
  const filtered = query
    ? suppliers.filter((s) => s.name.toLowerCase().includes(query.toLowerCase()))
    : suppliers;
  const counts = await Promise.all(filtered.map((s) => countProductsForSupplier(s.slug)));

  return (
    <>
      <section className="mx-auto max-w-shell px-4 py-14 text-center">
        <h1 className="text-4xl font-black tracking-tight text-content sm:text-6xl">
          Find the Best <span className="italic text-brand">Peptide Suppliers.</span>
        </h1>
        <p className="mx-auto mt-4 max-w-2xl text-base text-muted sm:text-lg">
          Compare prices, shipping, payment options and verification grades from listed vendors.
        </p>

        <form action="/suppliers" method="get" className="mx-auto mt-8 max-w-2xl">
          <label htmlFor="supplier-search" className="sr-only">
            Search suppliers by name
          </label>
          <div className="flex items-center gap-3 rounded-card border border-line bg-surface-raised px-4 py-3 shadow-card transition-shadow focus-within:shadow-lift">
            <SearchIcon className="h-5 w-5 shrink-0 text-brand" />
            <input
              id="supplier-search"
              name="q"
              type="search"
              defaultValue={query}
              placeholder="Search suppliers by name…"
              className="min-w-0 flex-1 bg-transparent text-base text-content outline-none placeholder:text-faint"
            />
            <button
              type="submit"
              className="shrink-0 rounded-chip bg-brand px-4 py-2 text-sm font-bold text-white transition-colors hover:bg-brand-strong"
            >
              Search
            </button>
          </div>
        </form>

        <div className="mx-auto mt-4 flex max-w-2xl flex-wrap items-center justify-center gap-2">
          <span className="text-xs font-semibold uppercase text-faint">Popular:</span>
          {POPULAR_QUERIES.map((name) => (
            <a
              key={name}
              href={`/suppliers?q=${encodeURIComponent(name)}`}
              className="rounded-pill border border-line bg-surface px-3 py-1.5 text-xs font-semibold text-content hover:border-brand hover:text-brand"
            >
              {name}
            </a>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-shell px-4 pb-8">
        <div className="mb-5 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <BoltIcon className="h-5 w-5 text-brand" />
            <h2 className="text-xl font-black text-content">
              {filtered.length} {filtered.length === 1 ? 'Result' : 'Results'}
              {query ? <span className="font-medium text-muted"> for &ldquo;{query}&rdquo;</span> : null}
            </h2>
          </div>
          {query ? (
            <a href="/suppliers" className="text-sm font-semibold text-brand hover:underline">
              Clear search
            </a>
          ) : null}
        </div>

        {filtered.length === 0 ? (
          <p className="rounded-card border border-dashed border-line bg-surface-raised p-12 text-center text-muted">
            {query
              ? `No suppliers match "${query}".`
              : 'No suppliers listed yet.'}
          </p>
        ) : (
          <ul className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
            {filtered.map((supplier, index) => (
              <li key={supplier.slug}>
                <SupplierCard supplier={supplier} productCount={counts[index] ?? 0} />
              </li>
            ))}
          </ul>
        )}
      </section>

      <Newsletter />
    </>
  );
}

import type { Metadata } from 'next';
import { getSuppliers, countProductsForSupplier } from '@/lib/repository';
import { SupplierCard } from '@/components/supplier-card/supplier-card';
import { Newsletter } from '@/components/layout/newsletter';
import { BoltIcon } from '@/components/icons/icons';

export const metadata: Metadata = {
  title: 'Peptide Suppliers Directory — Verified & Compared',
  description:
    'Browse verified peptide suppliers and compare trust ratings, lab grades, shipping, payment methods and discount codes.',
  alternates: { canonical: '/suppliers' },
};

export default async function SuppliersPage() {
  const suppliers = await getSuppliers();
  const counts = await Promise.all(suppliers.map((s) => countProductsForSupplier(s.slug)));

  return (
    <>
      <section className="mx-auto max-w-shell px-4 py-14 text-center">
        <h1 className="text-4xl font-black tracking-tight text-content sm:text-6xl">
          Find the Best <span className="italic text-brand">Peptide Suppliers.</span>
        </h1>
        <p className="mx-auto mt-4 max-w-2xl text-base text-muted sm:text-lg">
          Compare prices, shipping, payment options and verification grades from listed vendors.
        </p>
      </section>

      <section className="mx-auto max-w-shell px-4 pb-8">
        <div className="mb-5 flex items-center gap-2">
          <BoltIcon className="h-5 w-5 text-brand" />
          <h2 className="text-xl font-black text-content">
            {suppliers.length} {suppliers.length === 1 ? 'Result' : 'Results'}
          </h2>
        </div>

        {suppliers.length === 0 ? (
          <p className="rounded-card border border-dashed border-line bg-surface-raised p-12 text-center text-muted">
            No suppliers listed yet.
          </p>
        ) : (
          <ul className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
            {suppliers.map((supplier, index) => (
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

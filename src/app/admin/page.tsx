import type { Metadata } from 'next';
import Link from 'next/link';
import { getSuppliers, getProducts, countProductsForSupplier } from '@/lib/repository';
import { isSupabaseConfigured, supabaseUrl } from '@/lib/supabase/config';
import { Badge } from '@/components/ui/badge';
import { LogoutButton } from '@/components/admin/logout-button';
import { BoxIcon, CheckIcon, WarningIcon } from '@/components/icons/icons';

export const metadata: Metadata = {
  title: 'Admin — PepLookup',
  robots: { index: false, follow: false },
};

function StatCard({ label, value, hint }: { label: string; value: string; hint?: string }) {
  return (
    <div className="rounded-card border border-line bg-surface-raised p-5">
      <p className="text-micro font-bold uppercase text-faint">{label}</p>
      <p className="mt-1 text-3xl font-black text-content">{value}</p>
      {hint ? <p className="mt-1 text-xs text-muted">{hint}</p> : null}
    </div>
  );
}

export default async function AdminDashboardPage() {
  const [suppliers, products] = await Promise.all([getSuppliers(), getProducts()]);
  const counts = await Promise.all(suppliers.map((s) => countProductsForSupplier(s.slug)));
  const totalOffers = counts.reduce((sum, n) => sum + n, 0);
  const suppliersWithCoupons = suppliers.filter((s) => s.coupon !== null).length;

  const supabaseReady = isSupabaseConfigured();
  const url = supabaseUrl();

  return (
    <div className="mx-auto max-w-shell px-4 py-10">
      <header className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-content">Admin dashboard</h1>
          <p className="mt-1 text-sm text-muted">
            Read-only monitoring. Supplier and price data still comes from the seed files in the
            repository until the database is wired up as the source of truth.
          </p>
        </div>
        <LogoutButton />
      </header>

      <section className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Suppliers" value={String(suppliers.length)} />
        <StatCard label="Products tracked" value={String(products.length)} />
        <StatCard
          label="Live price offers"
          value={String(totalOffers)}
          hint={totalOffers === 0 ? 'No prices crawled yet' : undefined}
        />
        <StatCard label="Active coupons" value={String(suppliersWithCoupons)} />
      </section>

      <section className="mt-10 rounded-card border border-line bg-surface-raised p-6">
        <h2 className="text-lg font-black text-content">Database connection</h2>
        <div className="mt-4 flex flex-wrap items-center gap-3">
          {supabaseReady ? (
            <Badge tone="ok" icon={<CheckIcon className="h-3 w-3" />}>
              Supabase configured
            </Badge>
          ) : (
            <Badge tone="danger" icon={<WarningIcon className="h-3 w-3" />}>
              Not configured
            </Badge>
          )}
          <span className="text-sm text-muted">{url ?? 'NEXT_PUBLIC_SUPABASE_URL is not set'}</span>
        </div>
        <p className="mt-3 max-w-2xl text-sm text-muted">
          The client is wired (<code className="rounded bg-surface-sunken px-1 py-0.5">src/lib/supabase</code>),
          reading <code className="rounded bg-surface-sunken px-1 py-0.5">NEXT_PUBLIC_SUPABASE_URL</code>,{' '}
          <code className="rounded bg-surface-sunken px-1 py-0.5">NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY</code> and,
          server-side only, <code className="rounded bg-surface-sunken px-1 py-0.5">SUPABASE_SECRET_KEY</code>. No
          schema has been created in the project yet, so the site still reads suppliers and offers from
          the static seed files rather than the database. Set these three variables in Vercel → Project
          Settings → Environment Variables, then migrate <code className="rounded bg-surface-sunken px-1 py-0.5">src/lib/repository.ts</code> to
          query Supabase once the tables exist.
        </p>
      </section>

      <section className="mt-10">
        <h2 className="text-lg font-black text-content">Suppliers</h2>
        <div className="mt-4 overflow-x-auto rounded-card border border-line">
          <table className="w-full min-w-[48rem] border-collapse bg-surface-raised text-sm">
            <thead>
              <tr className="border-b border-line text-left">
                <th scope="col" className="px-4 py-3 font-bold">Supplier</th>
                <th scope="col" className="px-4 py-3 font-bold">Slug</th>
                <th scope="col" className="px-4 py-3 font-bold">Offers</th>
                <th scope="col" className="px-4 py-3 font-bold">Coupon</th>
                <th scope="col" className="px-4 py-3 font-bold">Affiliate link</th>
              </tr>
            </thead>
            <tbody>
              {suppliers.map((supplier, index) => (
                <tr key={supplier.slug} className="border-b border-line last:border-0">
                  <th scope="row" className="px-4 py-3 text-left font-semibold">
                    <Link href={`/suppliers/${supplier.slug}`} className="hover:text-brand">
                      {supplier.name}
                    </Link>
                  </th>
                  <td className="px-4 py-3 font-mono text-xs text-muted">{supplier.slug}</td>
                  <td className="px-4 py-3">
                    <span className="inline-flex items-center gap-1">
                      <BoxIcon className="h-3.5 w-3.5 text-faint" />
                      {counts[index] ?? 0}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    {supplier.coupon ? (
                      <span className="font-mono text-xs text-promo">
                        {supplier.coupon.code} ({supplier.coupon.percentOff}%)
                      </span>
                    ) : (
                      <span className="text-faint">—</span>
                    )}
                  </td>
                  <td className="max-w-[16rem] truncate px-4 py-3 text-xs text-muted">
                    {supplier.affiliateUrl}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="mt-3 text-xs text-muted">
          Supplier records are edited in{' '}
          <code className="rounded bg-surface-sunken px-1 py-0.5">src/data/suppliers.ts</code> for now.
          A database-backed edit form is the natural next step once Supabase holds this table.
        </p>
      </section>
    </div>
  );
}

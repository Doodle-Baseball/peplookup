import type { Metadata } from 'next';
import type { ReactNode } from 'react';
import Link from 'next/link';
import { getSuppliers, getProducts, countProductsForSupplier } from '@/lib/repository';
import { getSupabaseServerClient } from '@/lib/supabase/server';
import { fetchSuppliersFromDb } from '@/lib/supabase/suppliers';
import { AdminPageHeader } from '@/components/admin/page-header';
import { cn } from '@/lib/cn';
import {
  ArrowRightIcon,
  BoltIcon,
  FlaskIcon,
  SearchIcon,
  StoreIcon,
  TagIcon,
} from '@/components/icons/icons';

export const metadata: Metadata = {
  title: 'Admin',
  robots: { index: false, follow: false },
};

const PRIMARY_ACTION_CLASS =
  'inline-flex items-center gap-1.5 rounded-chip bg-brand px-4 py-2.5 text-sm font-bold text-surface transition-colors hover:bg-brand-strong';

const SECONDARY_ACTION_CLASS =
  'inline-flex items-center gap-1.5 rounded-chip border border-line bg-surface px-4 py-2.5 text-sm font-bold text-content transition-colors hover:border-accent hover:bg-accent-tint hover:text-accent-strong';

function StatCard({
  icon,
  label,
  value,
  hint,
  featured,
}: {
  icon: ReactNode;
  label: string;
  value: string;
  hint?: string;
  featured?: boolean;
}) {
  return (
    <div
      className={cn(
        'rounded-card border p-5 transition-all duration-150 hover:-translate-y-0.5 hover:shadow-card',
        featured ? 'border-accent/30 bg-accent-tint' : 'border-line bg-surface-raised',
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <p className="text-micro font-bold uppercase text-faint">{label}</p>
        <span
          className={cn(
            'flex h-8 w-8 shrink-0 items-center justify-center rounded-chip',
            featured ? 'bg-accent text-surface' : 'bg-accent-tint text-accent-strong',
          )}
        >
          {icon}
        </span>
      </div>
      <p className={cn('mt-2 text-3xl font-black', featured ? 'text-accent-strong' : 'text-content')}>{value}</p>
      <p className="mt-1 text-xs text-muted">{hint ?? ' '}</p>
    </div>
  );
}

function SectionCard({
  icon,
  title,
  description,
  primary,
  secondary,
}: {
  icon: ReactNode;
  title: string;
  description: string;
  primary: { label: string; href: string };
  secondary?: { label: string; href: string };
}) {
  return (
    <div className="flex flex-col rounded-card border border-line bg-surface-raised p-4 sm:p-6 transition-colors hover:border-accent/40">
      <div className="flex items-center gap-3">
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-chip bg-accent-tint text-accent-strong">
          {icon}
        </span>
        <h2 className="text-lg font-black text-content">{title}</h2>
      </div>

      <p className="mt-3 flex-1 text-sm leading-relaxed text-muted">{description}</p>

      <div className="mt-5 flex flex-wrap items-center gap-2.5">
        {/* The labels repeat across cards, so each link carries its section
            name for anyone listing links out of context. */}
        <Link href={primary.href} className={PRIMARY_ACTION_CLASS}>
          {primary.label}
          <span className="sr-only">: {title}</span>
          <ArrowRightIcon className="h-3.5 w-3.5" />
        </Link>
        {secondary ? (
          <Link href={secondary.href} className={SECONDARY_ACTION_CLASS}>
            {secondary.label}
            <span className="sr-only">: {title}</span>
          </Link>
        ) : null}
      </div>
    </div>
  );
}

export default async function AdminDashboardPage() {
  const [suppliers, products] = await Promise.all([getSuppliers(), getProducts()]);
  const counts = await Promise.all(suppliers.map((s) => countProductsForSupplier(s.slug)));
  const totalOffers = counts.reduce((sum, n) => sum + n, 0);
  const suppliersWithCoupons = suppliers.filter((s) => s.coupon !== null).length;
  const labVerifiedSuppliers = suppliers.filter((s) => s.labVerified).length;

  const client = getSupabaseServerClient();
  const schemaReady = client ? (await fetchSuppliersFromDb(client, { includeInactive: true })) !== null : false;

  return (
    <>
      <AdminPageHeader title="Overview" />

      <div className="px-4 py-6 sm:px-8 sm:py-8">
        <section aria-labelledby="stats-heading">
          <h2 id="stats-heading" className="text-micro font-bold uppercase tracking-wide text-faint">
            At a glance
          </h2>
          <div className="mt-3 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <StatCard
              featured
              icon={<StoreIcon className="h-4 w-4" />}
              label="Suppliers"
              value={String(suppliers.length)}
              hint={`${labVerifiedSuppliers} lab verified`}
            />
            <StatCard
              icon={<FlaskIcon className="h-4 w-4" />}
              label="Products tracked"
              value={String(products.length)}
            />
            <StatCard
              icon={<BoltIcon className="h-4 w-4" />}
              label="Live price offers"
              value={String(totalOffers)}
              hint={totalOffers === 0 ? 'No prices crawled yet' : undefined}
            />
            <StatCard
              icon={<TagIcon className="h-4 w-4" />}
              label="Active coupons"
              value={String(suppliersWithCoupons)}
            />
          </div>
        </section>

        <section aria-labelledby="manage-heading" className="mt-10">
          <h2 id="manage-heading" className="text-micro font-bold uppercase tracking-wide text-faint">
            Manage
          </h2>
          <div className="mt-3 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            <SectionCard
              icon={<StoreIcon className="h-5 w-5" />}
              title="Vendors"
              description={`${suppliers.length} vendor${suppliers.length === 1 ? '' : 's'}: add, edit, deactivate or remove marketplace suppliers${schemaReady ? '. Changes go live immediately.' : '.'}`}
              primary={{ label: 'Manage all', href: '/admin/vendors' }}
              secondary={{ label: 'Add new', href: '/admin/vendors/new' }}
            />
            <SectionCard
              icon={<FlaskIcon className="h-5 w-5" />}
              title="Compounds"
              description={`${products.length} compound${products.length === 1 ? '' : 's'}: add, edit or remove the compounds and their research content.`}
              primary={{ label: 'Manage all', href: '/admin/compounds' }}
              secondary={{ label: 'Add new', href: '/admin/compounds/new' }}
            />
            <SectionCard
              icon={<SearchIcon className="h-5 w-5" />}
              title="SEO"
              description="Titles, descriptions and H1s for every page, plus slug renames and the redirects they create."
              primary={{ label: 'Open dashboard', href: '/admin/seo' }}
            />
          </div>
        </section>
      </div>
    </>
  );
}

import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { AdminPageHeader } from '@/components/admin/page-header';
import { CouponPageForm } from '@/components/admin/coupon-page-form';
import { SupplierLogo } from '@/components/ui/supplier-logo';
import { getCouponPageEditData } from '@/lib/admin/coupon-pages';
import { couponPagePath } from '@/lib/coupon-pages';
import { ArrowLeftIcon, ExternalIcon, InfoIcon, SearchIcon, StoreIcon, TagIcon, WarningIcon } from '@/components/icons/icons';

export const metadata: Metadata = { title: 'Edit coupon page | Admin', robots: { index: false, follow: false } };

// Always the latest saved text, never a build-time snapshot.
export const dynamic = 'force-dynamic';

const SIDE_LINK_CLASS =
  'group flex items-center justify-between gap-3 rounded-chip border border-line bg-surface px-3.5 py-2.5 text-sm font-semibold text-content transition-all duration-150 hover:-translate-y-0.5 hover:border-accent/50 hover:text-accent-strong hover:shadow-card';

export default async function EditCouponPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const data = await getCouponPageEditData(slug);
  if (!data) notFound();
  const path = couponPagePath(slug);
  const logo = data.supplier.logoUrl ?? data.supplier.faviconUrl;

  return (
    <>
      <AdminPageHeader title={`${data.supplier.name} coupon page`} />
      <div className="mx-auto max-w-6xl px-4 py-6 sm:px-8 sm:py-8">
        <Link
          href="/admin/coupon-pages"
          className="group mb-5 inline-flex items-center gap-1.5 text-sm font-semibold text-muted transition-colors hover:text-accent"
        >
          <ArrowLeftIcon className="h-4 w-4 transition-transform group-hover:-translate-x-0.5" />
          All coupon pages
        </Link>

        {/* ---------------------------------------------------------- Summary */}
        <section className="animate-fade-up relative mb-8 overflow-hidden rounded-panel border border-line bg-surface-raised p-5 shadow-card sm:p-6">
          <div aria-hidden="true" className="pointer-events-none absolute -right-12 -top-12 h-40 w-40 rounded-full bg-accent/10 blur-3xl" />
          <div className="relative flex flex-wrap items-center gap-4 sm:gap-5">
            <SupplierLogo
              src={logo}
              name={data.supplier.name}
              alt={`${data.supplier.name} logo`}
              size={64}
              className="h-14 w-14 rounded-card bg-surface shadow-card sm:h-16 sm:w-16"
              initialClassName="text-xl"
            />
            <div className="min-w-0 flex-1">
              <p className="text-micro font-bold uppercase tracking-wide text-faint">Coupon page</p>
              <h2 className="truncate text-xl font-black text-content sm:text-2xl">{data.supplier.name}</h2>
              <a
                href={path}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-0.5 inline-flex max-w-full items-center gap-1 truncate font-mono text-xs text-accent hover:underline"
              >
                <span className="truncate">{path}</span>
                <ExternalIcon className="h-3 w-3 shrink-0" />
              </a>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-2 rounded-chip bg-accent-tint px-3.5 py-2 text-sm font-bold text-accent-strong">
                <TagIcon className="h-4 w-4" />
                <span className="font-mono">{data.coupon.code}</span>
                <span aria-hidden="true">·</span>
                {data.coupon.percentOff}% off
              </span>
              <span
                className={
                  data.customized
                    ? 'rounded-pill bg-accent-soft px-3 py-1.5 text-xs font-bold text-accent-strong'
                    : 'rounded-pill bg-surface-sunken px-3 py-1.5 text-xs font-bold text-muted'
                }
              >
                {data.customized ? 'Text edited' : 'Generated text'}
              </span>
            </div>
          </div>
        </section>

        {data.contentSetupError ? (
          <div role="alert" className="mb-6 flex gap-3 rounded-card border border-warn/30 bg-warn/5 px-5 py-4 text-sm text-content">
            <WarningIcon className="mt-0.5 h-5 w-5 shrink-0 text-warn" />
            <div>
              <p className="font-bold">Page text can&rsquo;t be saved yet.</p>
              <p className="mt-1 text-muted">{data.contentSetupError}</p>
            </div>
          </div>
        ) : null}

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-[minmax(0,1fr)_18rem]">
          <CouponPageForm
            slug={slug}
            current={data.current}
            defaults={data.defaults}
            customized={data.customized}
            disabled={data.contentSetupError !== null}
          />

          {/* ------------------------------------------------------ Side panel */}
          <aside className="animate-fade-up animate-delay-200 space-y-4 self-start lg:sticky lg:top-6">
            <div className="rounded-panel border border-line bg-surface-raised p-5 shadow-card">
              <h2 className="text-sm font-black text-content">Quick links</h2>
              <div className="mt-3 space-y-2">
                <a href={path} target="_blank" rel="noopener noreferrer" className={SIDE_LINK_CLASS}>
                  <span className="flex items-center gap-2">
                    <ExternalIcon className="h-4 w-4 text-accent" />
                    View live page
                  </span>
                </a>
                <Link href="/admin/coupon-pages" className={SIDE_LINK_CLASS}>
                  <span className="flex items-center gap-2">
                    <SearchIcon className="h-4 w-4 text-accent" />
                    SEO &amp; indexing
                  </span>
                </Link>
                <Link href={`/admin/vendors/${slug}/edit`} className={SIDE_LINK_CLASS}>
                  <span className="flex items-center gap-2">
                    <StoreIcon className="h-4 w-4 text-accent" />
                    Edit supplier &amp; coupon
                  </span>
                </Link>
              </div>
            </div>

            <div className="rounded-panel border border-accent/30 bg-accent-tint p-5">
              <h2 className="flex items-center gap-2 text-sm font-black text-accent-strong">
                <InfoIcon className="h-4 w-4" />
                Good to know
              </h2>
              <ul className="mt-3 space-y-2.5 text-xs leading-5 text-accent-strong">
                <li>
                  Fields marked <span className="font-bold">Generated</span> follow the supplier&rsquo;s live coupon. Once
                  edited, they keep your wording.
                </li>
                <li>
                  The code and discount come from the supplier record, so changing them updates prices across the site.
                </li>
                <li>
                  Meta title, description, FAQs and the indexing switch are set with <span className="font-bold">Edit SEO</span> on
                  the coupon pages list.
                </li>
              </ul>
            </div>
          </aside>
        </div>
      </div>
    </>
  );
}

import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { getSupplier, getSuppliers, getOffersForSupplier } from '@/lib/repository';
import { formatRating, formatReviewCount, formatShipping, formatDateTime } from '@/lib/format';
import { Badge } from '@/components/ui/badge';
import { CopyCode } from '@/components/ui/copy-code';
import { ExternalIcon, StarIcon, FlaskIcon } from '@/components/icons/icons';

export async function generateStaticParams() {
  const suppliers = await getSuppliers();
  return suppliers.map((s) => ({ slug: s.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const supplier = await getSupplier(slug);
  if (!supplier) return { title: 'Supplier not found' };
  return {
    title: `${supplier.name} — Supplier Profile, Prices & Coupons`,
    description: `Prices, shipping, payment methods, lab verification status and discount codes for ${supplier.name}.`,
    alternates: { canonical: `/suppliers/${supplier.slug}` },
  };
}

export default async function SupplierPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const supplier = await getSupplier(slug);
  if (!supplier) notFound();

  const offers = await getOffersForSupplier(supplier.slug);
  const reviewCount = formatReviewCount(supplier.reviewCount);

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: supplier.name,
    url: supplier.homepageUrl,
    ...(supplier.foundedYear ? { foundingDate: String(supplier.foundedYear) } : {}),
  };

  return (
    <div className="mx-auto max-w-shell px-4 py-10">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <nav aria-label="Breadcrumb" className="mb-6 text-sm text-muted">
        <Link href="/suppliers" className="hover:text-brand">
          Suppliers
        </Link>
        <span aria-hidden="true"> / </span>
        <span className="text-content">{supplier.name}</span>
      </nav>

      <header className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-content sm:text-4xl">{supplier.name}</h1>
          <div className="mt-3 flex flex-wrap gap-2">
            {supplier.tier ? <Badge tone="tier">{supplier.tier}</Badge> : null}
            {supplier.trustRating !== null ? (
              <Badge tone="trust" icon={<StarIcon className="h-3 w-3 text-rating" />}>
                Trust {formatRating(supplier.trustRating)} / 5
              </Badge>
            ) : null}
            {supplier.labScore !== null ? (
              <Badge tone="lab" icon={<FlaskIcon className="h-3 w-3" />}>
                Lab score {supplier.labScore.toFixed(1)}/10
              </Badge>
            ) : null}
            {supplier.reviewRating !== null ? (
              <Badge>
                {formatRating(supplier.reviewRating)}
                {reviewCount ? ` (${reviewCount})` : ''}
              </Badge>
            ) : null}
          </div>
        </div>

        <a
          href={`/go?to=${encodeURIComponent(supplier.affiliateUrl)}`}
          target="_blank"
          rel="sponsored noopener"
          className="inline-flex items-center gap-2 rounded-chip bg-brand px-5 py-3 text-sm font-bold text-white hover:bg-brand-strong"
        >
          Visit {supplier.name}
          <ExternalIcon className="h-4 w-4" />
        </a>
      </header>

      {supplier.coupon ? (
        <div className="mt-6 flex flex-wrap items-center gap-3 rounded-card border border-promo/25 bg-promo-tint p-5">
          <p className="text-sm font-bold uppercase text-promo">
            {supplier.coupon.percentOff}% off with coupon
          </p>
          <CopyCode code={supplier.coupon.code} />
        </div>
      ) : null}

      <section className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <div className="rounded-card border border-line bg-surface-raised p-5">
          <h2 className="text-micro font-bold uppercase text-faint">Shipping</h2>
          <p className="mt-2 text-sm text-content">
            {formatShipping(supplier.shippingCost)}
            {supplier.shippingSpeed ? ` · ${supplier.shippingSpeed}` : ''}
          </p>
        </div>
        <div className="rounded-card border border-line bg-surface-raised p-5">
          <h2 className="text-micro font-bold uppercase text-faint">Payment methods</h2>
          <p className="mt-2 text-sm text-content">
            {supplier.paymentMethods.length ? supplier.paymentMethods.join(', ') : 'Not listed'}
          </p>
        </div>
        <div className="rounded-card border border-line bg-surface-raised p-5">
          <h2 className="text-micro font-bold uppercase text-faint">Last inventory crawl</h2>
          <p className="mt-2 text-sm text-content">
            {supplier.inventoryRefreshedAt
              ? formatDateTime(supplier.inventoryRefreshedAt)
              : 'Not crawled yet'}
          </p>
        </div>
      </section>

      <section className="mt-10">
        <h2 className="text-xl font-black text-content">Product catalogue</h2>
        {offers.length === 0 ? (
          <p className="mt-3 rounded-card border border-dashed border-line bg-surface-raised p-10 text-center text-sm text-muted">
            No prices recorded for {supplier.name} yet. Listings appear here once the crawler reads
            them from the vendor&rsquo;s live product pages.
          </p>
        ) : null}
      </section>
    </div>
  );
}

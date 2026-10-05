import type { Metadata } from 'next';
import { site } from '@/config/site';
import { staticSeoPage } from '@/config/seo-pages';
import { pageMetadata } from '@/lib/seo-defaults';
import { getSeoOverride, withSeo } from '@/lib/seo';
import { getSupplierSlugsWithReviews, getSuppliers, supplierHasReviews } from '@/lib/repository';
import { formatReviewCount } from '@/lib/format';
import { ReviewsBrowser, type ReviewVendor } from '@/components/reviews/reviews-browser';
import { PageFaqSection } from '@/components/faq/page-faq-section';
import { StarIcon } from '@/components/icons/icons';

const PAGE = staticSeoPage('/reviews');

export async function generateMetadata(): Promise<Metadata> {
  return withSeo(PAGE.path, pageMetadata(PAGE));
}

// Ratings are edited in the admin, so this must not be a build-time snapshot.
// The vendor actions revalidate the supplier cache on every edit; the window
// only applies to changes made outside those actions.
export const revalidate = 1800;

export default async function ReviewsPage() {
  const [seo, allSuppliers, storedSlugs] = await Promise.all([
    getSeoOverride(PAGE.path),
    getSuppliers(),
    getSupplierSlugsWithReviews(),
  ]);
  // A vendor with no reviews has no card here and no reviews page.
  const suppliers = allSuppliers.filter((supplier) => supplierHasReviews(supplier, storedSlugs));

  const vendors: ReviewVendor[] = suppliers.map((supplier) => ({
    slug: supplier.slug,
    name: supplier.name,
    logo: supplier.logoUrl ?? supplier.faviconUrl,
    rating: supplier.reviewRating,
    reviewCountText: formatReviewCount(supplier.reviewCount),
    reviewCountValue: supplier.reviewCount?.value ?? 0,
    shopHref: `/go?to=${encodeURIComponent(supplier.affiliateUrl)}`,
  }));
  const ratedCount = vendors.filter((vendor) => vendor.rating !== null).length;

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: `https://${site.domain}/` },
      { '@type': 'ListItem', position: 2, name: 'Reviews', item: `https://${site.domain}/reviews` },
    ],
  };

  return (
    <div className="relative overflow-hidden">
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute left-1/2 top-0 h-[28rem] w-[56rem] -translate-x-1/2 rounded-full bg-brand/10 blur-[120px]" />
        <div className="absolute -right-24 top-40 h-72 w-72 rounded-full bg-accent/10 blur-3xl" />
      </div>

      <div className="mx-auto max-w-shell px-4 py-14">
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

        <span className="inline-flex items-center gap-1.5 rounded-pill bg-accent-tint px-3 py-1.5 text-xs font-bold uppercase tracking-wide text-accent-strong">
          <StarIcon className="h-3.5 w-3.5 fill-current" />
          Reviews
        </span>
        <h1 className="mt-3 text-4xl font-black tracking-tight text-content sm:text-5xl">
          {seo?.h1 ? seo.h1 : <>Supplier <span className="italic text-accent">reviews.</span></>}
        </h1>
        <p className="mt-5 max-w-2xl text-base leading-relaxed text-muted sm:text-lg">
          The overall rating for every supplier we track, with a full reviews page for each. Ratings come from the public
          review source linked on each page, and {site.name} never writes or edits them.
        </p>

        <dl className="mt-8 grid max-w-md grid-cols-2 gap-3">
          <div className="rounded-card border border-line bg-surface-raised p-4">
            <dt className="eyebrow">Suppliers</dt>
            <dd className="mt-1 text-2xl font-black text-content">{vendors.length}</dd>
          </div>
          <div className="rounded-card border border-accent/30 bg-accent-tint p-4">
            <dt className="eyebrow">Rated</dt>
            <dd className="mt-1 text-2xl font-black text-accent-strong">{ratedCount}</dd>
          </div>
        </dl>

        {vendors.length === 0 ? (
          <p className="mt-10 rounded-card border border-dashed border-line p-10 text-center text-sm text-muted">
            No suppliers are listed yet. Check back soon.
          </p>
        ) : (
          <ReviewsBrowser vendors={vendors} />
        )}

        <PageFaqSection path="/reviews" className="mt-14" />
      </div>
    </div>
  );
}

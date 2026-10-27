import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { guideHasContent, guides as seedGuides, type Guide } from '@/data/guides';
import { vendorAffiliateLinks } from '@/data/vendor-affiliate-links';
import { getAllOffers, getGuideBySlug, getGuides, getProducts, getSuppliers } from '@/lib/repository';
import { GuideCover } from '@/components/guides/guide-cover';
import { GuideCard } from '@/components/guides/guide-card';
import { GuideMarkdown } from '@/components/guides/guide-markdown';
import { GuideToc } from '@/components/guides/guide-toc';
import { GuidePromoCard } from '@/components/guides/guide-promo-card';
import { buildPromotedSupplier, type PromotedSupplier } from '@/lib/promoted-supplier';
import { PROMOTED_SUPPLIER } from '@/config/highlights-bar';
import { BuyPeptidesSection } from '@/components/tools/buy-peptides-section';
import { ArrowLeftIcon, ArrowRightIcon, ClockIcon } from '@/components/icons/icons';
import { formatDate } from '@/lib/format';
import { hostsFromUrls, normaliseHost } from '@/lib/guide-links';
import { sectionAnchorIds } from '@/lib/guide-toc';
import { site } from '@/config/site';
import { guideSeoDefaults, pageMetadata } from '@/lib/seo-defaults';
import { getSeoOverride, withSeo } from '@/lib/seo';
import { PageSeo } from '@/components/seo/page-seo';
import { PageFaqSection } from '@/components/faq/page-faq-section';

const RELATED_GUIDE_COUNT = 3;

/** The supplier whose products fill the "Shop peptides" rail, the same one the tool pages show. */
const SHOP_SUPPLIER_SLUG = 'disguised-alpha';

/**
 * Prerenders the guides that ship with the site. Admin-created guides are
 * rendered on demand instead, so adding one never needs a rebuild.
 */
export function generateStaticParams() {
  return seedGuides.map((guide) => ({ slug: guide.slug }));
}

function titleText(title: Metadata['title'], fallback: string): string {
  if (typeof title === 'string') return title;
  if (title && 'absolute' in title) return title.absolute;
  return fallback;
}

/** A category has no page of its own, so its crumb points at the guides index, where every category is listed. */
function categoryCrumb(category: string) {
  return { name: category, path: '/guides' };
}

/** Same-category guides first, newest first, topped up from the rest so the rail is never needlessly short. */
function relatedGuides(guide: Guide, allGuides: readonly Guide[]): Guide[] {
  const others = allGuides.filter((g) => g.slug !== guide.slug && guideHasContent(g));
  const sameCategory = others.filter((g) => g.category === guide.category);
  const rest = others.filter((g) => g.category !== guide.category);
  return [...sameCategory, ...rest].slice(0, RELATED_GUIDE_COUNT);
}

/** Supplier sites, by host: links to them in guide text are marked sponsored. */
async function sponsoredHosts(): Promise<Set<string>> {
  const suppliers = await getSuppliers().catch(() => []);
  const hosts = hostsFromUrls([
    ...suppliers.flatMap((supplier) => [supplier.homepageUrl, supplier.affiliateUrl]),
    ...Object.values(vendorAffiliateLinks),
  ]);
  for (const host of Object.keys(vendorAffiliateLinks)) hosts.add(normaliseHost(host));
  return hosts;
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const guide = await getGuideBySlug(slug);
  if (!guide) return {};
  const metadata = await withSeo(`/guides/${guide.slug}`, pageMetadata(guideSeoDefaults(guide)));
  // An image, title or URL set in /admin/seo still wins over the guide's own.
  const override = metadata.openGraph;
  const coverImages = guide.coverImageUrl
    ? [{ url: guide.coverImageUrl, alt: guide.coverImageAlt || guide.title }]
    : undefined;
  const withSocial: Metadata = {
    ...metadata,
    openGraph: {
      type: 'article',
      title: override?.title ?? titleText(metadata.title, guide.title),
      description: override?.description ?? metadata.description ?? guide.excerpt,
      url: override?.url ?? `/guides/${guide.slug}`,
      publishedTime: guide.publishedAt,
      ...(guide.updatedAt ? { modifiedTime: guide.updatedAt } : {}),
      ...((override?.images ?? coverImages) ? { images: override?.images ?? coverImages } : {}),
    },
  };
  // A placeholder guide stays out of search until its text is written, and a
  // draft stays out of it entirely (drafts aren't served publicly at all;
  // this only matters if one ever is).
  return guideHasContent(guide) && guide.isPublished !== false
    ? withSocial
    : { ...withSocial, robots: { index: false, follow: true } };
}

/**
 * The partner promoted site-wide (top bar, featured section), from its live
 * record, plus one of its in-stock products for the coupon card's artwork:
 * the one the most suppliers carry, the same ranking the shop rail uses.
 */
async function sidebarPromo(): Promise<{
  promo: PromotedSupplier;
  product: { name: string; imageUrl: string } | null;
} | null> {
  const [suppliers, offers, products] = await Promise.all([getSuppliers(), getAllOffers(), getProducts()]).catch(
    () => [[], [], []] as const,
  );
  const promo = buildPromotedSupplier(suppliers, offers, PROMOTED_SUPPLIER);
  if (!promo) return null;

  const sellersPerProduct = new Map<string, Set<string>>();
  for (const offer of offers) {
    const sellers = sellersPerProduct.get(offer.productSlug) ?? new Set<string>();
    sellers.add(offer.supplierSlug);
    sellersPerProduct.set(offer.productSlug, sellers);
  }
  const pick = offers
    .filter((offer) => offer.supplierSlug === promo.slug && offer.inStock && offer.imageUrl)
    .sort((a, b) => (sellersPerProduct.get(b.productSlug)?.size ?? 0) - (sellersPerProduct.get(a.productSlug)?.size ?? 0))[0];
  const productName = pick ? products.find((product) => product.slug === pick.productSlug)?.name : undefined;
  return { promo, product: pick?.imageUrl && productName ? { name: productName, imageUrl: pick.imageUrl } : null };
}

export default async function GuidePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const guide = await getGuideBySlug(slug);
  if (!guide) notFound();
  const [seo, allGuides, linkHosts, promo] = await Promise.all([
    getSeoOverride(`/guides/${guide.slug}`),
    getGuides(),
    sponsoredHosts(),
    sidebarPromo(),
  ]);

  const more = relatedGuides(guide, allGuides);
  const anchorIds = sectionAnchorIds(guide.sections.map((section) => section.heading));
  const tocItems = guide.sections.map((section, index) => ({ id: anchorIds[index]!, heading: section.heading }));
  const lastUpdated = guide.updatedAt ?? guide.publishedAt;

  return (
    <>
      {/* Reading column plus a sidebar on large screens. The column keeps
          long-form prose at a readable width; the shop rail, FAQ and "More
          guides" bands below break out to the same width they get elsewhere. */}
      <div className="mx-auto grid max-w-6xl grid-cols-1 gap-10 px-4 pt-8 sm:pt-10 lg:grid-cols-12 lg:gap-12">
      <article className="min-w-0 lg:col-span-8">
        <PageSeo
          seo={guideSeoDefaults(guide)}
          article={{ datePublished: guide.publishedAt, image: guide.coverImageUrl }}
          subsection={categoryCrumb(guide.category)}
          dataDates={[guide.publishedAt, guide.updatedAt]}
        />

        <Link
          href="/guides"
          className="group/back inline-flex items-center gap-2 rounded-pill border border-line border-b-2 bg-surface-raised py-1.5 pl-1.5 pr-4 text-sm font-bold text-content shadow-card transition-all duration-200 hover:-translate-y-0.5 hover:border-accent/40 hover:text-accent-strong hover:shadow-lift active:translate-y-0"
        >
          <span className="flex h-7 w-7 items-center justify-center rounded-pill bg-accent-soft text-accent-strong transition-colors duration-200 group-hover/back:bg-accent group-hover/back:text-white">
            <ArrowLeftIcon className="h-4 w-4 transition-transform duration-200 group-hover/back:-translate-x-0.5" />
          </span>
          All guides
        </Link>

        <GuideCover
          imageUrl={guide.coverImageUrl}
          icon={guide.icon}
          accent={guide.accent}
          alt={guide.coverImageAlt || `${guide.title} cover image`}
          priority
          className="mt-5 aspect-[16/9] w-full rounded-card sm:rounded-panel"
        />

        <div className="mt-6 flex flex-wrap items-center gap-x-2 gap-y-1.5 text-micro font-bold uppercase text-faint">
          <span className="rounded-pill border border-line bg-surface px-2 py-0.5 text-content">{guide.category}</span>
          <span aria-hidden="true">&middot;</span>
          <span className="inline-flex items-center gap-1">
            <ClockIcon className="h-3 w-3" />
            {guide.readMinutes} min read
          </span>
          <span aria-hidden="true">&middot;</span>
          <time dateTime={guide.publishedAt}>{formatDate(guide.publishedAt)}</time>
        </div>

        <h1 className="mt-3 text-[clamp(1.75rem,5vw,2.5rem)] font-black leading-tight text-content">
          {seo?.h1 || guide.title}
        </h1>
        <p className="mt-3 text-base leading-relaxed text-muted sm:text-lg">{guide.excerpt}</p>
        <p className="mt-4 text-sm text-muted">
          Author:{' '}
          <Link href="/about" rel="author" className="font-bold text-brand hover:underline">
            {site.publisher}
          </Link>
          <span aria-hidden="true"> &middot; </span>
          Last updated: <time dateTime={lastUpdated}>{formatDate(lastUpdated)}</time>
        </p>

        {/* Phones and tablets: the contents sit here, collapsed, since there is no sidebar. */}
        <div className="mt-8 lg:hidden">
          <GuideToc items={tocItems} defaultOpen={false} />
        </div>

        <div className="mt-10 space-y-8">
          {guide.sections.map((section, index) => (
            <section key={anchorIds[index]} id={anchorIds[index]} className="scroll-mt-24">
              <h2 className="text-xl font-black leading-tight text-content sm:text-2xl">{section.heading}</h2>
              <div className="mt-3 space-y-3 text-sm leading-relaxed text-muted sm:text-base">
                {/* Joined back into one document so a list or table split
                    across blank lines still renders as one block. */}
                <GuideMarkdown source={section.body.join('\n\n')} sponsoredHosts={linkHosts} />
              </div>
            </section>
          ))}
        </div>

        {guide.relatedTool ? (
          <Link
            href={guide.relatedTool.href}
            className="btn-3d mt-10 inline-flex items-center gap-2 rounded-chip bg-brand px-5 py-3 text-sm font-bold text-white"
          >
            {guide.relatedTool.label}
            <ArrowRightIcon className="h-4 w-4" />
          </Link>
        ) : null}

        <p className="mt-10 rounded-chip border border-line bg-surface-raised px-4 py-3 text-xs leading-relaxed text-faint">
          Research use only. This guide is general information, not medical, legal or laboratory-protocol advice.
          See the full{' '}
          <Link href="/disclaimer" className="font-semibold text-brand hover:underline">
            disclaimer
          </Link>{' '}
          for the terms this site operates under.
        </p>
      </article>

      {/* Sticky on large screens. On a short window the pair can be taller
          than the screen, so it still scrolls (wheel, trackpad, keyboard) to
          keep the coupon button reachable, but shows no scrollbar. */}
      <aside aria-label="Guide sidebar" className="lg:col-span-4">
        <div className="scrollbar-hide space-y-5 lg:sticky lg:top-24 lg:max-h-menu lg:overflow-y-auto lg:p-1">
          <div className="hidden lg:block">
            <GuideToc items={tocItems} />
          </div>
          {promo ? <GuidePromoCard promo={promo.promo} product={promo.product} /> : null}
        </div>
      </aside>
      </div>

      {/* Outside the reading column so the product rail runs the full width of the screen. */}
      <BuyPeptidesSection supplierSlug={SHOP_SUPPLIER_SLUG} className="mt-12 sm:mt-14" />

      <div className="mx-auto max-w-shell px-4">
        <PageFaqSection path={`/guides/${guide.slug}`} className="mt-8 sm:mt-10" />
      </div>

      {more.length > 0 ? (
        <section className="mx-auto max-w-shell px-4 pb-12">
          <div className="mt-12 border-t border-line pt-10 sm:mt-14">
            <h2 className="text-micro font-bold uppercase text-faint">Related guides</h2>
            <ul className="mt-4 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {more.map((item) => (
                <GuideCard key={item.slug} guide={item} />
              ))}
            </ul>
          </div>
        </section>
      ) : (
        <div className="pb-12" />
      )}
    </>
  );
}

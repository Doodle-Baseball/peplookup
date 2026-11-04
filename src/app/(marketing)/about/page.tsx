import type { Metadata } from 'next';
import Link from 'next/link';
import { site, SUPPLIER_PAGE_AUTHOR } from '@/config/site';
import { getAllOffers, getSuppliers } from '@/lib/repository';
import { catalogueStats } from '@/lib/catalogue-stats';
import { staticSeoPage } from '@/config/seo-pages';
import { pageMetadata } from '@/lib/seo-defaults';
import { getSeoOverride, withSeo } from '@/lib/seo';
import { CheckBadgeIcon, ExternalIcon, GlobeIcon, ShieldCheckIcon } from '@/components/icons/icons';
import { AccentedHeading } from '@/components/ui/accented-heading';
import { PageSeo } from '@/components/seo/page-seo';

const PAGE = staticSeoPage('/about');

export async function generateMetadata(): Promise<Metadata> {
  return withSeo(PAGE.path, pageMetadata(PAGE));
}

const PRINCIPLES: { title: string; body: string; icon: React.ReactNode }[] = [
  {
    title: 'Real numbers or none at all',
    body: 'Every price on this site carries the time it was last observed. We show empty states rather than a placeholder price, a fabricated review count, or a mocked-up COA.',
    icon: <ShieldCheckIcon className="h-5 w-5" />,
  },
  {
    title: 'Ranked by price, not commission',
    body: 'When we do earn a commission from a listed supplier, it never changes the price a buyer pays and never changes where that supplier ranks. That policy is disclosed on every page it applies to.',
    icon: <CheckBadgeIcon className="h-5 w-5" />,
  },
  {
    title: 'We are a comparison tool, not a seller',
    body: `${site.name} does not manufacture, sell, or ship anything. Every purchase happens directly between you and a third-party supplier, see our full disclaimer for the details.`,
    icon: <GlobeIcon className="h-5 w-5" />,
  },
];

/** How PepLookup turns supplier listings into one comparison, in the order it happens. */
const HOW_IT_WORKS: { title: string; body: string }[] = [
  {
    title: 'We read each supplier\'s own prices',
    body: `${site.name} records the prices suppliers publish on their own product pages, along with stock status and the time each price was seen. Nothing is estimated or filled in.`,
  },
  {
    title: 'Every listing becomes a cost per mg',
    body: `A 5 mg vial, a 10 mg vial and a 10-vial kit can't be compared by sticker price. ${site.name} divides each price by the total milligrams in the pack, so every supplier is ranked on the same number.`,
  },
  {
    title: 'COAs and coupon codes sit beside the price',
    body: `Where a supplier publishes a certificate of analysis, ${site.name} links it from the listing, and where a supplier has a discount code, the code is shown next to its prices.`,
  },
];

export default async function AboutPage() {
  const [seo, suppliers, offers] = await Promise.all([getSeoOverride(PAGE.path), getSuppliers(), getAllOffers()]);
  // Live counts, the same ones the homepage and the supplier directory quote.
  const stats = catalogueStats(suppliers, offers);
  const coaListingCount = offers.filter(
    (offer) => suppliers.some((supplier) => supplier.slug === offer.supplierSlug) && (offer.labReport !== null || Boolean(offer.coaUrl)),
  ).length;
  const facts = [
    { label: 'Suppliers compared', value: stats.supplierCount },
    { label: 'Peptides tracked', value: stats.compoundCount },
    { label: 'Priced listings', value: stats.listingCount },
    { label: 'Listings with a COA', value: coaListingCount },
  ];
  return (
    <div className="relative overflow-hidden">
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute left-1/2 top-0 h-[28rem] w-[56rem] -translate-x-1/2 rounded-full bg-accent/10 blur-[120px]" />
        <div className="absolute -right-24 top-40 h-72 w-72 rounded-full bg-accent/10 blur-3xl" />
      </div>

      <div className="mx-auto max-w-shell px-4 py-14 sm:pt-16">
        <PageSeo seo={PAGE} />
        <section className="mx-auto max-w-4xl text-center">
          <span className="animate-fade-up inline-flex items-center gap-2 rounded-pill border border-line bg-surface-raised px-4 py-2 font-mono text-[11px] font-bold uppercase tracking-[0.16em] text-content shadow-card">
            <span className="relative flex h-2 w-2" aria-hidden="true">
              <span className="absolute inline-flex h-full w-full rounded-full bg-accent opacity-60 motion-safe:animate-ping" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-accent" />
            </span>
            About {site.name}
          </span>
          <h1 className="animate-fade-up animate-delay-100 mx-auto mt-6 max-w-4xl text-4xl font-black leading-[0.95] text-content sm:text-6xl">
            {seo?.h1 ? (
              <AccentedHeading text={seo.h1} />
            ) : (
              <>
                Compare before you <span className="text-accent">buy.</span>
              </>
            )}
          </h1>
          <p className="animate-fade-up animate-delay-200 mx-auto mt-5 max-w-2xl text-base leading-7 text-muted sm:text-lg">
            {site.description}
          </p>
          <p className="animate-fade-up animate-delay-300 mx-auto mt-4 max-w-2xl text-sm leading-7 text-muted sm:text-base">
            {site.tagline} We built {site.name} because comparing peptide pricing across suppliers meant
            opening a dozen tabs and doing the cost-per-mg math by hand, normalising every listing down
            to one number lets you see the real comparison in one place.
          </p>
        </section>

        <section aria-labelledby="what-is-heading" className="mx-auto mt-14 max-w-4xl">
          <h2 id="what-is-heading" className="text-center text-2xl font-black text-content sm:text-3xl">
            What is <span className="text-accent">{site.name}</span>?
          </h2>
          <p className="mx-auto mt-4 max-w-3xl text-center text-sm leading-7 text-muted sm:text-base">
            {site.name} is an independent peptide price comparison website. It lists research peptide suppliers side by
            side and shows what each one charges per milligram, so researchers can see which supplier is cheapest for a
            given compound without doing the maths by hand. {site.name} also collects the certificates of analysis
            suppliers publish and the coupon codes they offer, and links every listing straight to the supplier&rsquo;s
            own product page. {site.name} is not a shop: it sells nothing and ships nothing.
          </p>
          <dl className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-4">
            {facts.map((fact) => (
              <div key={fact.label} className="rounded-card border border-line bg-surface-raised p-4 text-center shadow-card">
                <dt className="eyebrow">{fact.label}</dt>
                <dd className="mt-1 text-2xl font-black text-accent-strong">{fact.value.toLocaleString('en-US')}</dd>
              </div>
            ))}
          </dl>
          <p className="mt-3 text-center text-xs text-faint">Counted live from the {site.name} catalogue.</p>
        </section>

        <section aria-labelledby="how-heading" className="mx-auto mt-14 max-w-4xl">
          <h2 id="how-heading" className="text-center text-2xl font-black text-content sm:text-3xl">
            How {site.name} <span className="text-accent">works</span>
          </h2>
          <ol className="mt-6 space-y-3">
            {HOW_IT_WORKS.map((step, index) => (
              <li key={step.title} className="flex items-start gap-4 rounded-card border border-line bg-surface-raised p-5 shadow-card">
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-pill bg-brand text-sm font-black text-white">
                  {index + 1}
                </span>
                <div className="min-w-0">
                  <h3 className="font-black text-content">{step.title}</h3>
                  <p className="mt-1 text-sm leading-7 text-muted">{step.body}</p>
                </div>
              </li>
            ))}
          </ol>
          <p className="mx-auto mt-6 max-w-3xl text-center text-sm leading-7 text-muted sm:text-base">
            Supplier pages on {site.name} are checked by {SUPPLIER_PAGE_AUTHOR.name}. Browse the{' '}
            <Link href="/suppliers" className="font-semibold text-brand hover:underline">
              supplier directory
            </Link>
            , compare{' '}
            <Link href="/price-checker" className="font-semibold text-brand hover:underline">
              peptide prices per mg
            </Link>{' '}
            or read the{' '}
            <Link href="/coas" className="font-semibold text-brand hover:underline">
              published lab reports
            </Link>
            .
          </p>
        </section>

        <section className="mt-14 grid grid-cols-1 gap-5 md:grid-cols-3">
          {PRINCIPLES.map((principle) => (
            <div
              key={principle.title}
              className="tilt-card flex flex-col rounded-card border border-line bg-surface-raised p-6 shadow-card hover:border-accent/40 sm:p-7"
            >
              <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-chip bg-accent-tint text-accent-strong shadow-sm">
                {principle.icon}
              </span>
              <h2 className="mt-4 text-lg font-black text-content">{principle.title}</h2>
              <p className="mt-2 text-sm leading-relaxed text-muted">{principle.body}</p>
            </div>
          ))}
        </section>

        <section className="mx-auto mt-12 max-w-4xl rounded-panel border border-accent/25 bg-accent-tint p-8 text-center shadow-card sm:p-10">
          <h2 className="text-2xl font-black text-content sm:text-3xl">
            Join the research <span className="text-accent">community</span>
          </h2>
          <p className="mx-auto mt-3 max-w-lg text-sm leading-relaxed text-muted sm:text-base">
            Discuss protocols, share verified suppliers and swap notes with other researchers in our
            Skool community.
          </p>
          <a
            href="https://www.skool.com/peptide-5115/about"
            target="_blank"
            rel="nofollow noopener noreferrer"
            className="btn-3d mt-6 inline-flex items-center gap-2 rounded-chip bg-brand px-6 py-3 text-sm font-bold text-white"
          >
            Join the community
            <ExternalIcon className="h-4 w-4" />
          </a>
        </section>

        <section className="mx-auto mt-12 max-w-4xl rounded-panel border border-line bg-surface-raised p-8 text-center shadow-card sm:p-10">
          <h2 className="text-lg font-black text-content sm:text-xl">Questions, corrections or partnerships?</h2>
          <p className="mx-auto mt-2 max-w-md text-sm leading-relaxed text-muted sm:text-base">
            We read every message. Reach us on the{' '}
            <Link href="/contact" className="font-semibold text-brand hover:underline">
              contact page
            </Link>{' '}
            or at{' '}
            <a href={`mailto:${site.contactEmail}`} className="font-semibold text-brand hover:underline">
              {site.contactEmail}
            </a>
            .
          </p>
        </section>

        <p className="mx-auto mt-8 max-w-4xl text-center text-sm text-muted sm:text-base">
          New here? Read{' '}
          <Link href="/guides/what-is-peplookup" className="font-semibold text-brand hover:underline">
            What is PepLookup?
          </Link>
        </p>
      </div>
    </div>
  );
}

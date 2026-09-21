import type { Metadata } from 'next';
import Link from 'next/link';
import { site } from '@/config/site';
import { staticSeoPage } from '@/config/seo-pages';
import { pageMetadata } from '@/lib/seo-defaults';
import { getSeoOverride, withSeo } from '@/lib/seo';
import { getAllOffers, getSuppliers } from '@/lib/repository';
import { CheckBadgeIcon, ExternalIcon, FlaskIcon, ShieldCheckIcon, WarningIcon } from '@/components/icons/icons';

const PAGE = staticSeoPage('/labs');

export async function generateMetadata(): Promise<Metadata> {
  return withSeo(PAGE.path, pageMetadata(PAGE));
}

const WHAT_VERIFIED_MEANS: { title: string; body: string; icon: React.ReactNode }[] = [
  {
    title: 'A document exists, and we link to it',
    body: 'A listing is marked as having a COA when the supplier publishes one we can actually open. We link to the supplier’s own document rather than rehosting it, so you always read the original.',
    icon: <CheckBadgeIcon className="h-5 w-5" />,
  },
  {
    title: 'We do not run the tests ourselves',
    body: `${site.name} does not operate a laboratory and does not commission testing. Every certificate shown here was produced by or for the supplier. We surface it so it can be read, not as our own endorsement of the result.`,
    icon: <ShieldCheckIcon className="h-5 w-5" />,
  },
  {
    title: 'A COA is evidence, not a guarantee',
    body: 'A certificate describes one batch at one point in time. It cannot tell you what is in the vial you receive months later, and a document can be edited, reused across batches or issued in-house. Read it critically.',
    icon: <WarningIcon className="h-5 w-5" />,
  },
];

export default async function LabsPage() {
  const [seo, offers, suppliers] = await Promise.all([
    getSeoOverride(PAGE.path),
    getAllOffers(),
    getSuppliers(),
  ]);

  // Counted from live listings so the numbers can never drift from what the
  // lab-reports directory actually shows.
  const slugsWithCoa = new Set(
    offers.filter((o) => o.coaUrl || o.labReport?.reportUrl || o.labReport?.labUrl).map((o) => o.supplierSlug),
  );
  const publishingSuppliers = suppliers
    .filter((s) => slugsWithCoa.has(s.slug))
    .sort((a, b) => a.name.localeCompare(b.name));
  const coaListings = offers.filter((o) => o.coaUrl || o.labReport?.reportUrl || o.labReport?.labUrl).length;

  const stats = [
    { label: 'Suppliers publishing COAs', value: publishingSuppliers.length },
    { label: 'Listings with a document', value: coaListings },
    { label: 'Suppliers tracked', value: suppliers.length },
  ];

  return (
    <div className="relative overflow-hidden">
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute left-1/2 top-0 h-[28rem] w-[56rem] -translate-x-1/2 rounded-full bg-brand/10 blur-[120px]" />
        <div className="absolute -right-24 top-40 h-72 w-72 rounded-full bg-accent/10 blur-3xl" />
      </div>

      <div className="mx-auto max-w-3xl px-4 py-14">
        <span className="inline-flex items-center gap-1.5 rounded-pill bg-brand-soft px-3 py-1.5 text-xs font-bold uppercase tracking-wide text-brand-strong">
          <FlaskIcon className="h-3.5 w-3.5" />
          Verification
        </span>
        <h1 className="mt-3 text-4xl font-black tracking-tight text-content sm:text-5xl">
          {seo?.h1 ? seo.h1 : <>Verified <span className="italic text-brand">labs.</span></>}
        </h1>
        <p className="mt-5 text-base leading-relaxed text-muted sm:text-lg">
          Which suppliers publish a certificate of analysis, what the word &ldquo;verified&rdquo; does and does
          not mean on this site, and how to read a COA before you trust a purity number.
        </p>

        <section className="mt-10 grid grid-cols-2 gap-3 sm:grid-cols-3">
          {stats.map((stat) => (
            <div key={stat.label} className="rounded-card border border-line bg-surface-raised p-4 text-center">
              <p className="text-2xl font-black text-content sm:text-3xl">{stat.value}</p>
              <p className="mt-1 text-xs font-semibold text-muted">{stat.label}</p>
            </div>
          ))}
        </section>

        <section className="mt-12 space-y-5">
          <h2 className="text-2xl font-black text-content">
            What &ldquo;verified&rdquo; means <span className="text-accent">here.</span>
          </h2>
          {WHAT_VERIFIED_MEANS.map((item) => (
            <div key={item.title} className="flex gap-4 rounded-card border border-line bg-surface-raised p-5">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-chip bg-brand-soft text-brand-strong">
                {item.icon}
              </span>
              <div>
                <h3 className="font-black text-content">{item.title}</h3>
                <p className="mt-1 text-sm leading-relaxed text-muted">{item.body}</p>
              </div>
            </div>
          ))}
        </section>

        {publishingSuppliers.length > 0 ? (
          <section className="mt-12">
            <h2 className="text-2xl font-black text-content">
              Suppliers publishing <span className="text-accent">certificates.</span>
            </h2>
            <p className="mt-2 text-sm leading-relaxed text-muted">
              Every supplier below has at least one listing with a certificate we can link to. Open a
              supplier to see which of their products carry one.
            </p>
            <ul className="mt-5 flex flex-wrap gap-2">
              {publishingSuppliers.map((supplier) => (
                <li key={supplier.slug}>
                  <Link
                    href={`/suppliers/${supplier.slug}`}
                    className="inline-flex items-center rounded-pill border border-line bg-surface px-3.5 py-2 text-sm font-bold text-content transition-colors hover:border-brand hover:bg-brand hover:text-surface"
                  >
                    {supplier.name}
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        ) : null}

        <section className="mt-12 rounded-card border border-brand/20 bg-brand-tint p-8 text-center">
          <h2 className="text-xl font-black text-content">Read a COA properly</h2>
          <p className="mx-auto mt-2 max-w-lg text-sm text-muted">
            Our COA reader walks you through the green and red flags on a certificate, so you can judge a
            document before you trust the number printed on it.
          </p>
          <div className="mt-5 flex flex-wrap items-center justify-center gap-3">
            <Link
              href="/tools/coa-reader"
              className="btn-3d inline-flex items-center gap-2 rounded-chip bg-brand px-6 py-3 text-sm font-bold text-white"
            >
              Open the COA reader
              <ExternalIcon className="h-4 w-4" />
            </Link>
            <Link
              href="/lab-reports"
              className="inline-flex items-center rounded-chip border border-line bg-surface px-6 py-3 text-sm font-bold text-content transition-colors hover:border-brand"
            >
              Lab reports
            </Link>
          </div>
        </section>

        <section className="mt-12 text-center">
          <h2 className="text-lg font-black text-content">Looking for the documents themselves?</h2>
          <p className="mx-auto mt-2 max-w-lg text-sm text-muted">
            The{' '}
            <Link href="/lab-reports" className="font-semibold text-accent hover:underline">
              lab reports directory
            </Link>{' '}
            lists every certificate we have linked, by compound and supplier.
          </p>
        </section>
      </div>
    </div>
  );
}

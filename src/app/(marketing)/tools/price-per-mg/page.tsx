import type { Metadata } from 'next';
import Link from 'next/link';
import { PriceMgCalculator } from '@/components/tools/price-mg-calculator';
import { ArrowRightIcon, BoltIcon, InfoIcon } from '@/components/icons/icons';
import { staticSeoPage } from '@/config/seo-pages';
import { pageMetadata } from '@/lib/seo-defaults';
import { getSeoOverride, withSeo } from '@/lib/seo';
import { PageFaqSection } from '@/components/faq/page-faq-section';

const PAGE = staticSeoPage('/tools/price-per-mg');

export async function generateMetadata(): Promise<Metadata> {
  return withSeo(PAGE.path, pageMetadata(PAGE));
}

export default async function PricePerMgToolPage() {
  const seo = await getSeoOverride(PAGE.path);
  return (
    <div className="mx-auto max-w-shell px-4 py-14">
      <section className="mx-auto max-w-2xl text-center">
        <span className="inline-flex items-center gap-1.5 rounded-pill bg-brand-soft px-3 py-1.5 text-xs font-bold uppercase tracking-wide text-brand-strong">
          Free tool
        </span>
        <h1 className="mt-3 text-4xl font-black tracking-tight text-content sm:text-5xl">{seo?.h1 || 'Price per MG'}</h1>
        <p className="mx-auto mt-4 max-w-xl text-sm text-muted sm:text-base">
          Turn any vial price into a true cost-per-milligram and cost-per-dose figure, so vial sizes and
          suppliers can be compared on equal footing instead of by sticker price alone.
        </p>
      </section>

      <section className="mt-10">
        <PriceMgCalculator />
      </section>

      <section className="mt-10 rounded-card border border-line bg-surface-raised p-6 shadow-card sm:p-8">
        <div className="flex items-center gap-3">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-chip bg-brand-soft text-brand-strong">
            <BoltIcon className="h-5 w-5" />
          </span>
          <div>
            <h2 className="text-lg font-black text-content">Compare against real listings</h2>
            <p className="text-sm text-muted">See how a price stacks up against what suppliers are actually charging right now.</p>
          </div>
        </div>

        <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-3">
          <Link
            href="/suppliers"
            className="group flex items-center justify-between gap-3 rounded-chip border border-line bg-surface px-4 py-3.5 transition-colors hover:border-brand/40 hover:bg-brand-soft"
          >
            <span>
              <span className="block text-micro font-bold uppercase tracking-wide text-faint">Browse all suppliers</span>
              <span className="block text-sm font-black text-content group-hover:text-brand-strong">Every listed vendor</span>
            </span>
            <ArrowRightIcon className="h-4 w-4 shrink-0 text-faint transition-colors group-hover:text-brand" />
          </Link>
          <Link
            href="/"
            className="group flex items-center justify-between gap-3 rounded-chip border border-line bg-surface px-4 py-3.5 transition-colors hover:border-brand/40 hover:bg-brand-soft"
          >
            <span>
              <span className="block text-micro font-bold uppercase tracking-wide text-faint">Compare by compound</span>
              <span className="block text-sm font-black text-content group-hover:text-brand-strong">Side-by-side pricing</span>
            </span>
            <ArrowRightIcon className="h-4 w-4 shrink-0 text-faint transition-colors group-hover:text-brand" />
          </Link>
          <Link
            href="/lab-reports"
            className="group flex items-center justify-between gap-3 rounded-chip border border-line bg-surface px-4 py-3.5 transition-colors hover:border-brand/40 hover:bg-brand-soft"
          >
            <span>
              <span className="block text-micro font-bold uppercase tracking-wide text-faint">Lab-verified listings</span>
              <span className="block text-sm font-black text-content group-hover:text-brand-strong">COA test reports</span>
            </span>
            <ArrowRightIcon className="h-4 w-4 shrink-0 text-faint transition-colors group-hover:text-brand" />
          </Link>
        </div>
      </section>

      <section className="mt-6 rounded-card border border-brand/20 bg-brand-tint p-6 sm:p-8">
        <div className="flex gap-4">
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-brand/30 bg-surface-raised text-brand">
            <InfoIcon className="h-5 w-5" />
          </span>
          <div>
            <h2 className="text-sm font-black uppercase tracking-wide text-content">Why price per mg matters</h2>
            <p className="mt-2 max-w-3xl text-sm text-muted">
              A 5 mg vial at $45 and a 10 mg vial at $80 look like different deals until the price is
              divided by the milligrams: the first works out to $9/mg, the second to $8/mg. Larger vials
              usually win on cost per mg, but only if the whole vial gets used before reconstitution
              degrades. Cross-check the number against{' '}
              <Link href="/lab-reports" className="font-bold text-brand hover:underline">
                our lab-verified suppliers
              </Link>{' '}
              too, since a lower price is only a good deal if the product behind it actually tests clean.
            </p>
          </div>
        </div>
      </section>

      <PageFaqSection path="/tools/price-per-mg" className="mt-14" />
    </div>
  );
}

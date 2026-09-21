import type { Metadata } from 'next';
import Link from 'next/link';
import { site } from '@/config/site';
import { staticSeoPage } from '@/config/seo-pages';
import { pageMetadata } from '@/lib/seo-defaults';
import { getSeoOverride, withSeo } from '@/lib/seo';
import { getSuppliers } from '@/lib/repository';
import { CheckBadgeIcon, GlobeIcon, MailIcon, ShieldCheckIcon } from '@/components/icons/icons';

const PAGE = staticSeoPage('/partners');

export async function generateMetadata(): Promise<Metadata> {
  return withSeo(PAGE.path, pageMetadata(PAGE));
}

const PRINCIPLES: { title: string; body: string; icon: React.ReactNode }[] = [
  {
    title: 'Commission never buys a ranking',
    body: 'Suppliers are ordered by the numbers alone: price, cost per mg, stock and the filters you choose. Whether we earn a commission from a supplier has no bearing on where they appear, and there is no paid placement anywhere on this site.',
    icon: <ShieldCheckIcon className="h-5 w-5" />,
  },
  {
    title: 'Listing is free and does not require a deal',
    body: `Most suppliers on ${site.name} have no relationship with us at all. We list them because they publish prices we can compare. A supplier does not have to pay, partner or ask to be included.`,
    icon: <GlobeIcon className="h-5 w-5" />,
  },
  {
    title: 'You never pay more',
    body: 'An affiliate link costs you nothing extra. The price you pay is the supplier’s own price, and any commission comes out of their margin, not your order.',
    icon: <CheckBadgeIcon className="h-5 w-5" />,
  },
];

export default async function PartnersPage() {
  const [seo, suppliers] = await Promise.all([getSeoOverride(PAGE.path), getSuppliers()]);

  return (
    <div className="relative overflow-hidden">
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute left-1/2 top-0 h-[28rem] w-[56rem] -translate-x-1/2 rounded-full bg-brand/10 blur-[120px]" />
        <div className="absolute -right-24 top-40 h-72 w-72 rounded-full bg-accent/10 blur-3xl" />
      </div>

      <div className="mx-auto max-w-3xl px-4 py-14">
        <span className="inline-flex items-center gap-1.5 rounded-pill bg-brand-soft px-3 py-1.5 text-xs font-bold uppercase tracking-wide text-brand-strong">
          <GlobeIcon className="h-3.5 w-3.5" />
          Partners
        </span>
        <h1 className="mt-3 text-4xl font-black tracking-tight text-content sm:text-5xl">
          {seo?.h1 ? seo.h1 : <>Working with <span className="italic text-brand">suppliers.</span></>}
        </h1>
        <p className="mt-5 text-base leading-relaxed text-muted sm:text-lg">
          How suppliers end up on {site.name}, how affiliate relationships work, and the line we hold between
          the two. We currently track {suppliers.length} suppliers.
        </p>

        <section className="mt-12 space-y-5">
          {PRINCIPLES.map((principle) => (
            <div key={principle.title} className="flex gap-4 rounded-card border border-line bg-surface-raised p-5">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-chip bg-brand-soft text-brand-strong">
                {principle.icon}
              </span>
              <div>
                <h2 className="font-black text-content">{principle.title}</h2>
                <p className="mt-1 text-sm leading-relaxed text-muted">{principle.body}</p>
              </div>
            </div>
          ))}
        </section>

        <section className="mt-12">
          <h2 className="text-2xl font-black text-content">
            For <span className="text-accent">suppliers.</span>
          </h2>
          <p className="mt-3 text-sm leading-relaxed text-muted">
            If you sell research compounds and want your catalogue compared accurately, write to us. What
            helps most, in rough order:
          </p>
          <ul className="mt-4 space-y-2.5">
            {[
              'A public product page per item, with the price and pack size readable without an account.',
              'Certificates of analysis published at stable links, named by product and batch.',
              'A note when pricing, sizes or stock change materially, so listings do not go stale.',
              'A correction, any time you see something wrong on your profile.',
            ].map((item) => (
              <li key={item} className="flex gap-2.5 text-sm leading-relaxed text-content">
                <span aria-hidden="true" className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-accent" />
                {item}
              </li>
            ))}
          </ul>
          <p className="mt-4 text-sm leading-relaxed text-muted">
            We will correct a wrong price or a dead link whether or not there is any commercial relationship
            between us. Accuracy is the product.
          </p>
        </section>

        <section className="mt-12 rounded-card border border-line bg-surface-raised p-6">
          <h2 className="text-lg font-black text-content">Affiliate disclosure</h2>
          <p className="mt-2 text-sm leading-relaxed text-muted">
            Some outbound links on {site.name} are affiliate links, meaning we may earn a commission if you
            buy through them, at no extra cost to you. This is how the site pays for itself. It does not
            change prices, rankings or which suppliers we list. The full disclosure sits in our{' '}
            <Link href="/disclaimer" className="font-semibold text-accent hover:underline">
              legal disclaimer
            </Link>{' '}
            and the{' '}
            <Link href="/terms" className="font-semibold text-accent hover:underline">
              terms of service
            </Link>
            .
          </p>
        </section>

        <section className="mt-12 rounded-card border border-brand/20 bg-brand-tint p-8 text-center">
          <h2 className="text-xl font-black text-content">Get in touch</h2>
          <p className="mx-auto mt-2 max-w-lg text-sm text-muted">
            Partnership enquiries, listing corrections and data questions all go to the same place.
          </p>
          <div className="mt-5 flex flex-wrap items-center justify-center gap-3">
            <Link
              href="/contact"
              className="btn-3d inline-flex items-center gap-2 rounded-chip bg-brand px-6 py-3 text-sm font-bold text-white"
            >
              <MailIcon className="h-4 w-4" />
              Contact us
            </Link>
            <a
              href={`mailto:${site.contactEmail}`}
              className="inline-flex items-center rounded-chip border border-line bg-surface px-6 py-3 text-sm font-bold text-content transition-colors hover:border-brand"
            >
              {site.contactEmail}
            </a>
          </div>
        </section>
      </div>
    </div>
  );
}

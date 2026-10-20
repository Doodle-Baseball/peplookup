import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { site } from '@/config/site';
import { chromeExtension } from '@/config/extension';
import { staticSeoPage } from '@/config/seo-pages';
import { pageMetadata } from '@/lib/seo-defaults';
import { getSeoOverride, withSeo } from '@/lib/seo';
import { getExtensionFeed } from '@/lib/extension/store';
import type { ExtensionFeedEntry } from '@/lib/extension/feed';
import { PageSeo } from '@/components/seo/page-seo';
import { PageFaqSection } from '@/components/faq/page-faq-section';
import { AddToChromeButton } from '@/components/extension/add-to-chrome-button';
import { SupplierLogo } from '@/components/ui/supplier-logo';
import { CheckIcon, CopyIcon, GlobeIcon, ShieldCheckIcon } from '@/components/icons/icons';

const PAGE = staticSeoPage('/extension');

export async function generateMetadata(): Promise<Metadata> {
  return withSeo(PAGE.path, pageMetadata(PAGE));
}

// The supported list is read from the same cache as the extension's feed,
// which every admin supplier save refreshes.
export const revalidate = 1800;

const STEPS = [
  {
    icon: GlobeIcon,
    title: 'Open a supported store',
    body: 'Visit any supplier on the list below in desktop Chrome.',
  },
  {
    icon: CopyIcon,
    title: 'See the code',
    body: `The extension shows that supplier's ${site.name} code and discount. Copy it, or fill it into the discount field, in one click.`,
  },
  {
    icon: CheckIcon,
    title: 'Check out yourself',
    body: 'Nothing is ever submitted for you. You review the cart and place the order on the supplier’s own site.',
  },
] as const;

async function loadSupportedSuppliers(): Promise<ExtensionFeedEntry[] | null> {
  try {
    return (await getExtensionFeed()).suppliers;
  } catch (error) {
    console.error('[extension] supported suppliers could not be loaded:', error);
    return null;
  }
}

function SupportedSuppliers({ suppliers }: { suppliers: ExtensionFeedEntry[] | null }) {
  if (suppliers === null) {
    return (
      <p className="mt-6 rounded-card border border-dashed border-line p-10 text-center text-sm text-muted">
        The supported supplier list couldn&rsquo;t be loaded right now. Every code is also on the{' '}
        <Link href="/coupons" className="font-bold text-brand-strong hover:underline">
          coupons page
        </Link>
        .
      </p>
    );
  }
  if (suppliers.length === 0) {
    return (
      <p className="mt-6 rounded-card border border-dashed border-line p-10 text-center text-sm text-muted">
        No suppliers are set up for the extension yet. Check back soon.
      </p>
    );
  }
  return (
    <ul className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
      {suppliers.map((supplier) => (
        <li key={supplier.id}>
          <Link
            href={`/suppliers/${supplier.id}`}
            className="flex items-center gap-3 rounded-card border border-line bg-surface-raised p-3 shadow-card transition-colors hover:border-brand"
          >
            <SupplierLogo src={supplier.logoUrl} name={supplier.name} size={36} className="h-9 w-9 rounded-chip" />
            <span className="min-w-0 flex-1">
              <span className="block truncate text-sm font-bold text-content">{supplier.name}</span>
              <span className="block truncate text-xs text-muted">{supplier.domains.join(', ')}</span>
            </span>
            <span className="shrink-0 rounded-pill bg-coupon-tint px-2.5 py-1 text-xs font-bold text-coupon-ink">
              {supplier.discount}
            </span>
          </Link>
        </li>
      ))}
    </ul>
  );
}

export default async function ExtensionPage() {
  const [seo, suppliers] = await Promise.all([getSeoOverride(PAGE.path), loadSupportedSuppliers()]);

  return (
    <div className="relative overflow-hidden">
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute left-1/2 top-0 h-[28rem] w-[56rem] -translate-x-1/2 rounded-full bg-brand/10 blur-[120px]" />
        <div className="absolute -right-24 top-40 h-72 w-72 rounded-full bg-accent/10 blur-3xl" />
      </div>

      <div className="mx-auto max-w-shell px-4 py-14">
        <PageSeo
          seo={PAGE}
          itemList={(suppliers ?? []).map((supplier) => ({ name: supplier.name, url: `/suppliers/${supplier.id}` }))}
        />

        <header className="max-w-3xl">
          <span className="inline-flex items-center gap-1.5 rounded-pill bg-brand-soft px-3 py-1.5 text-xs font-bold uppercase tracking-wide text-brand-strong">
            <GlobeIcon className="h-3.5 w-3.5" />
            Chrome extension
          </span>
          <h1 className="mt-3 text-4xl font-black tracking-tight text-content sm:text-5xl">{seo?.h1 || PAGE.h1}</h1>
          <p className="mt-5 text-base leading-relaxed text-muted sm:text-lg">
            {chromeExtension.name} shows verified {site.name} codes automatically when you visit a supported supplier
            site. Copy the code or fill it into the discount field in one click. It never submits an order for you.
          </p>
          <div className="mt-8 flex flex-wrap items-center gap-4">
            <AddToChromeButton />
            <span className="text-sm text-muted">Free · Desktop Chrome only</span>
          </div>
        </header>

        <section aria-labelledby="how-heading" className="mt-14">
          <h2 id="how-heading" className="text-2xl font-black text-content sm:text-3xl">
            How it <span className="italic text-brand">works</span>
          </h2>
          <ol className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-3">
            {STEPS.map((step, index) => (
              <li key={step.title} className="rounded-card border border-line bg-surface-raised p-6 shadow-card">
                <span className="flex h-10 w-10 items-center justify-center rounded-chip bg-brand-soft text-brand-strong">
                  <step.icon className="h-5 w-5" />
                </span>
                <h3 className="mt-4 text-base font-black text-content">
                  {index + 1}. {step.title}
                </h3>
                <p className="mt-1 text-sm leading-relaxed text-muted">{step.body}</p>
              </li>
            ))}
          </ol>
        </section>

        {chromeExtension.screenshots.length > 0 ? (
          <section aria-labelledby="screenshots-heading" className="mt-14">
            <h2 id="screenshots-heading" className="text-2xl font-black text-content sm:text-3xl">
              Screenshots
            </h2>
            <ul className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-2">
              {chromeExtension.screenshots.map((shot) => (
                <li key={shot.src} className="overflow-hidden rounded-card border border-line bg-surface-raised shadow-card">
                  <Image src={shot.src} alt={shot.alt} width={shot.width} height={shot.height} className="h-auto w-full" />
                </li>
              ))}
            </ul>
          </section>
        ) : null}

        <section aria-labelledby="supported-heading" className="mt-14">
          <h2 id="supported-heading" className="text-2xl font-black text-content sm:text-3xl">
            Supported <span className="italic text-brand">suppliers</span>
          </h2>
          <p className="mt-2 text-sm text-muted">
            {suppliers && suppliers.length > 0
              ? `${suppliers.length} suppliers, from the same list as our coupons page. New codes reach the extension by themselves.`
              : 'From the same list as our coupons page.'}
          </p>
          <SupportedSuppliers suppliers={suppliers} />
        </section>

        <PageFaqSection path={PAGE.path} className="mt-14" />

        <section
          aria-labelledby="disclosure-heading"
          className="mt-10 rounded-panel border border-line bg-surface-raised p-5 shadow-card sm:p-8"
        >
          <h2 id="disclosure-heading" className="flex items-center gap-2 text-lg font-black text-content">
            <ShieldCheckIcon className="h-5 w-5 text-brand" />
            Affiliate disclosure
          </h2>
          <p className="mt-3 text-sm leading-relaxed text-muted sm:text-base">
            Offer links in the extension are {site.name} affiliate links. If you buy through one, we may earn a
            commission at no extra cost to you. Commission never decides which suppliers or codes the extension shows.
            Read our{' '}
            <Link href="/disclaimer" className="font-semibold text-accent hover:underline">
              disclaimer
            </Link>{' '}
            and the{' '}
            <Link href="/extension/privacy" className="font-semibold text-accent hover:underline">
              extension privacy policy
            </Link>
            .
          </p>
        </section>
      </div>
    </div>
  );
}

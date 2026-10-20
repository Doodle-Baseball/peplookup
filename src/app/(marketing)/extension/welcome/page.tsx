import type { Metadata } from 'next';
import Link from 'next/link';
import { site } from '@/config/site';
import { chromeExtension } from '@/config/extension';
import type { SeoDefaults } from '@/lib/seo-defaults';
import { PageSeo } from '@/components/seo/page-seo';
import { ArrowRightIcon, CheckIcon, ExternalIcon, TagIcon } from '@/components/icons/icons';

/** Opened by the extension right after install, so never in search results or the sitemap. */
const PAGE: SeoDefaults = {
  path: '/extension/welcome',
  title: `You're all set | ${chromeExtension.name}`,
  description: `${chromeExtension.name} is installed.`,
  h1: 'You’re all set',
};

export const metadata: Metadata = {
  title: { absolute: PAGE.title },
  description: PAGE.description,
  robots: { index: false, follow: false },
};

const STEPS = [
  {
    title: 'Shop as usual',
    body: 'Open any supported supplier’s store in desktop Chrome.',
  },
  {
    title: 'Spot the code',
    body: `The extension shows that supplier’s ${site.name} code and the discount it gives.`,
  },
  {
    title: 'Copy or fill it in one click',
    body: 'Then review your cart and check out yourself. Nothing is ever submitted for you.',
  },
] as const;

export default function ExtensionWelcomePage() {
  return (
    <div className="relative overflow-hidden">
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute left-1/2 top-0 h-96 w-full max-w-3xl -translate-x-1/2 rounded-full bg-accent/10 blur-3xl" />
      </div>

      <div className="mx-auto max-w-2xl px-4 py-12 sm:px-6 sm:py-20">
        <PageSeo seo={PAGE} indexable={false} />
        <header className="text-center">
          <span className="mx-auto flex h-20 w-20 items-center justify-center rounded-pill bg-ok text-white shadow-lift">
            <CheckIcon className="h-9 w-9" />
          </span>
          <h1 className="mt-7 text-4xl font-black leading-tight tracking-tight text-content sm:text-6xl">{PAGE.h1}</h1>
          <p className="mt-3 text-balance text-lg font-semibold text-muted sm:text-xl">
            {chromeExtension.name} is installed and ready.
          </p>
        </header>

        <section
          aria-labelledby="how-heading"
          className="mt-10 rounded-panel border border-line bg-surface-raised p-5 shadow-card sm:mt-12 sm:p-8"
        >
          <h2 id="how-heading" className="text-micro font-bold uppercase tracking-wide text-faint">
            How it works
          </h2>
          <ol className="mt-5 space-y-5">
            {STEPS.map((step, index) => (
              <li key={step.title} className="flex gap-4">
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-pill bg-brand text-sm font-black text-white">
                  {index + 1}
                </span>
                <div className="min-w-0 pt-0.5">
                  <h3 className="text-sm font-black text-content">{step.title}</h3>
                  <p className="mt-0.5 text-sm leading-relaxed text-muted">{step.body}</p>
                </div>
              </li>
            ))}
          </ol>
        </section>

        <div className="mt-10 flex flex-col items-stretch justify-center gap-3 sm:flex-row sm:items-center">
          <Link
            href="/coupons"
            className="btn-3d inline-flex items-center justify-center gap-2 rounded-chip bg-brand px-7 py-3.5 text-sm font-bold text-white"
          >
            <TagIcon className="h-4 w-4" />
            Browse all coupon codes
            <ArrowRightIcon className="h-4 w-4" />
          </Link>
          <a
            href={site.communityUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center gap-2 rounded-chip border border-line bg-surface-raised px-7 py-3.5 text-sm font-bold text-content shadow-card transition-colors hover:border-brand"
          >
            Join the Skool community
            <ExternalIcon className="h-4 w-4" />
          </a>
        </div>
      </div>
    </div>
  );
}

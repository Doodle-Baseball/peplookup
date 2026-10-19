import type { Metadata } from 'next';
import Link from 'next/link';
import { chromeExtension } from '@/config/extension';
import type { SeoDefaults } from '@/lib/seo-defaults';
import { PageSeo } from '@/components/seo/page-seo';
import { UninstallFeedbackForm } from '@/components/extension/uninstall-feedback-form';

/** Opened by Chrome after the extension is removed, so never in search results or the sitemap. */
const PAGE: SeoDefaults = {
  path: '/extension/uninstalled',
  title: `Sorry to see you go | ${chromeExtension.name}`,
  description: `${chromeExtension.name} has been removed.`,
  h1: 'Sorry to see you go',
};

export const metadata: Metadata = {
  title: { absolute: PAGE.title },
  description: PAGE.description,
  robots: { index: false, follow: false },
};

export default function ExtensionUninstalledPage() {
  return (
    <div className="mx-auto max-w-xl px-4 py-12 sm:px-6 sm:py-20">
      <PageSeo seo={PAGE} indexable={false} />
      <header className="text-center">
        <h1 className="text-4xl font-black leading-tight tracking-tight text-content sm:text-5xl">{PAGE.h1}</h1>
        <p className="mt-3 text-base text-muted">
          {chromeExtension.name} has been removed. Every code is still on our{' '}
          <Link href="/coupons" className="font-bold text-brand-strong hover:underline">
            coupons page
          </Link>
          .
        </p>
      </header>

      <section className="relative mt-10 rounded-panel border border-line bg-surface-raised p-5 shadow-card sm:p-8">
        <UninstallFeedbackForm />
      </section>
    </div>
  );
}

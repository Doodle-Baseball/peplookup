import type { Metadata } from 'next';
import Link from 'next/link';
import { IntranasalCalculator } from '@/components/tools/intranasal-calculator';
import { InfoIcon } from '@/components/icons/icons';
import { staticSeoPage } from '@/config/seo-pages';
import { pageMetadata } from '@/lib/seo-defaults';
import { getSeoOverride, withSeo } from '@/lib/seo';
import { PageFaqSection } from '@/components/faq/page-faq-section';

const PAGE = staticSeoPage('/tools/intranasal');

export async function generateMetadata(): Promise<Metadata> {
  return withSeo(PAGE.path, pageMetadata(PAGE));
}

export default async function IntranasalToolPage() {
  const seo = await getSeoOverride(PAGE.path);
  return (
    <div className="mx-auto max-w-shell px-4 py-14">
      <section className="mx-auto max-w-2xl text-center">
        <span className="inline-flex items-center gap-1.5 rounded-pill bg-brand-soft px-3 py-1.5 text-xs font-bold uppercase tracking-wide text-brand-strong">
          Free tool
        </span>
        <h1 className="mt-3 text-4xl font-black tracking-tight text-content sm:text-5xl">
          {seo?.h1 || 'Intranasal Calculator'}
        </h1>
        <p className="mx-auto mt-4 max-w-xl text-sm text-muted sm:text-base">
          Pick a peptide or enter a custom vial, then work out mcg per spray, sprays and doses per bottle, and the
          cost of each spray and dose.
        </p>
      </section>

      <section className="mt-10">
        <IntranasalCalculator />
      </section>

      <section className="mt-6 rounded-card border border-brand/20 bg-brand-tint p-6 sm:p-8">
        <div className="flex gap-4">
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-brand/30 bg-surface-raised text-brand">
            <InfoIcon className="h-5 w-5" />
          </span>
          <div>
            <h2 className="text-sm font-black uppercase tracking-wide text-content">How this is calculated</h2>
            <p className="mt-2 max-w-3xl text-sm text-muted">
              Concentration is the vial&rsquo;s peptide in mcg divided by the BAC water added. Mcg per spray is that
              concentration divided by the bottle&rsquo;s sprays per mL, and sprays per bottle is the bottle volume
              times sprays per mL, rounded down because a part-filled last spray is not a usable one. Cost per spray
              divides the vial price by the sprays in one bottle, so it treats one vial as filling one bottle. Spray
              pumps vary, so check the volume
              per spray printed on your bottle (0.05 mL per spray is 20 sprays per mL). Cross-check the vial&rsquo;s
              real contents against a{' '}
              <Link href="/lab-reports" className="font-bold text-brand hover:underline">
                lab-verified COA
              </Link>{' '}
              before dosing from it.
            </p>
          </div>
        </div>
      </section>

      <PageFaqSection path="/tools/intranasal" className="mt-14" />
    </div>
  );
}

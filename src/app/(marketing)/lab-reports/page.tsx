import type { Metadata } from 'next';
import Link from 'next/link';
import { getSuppliers, getProducts, getAllOffers } from '@/lib/repository';
import { timeAgo } from '@/lib/format';
import type { ProductForm } from '@/lib/schema';
import { LabReportsExplorer, type LabVendorGroup } from '@/components/lab-reports/lab-reports-explorer';
import { DocumentIcon, FlaskIcon } from '@/components/icons/icons';
import { site } from '@/config/site';
import { staticSeoPage } from '@/config/seo-pages';
import { pageMetadata } from '@/lib/seo-defaults';
import { getSeoOverride, withSeo } from '@/lib/seo';
import { PageFaqSection } from '@/components/faq/page-faq-section';

const PAGE = staticSeoPage('/lab-reports');

export async function generateMetadata(): Promise<Metadata> {
  return withSeo(PAGE.path, pageMetadata(PAGE));
}

const FORM_LABELS: Record<ProductForm, string> = {
  vial: 'Vial',
  capsule: 'Capsule',
  spray: 'Spray',
  kit: 'Kit',
  pen: 'Pen',
  serum: 'Serum',
};

export default async function LabReportsPage({
  searchParams,
}: {
  searchParams: Promise<{ supplier?: string; q?: string }>;
}) {
  const sp = await searchParams;
  const [suppliers, products, offers, seo] = await Promise.all([
    getSuppliers(),
    getProducts(),
    getAllOffers(),
    getSeoOverride(PAGE.path),
  ]);

  const suppliersBySlug = new Map(suppliers.map((s) => [s.slug, s]));
  const productsBySlug = new Map(products.map((p) => [p.slug, p]));

  // Group every offer that carries a real lab report, or the vendor's own
  // published COA document, by its vendor. A graded report with no
  // reportUrl still counts as a completed test, it just has nothing to link
  // out to; a plain COA link has no grade or score, only the document.
  const rowsBySupplier = new Map<string, LabVendorGroup['rows']>();
  let mostRecentTestedAt: string | null = null;

  for (const offer of offers) {
    const report = offer.labReport;
    if (!report && !offer.coaUrl) continue;
    const supplier = suppliersBySlug.get(offer.supplierSlug);
    const product = productsBySlug.get(offer.productSlug);
    if (!supplier || !product) continue;

    if (report?.testedAt && (mostRecentTestedAt === null || report.testedAt > mostRecentTestedAt)) {
      mostRecentTestedAt = report.testedAt;
    }

    const mg = offer.vialSize / 1000;
    const doseLabel = offer.vialCount > 1 ? `${mg} mg · ${offer.vialCount} vials` : `${mg}mg`;

    const rows = rowsBySupplier.get(supplier.slug) ?? [];
    rows.push({
      key: `${offer.supplierSlug}-${offer.productSlug}-${offer.form}-${offer.vialSize}-${offer.vialCount}`,
      productName: product.name,
      productSlug: product.slug,
      productImage: product.images[0] ?? offer.imageUrl ?? null,
      category: product.category,
      formLabel: FORM_LABELS[offer.form],
      doseLabel,
      // Prefer the graded report's own document, then the testing lab's own
      // site, then the vendor's published COA. All are real URLs, never a
      // fabricated one.
      reportUrl: report?.reportUrl ?? report?.labUrl ?? offer.coaUrl ?? null,
    });
    rowsBySupplier.set(supplier.slug, rows);
  }

  const vendorGroups: LabVendorGroup[] = [...rowsBySupplier.entries()]
    .map(([slug, rows]) => {
      const supplier = suppliersBySlug.get(slug)!;
      return {
        slug,
        name: supplier.name,
        logo: supplier.logoUrl ?? supplier.faviconUrl,
        labName: supplier.coaLabName,
        rows,
      };
    })
    .sort((a, b) => a.name.localeCompare(b.name));

  const testsTotal = vendorGroups.reduce((sum, v) => sum + v.rows.length, 0);

  // Quick search covers every real substance (compound) name plus every
  // vendor that actually has at least one test on file, nothing curated.
  const quickSearchTerms = [
    ...new Set([...products.map((p) => p.name), ...vendorGroups.map((v) => v.name)]),
  ];

  const initialQuery = (sp.supplier ?? sp.q ?? '').trim();

  return (
    <div className="mx-auto max-w-shell px-4 py-14">
      <section className="mx-auto max-w-2xl text-center">
        <p className="flex items-center justify-center gap-3 text-xs font-bold uppercase tracking-[0.2em] text-brand">
          <span aria-hidden="true" className="h-px w-8 bg-brand/40" />
          Laboratory Verification
          <span aria-hidden="true" className="h-px w-8 bg-brand/40" />
        </p>
        <h1 className="mt-3 text-4xl font-black tracking-tight text-content sm:text-5xl">
          {seo?.h1 ? (
            seo.h1
          ) : (
            <>
              COA Test Reports <span className="italic text-brand">Scored</span>
            </>
          )}
        </h1>
        <p className="mx-auto mt-4 max-w-xl text-sm text-muted sm:text-base">
          Independent third-party lab results from verified vendors, covering purity, concentration and identity
          testing for the peptides listed on this site.
        </p>

        <div className="mt-8 flex flex-wrap items-center justify-center gap-x-8 gap-y-3 rounded-card border border-line bg-surface-raised px-6 py-5 shadow-card">
          {mostRecentTestedAt ? (
            <span className="inline-flex items-center gap-1.5 rounded-pill bg-brand-soft px-3 py-1.5 text-xs font-bold uppercase tracking-wide text-brand-strong">
              <span aria-hidden="true" className="h-1.5 w-1.5 rounded-pill bg-brand" />
              Updated {timeAgo(mostRecentTestedAt)}
            </span>
          ) : null}
          <span className="text-center">
            <span className="block text-2xl font-black text-content">{vendorGroups.length}</span>
            <span className="block text-micro font-bold uppercase tracking-wide text-faint">Vendors</span>
          </span>
          <span className="text-center">
            <span className="block text-2xl font-black text-content">{testsTotal}</span>
            <span className="block text-micro font-bold uppercase tracking-wide text-faint">Tests total</span>
          </span>
        </div>
      </section>

      <section className="mt-10 rounded-panel border border-line bg-surface-raised p-5 shadow-card sm:p-8">
        <h2 className="text-lg font-black text-content sm:text-xl">
          COA <span className="text-brand">Lab Reports</span>
        </h2>
        <p className="mt-3 text-sm leading-relaxed text-muted sm:text-base">
          Every report below links to a certificate of analysis published by the vendor or produced
          by a third-party testing laboratory on their behalf. {site.name} does not run tests or
          rehost documents. You always read the original, and a report&rsquo;s presence here means
          only that the vendor made it accessible, not that its claims have been independently verified
          by us.
        </p>
      </section>

      <section className="mt-10">
        {vendorGroups.length === 0 ? (
          <div className="rounded-card border border-dashed border-line bg-surface-raised p-10 text-center text-sm text-muted">
            <FlaskIcon className="mx-auto h-6 w-6 text-faint" />
            <p className="mt-3">No lab reports recorded yet. Verified COA results appear here once a vendor's tests are on file.</p>
          </div>
        ) : (
          <LabReportsExplorer vendors={vendorGroups} quickSearchTerms={quickSearchTerms} initialQuery={initialQuery} />
        )}
      </section>

      <section className="mt-10 rounded-panel border border-line bg-surface-raised p-5 shadow-card sm:p-8">
        <h2 className="text-lg font-black text-content sm:text-xl">
          Not Sure What You&rsquo;re <span className="text-brand">Looking At?</span>
        </h2>
        <div className="mt-4 flex flex-wrap items-center justify-between gap-4">
          <p className="max-w-2xl text-sm leading-relaxed text-muted sm:text-base">
            A COA can look intimidating on first read. Our COA Reader breaks down every
            field, explains what the numbers mean, and flags the warning signs that signal
            a fake or incomplete certificate.
          </p>
          <Link
            href="/tools/coa-reader"
            className="btn-3d inline-flex shrink-0 items-center gap-2 rounded-chip bg-brand px-5 py-2.5 text-sm font-bold text-white transition-colors hover:bg-brand-strong"
          >
            <DocumentIcon className="h-4 w-4" />
            Open COA Reader
          </Link>
        </div>
      </section>

      <PageFaqSection path="/lab-reports" className="mt-14" />
    </div>
  );
}

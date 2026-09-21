import type { Metadata } from 'next';
import Link from 'next/link';
import { AdminPageHeader } from '@/components/admin/page-header';
import { CompoundCsvImport } from '@/components/admin/compound-csv-import';
import { getCompoundImportContext, type CompoundImportContext } from '@/lib/admin/compounds';
import {
  COMPOUND_CSV_SECTIONS,
  CSV_COMMA_SEPARATOR,
  CSV_PIPE_SEPARATOR,
} from '@/lib/compound-import';
import { ArrowLeftIcon } from '@/components/icons/icons';

export const metadata: Metadata = {
  title: 'Upload compounds CSV | Admin',
  robots: { index: false, follow: false },
};

// Existing compounds change with every import; never serve a build-time snapshot of them.
export const dynamic = 'force-dynamic';

export default async function UploadCompoundsCsvPage() {
  let context: CompoundImportContext | null = null;
  let contextError: string | null = null;
  try {
    context = await getCompoundImportContext();
  } catch (error) {
    // The upload still works without it; only the "already exists" preview and category list are lost.
    contextError = error instanceof Error ? error.message : 'Existing compounds could not be loaded.';
  }

  return (
    <>
      <AdminPageHeader title="Upload compounds CSV" />
      <div className="px-4 py-6 sm:px-8 sm:py-8">
        <Link
          href="/admin/compounds"
          className="mb-6 inline-flex items-center gap-1.5 text-sm font-semibold text-muted hover:text-brand"
        >
          <ArrowLeftIcon className="h-4 w-4" />
          Back to compounds
        </Link>

        {contextError ? (
          <p role="status" className="mb-6 rounded-chip border border-warn/30 bg-warn/5 px-4 py-3 text-sm text-content">
            {contextError}
          </p>
        ) : null}

        <div className="grid grid-cols-1 gap-6 xl:grid-cols-3 xl:items-start">
          <div className="xl:col-span-2">
            <CompoundCsvImport identities={context?.identities ?? null} />
          </div>

          <aside className="rounded-card border border-line bg-surface-raised p-5 sm:p-6">
            <h2 className="text-base font-black text-content">CSV format</h2>
            <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-muted">
              <li>The first row holds the column names. Every column below must be present, in any order.</li>
              <li>
                Only <code className="font-bold text-content">name</code> is required per row; blank cells are saved as empty.
              </li>
              <li>
                Use <code className="font-bold text-content">{CSV_COMMA_SEPARATOR}</code> between categories and aliases, and{' '}
                <code className="font-bold text-content">{CSV_PIPE_SEPARATOR}</code> between forms, intake types and purpose
                pills. Wrap a cell containing commas in double quotes (spreadsheet apps do this for you).
              </li>
              <li>A benefit, evidence entry or interaction needs both its title and description, or neither.</li>
              <li>Filled titles and descriptions must fit the character range shown.</li>
            </ul>

            {context && context.categories.length > 0 ? (
              <>
                <h3 className="mt-5 text-micro font-bold uppercase text-faint">Categories in use</h3>
                <ul className="mt-2 flex flex-wrap gap-1.5">
                  {context.categories.map((category) => (
                    <li key={category} className="rounded-pill bg-surface-sunken px-2.5 py-1 text-xs font-semibold text-content">
                      {category}
                    </li>
                  ))}
                </ul>
              </>
            ) : null}

            <div className="mt-5 space-y-2">
              {COMPOUND_CSV_SECTIONS.map((section, index) => (
                <details key={section.title} open={index === 0} className="rounded-chip border border-line bg-surface px-3 py-2">
                  <summary className="cursor-pointer text-sm font-bold text-content">
                    {section.title} <span className="font-normal text-faint">({section.columns.length} columns)</span>
                  </summary>
                  <dl className="mt-2 space-y-2 pb-1">
                    {section.columns.map((column) => (
                      <div key={column.header}>
                        <dt className="font-mono text-xs font-bold text-content">
                          {column.header}
                          {column.length ? (
                            <span className="ml-2 font-sans font-semibold text-faint">
                              {column.length[0]}–{column.length[1]} chars
                            </span>
                          ) : null}
                        </dt>
                        <dd className="text-xs text-muted">{column.note}</dd>
                      </div>
                    ))}
                  </dl>
                </details>
              ))}
            </div>
          </aside>
        </div>
      </div>
    </>
  );
}

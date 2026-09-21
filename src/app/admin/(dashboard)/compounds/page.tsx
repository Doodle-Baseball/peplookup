import type { Metadata } from 'next';
import Link from 'next/link';
import { listCompounds } from '@/lib/admin/compounds';
import { ReorderRows } from '@/components/admin/reorder-rows';
import { saveCompoundOrderAction } from './actions';
import { getAllOffers } from '@/lib/repository';
import { AdminDbError } from '@/lib/admin/vendors';
import { AdminPageHeader } from '@/components/admin/page-header';
import { CompoundFlagToggle } from './compound-flag-toggle';
import { CompoundDeleteButton } from './compound-delete-button';
import { SearchIcon, PencilIcon, WarningIcon } from '@/components/icons/icons';
import { LiveSearchInput } from '@/components/ui/live-search-input';

export const metadata: Metadata = { title: 'Compounds | Admin', robots: { index: false, follow: false } };

export default async function AdminCompoundsPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const { q } = await searchParams;
  const query = (q ?? '').trim();

  // The offers read doesn't depend on the compound list, so it starts here and
  // is awaited below rather than queueing behind it.
  const offersPromise = getAllOffers();

  let compounds: Awaited<ReturnType<typeof listCompounds>> = [];
  let loadError: string | null = null;
  try {
    compounds = await listCompounds(query);
  } catch (error) {
    loadError = error instanceof AdminDbError ? error.message : 'Failed to load compounds.';
  }

  // Bucketed once rather than re-scanning every offer for each compound.
  const offersByProduct = new Map<string, Awaited<typeof offersPromise>[number][]>();
  for (const offer of await offersPromise) {
    const bucket = offersByProduct.get(offer.productSlug);
    if (bucket) bucket.push(offer);
    else offersByProduct.set(offer.productSlug, [offer]);
  }

  const rows = loadError
    ? []
    : compounds.map((compound) => {
        const offers = offersByProduct.get(compound.slug) ?? [];
        const doses = [...new Set(offers.map((o) => `${o.vialSize / 1000}mg`))];
        const vendorCount = new Set(offers.map((o) => o.supplierSlug)).size;
        const coaCount = offers.filter((o) => o.labReport !== null).length;
        return { compound, doses, vendorCount, coaCount };
      });

  return (
    <>
      <AdminPageHeader title="Compounds" />
      <div className="px-4 py-6 sm:px-8 sm:py-8">
        <p className="text-sm text-muted">Create products, images, and top sellers</p>

        {loadError ? (
          <div className="mt-6 flex items-start gap-3 rounded-card border border-danger/30 bg-danger/5 p-5">
            <WarningIcon className="mt-0.5 h-5 w-5 shrink-0 text-danger" />
            <div>
              <p className="text-sm font-bold text-content">Compounds table isn&rsquo;t ready</p>
              <p className="mt-1 text-sm text-muted">{loadError}</p>
              <Link href="/admin" className="mt-2 inline-block text-sm font-semibold text-brand hover:underline">
                See setup instructions on the Overview page →
              </Link>
            </div>
          </div>
        ) : (
          <div className="mt-6 rounded-card border border-line bg-surface-raised">
            <div className="flex flex-col gap-3 border-b border-line p-4 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between sm:p-5">
              <p className="text-lg font-black text-content">
                {rows.length} compound{rows.length === 1 ? '' : 's'}
              </p>
              <div className="flex w-full flex-col gap-3 sm:w-auto sm:flex-row sm:flex-wrap sm:items-center">
                <form className="w-full sm:w-auto" action="/admin/compounds">
                  <label htmlFor="q" className="sr-only">
                    Search compounds
                  </label>
                  <div className="search-field flex items-center gap-2 border px-3 py-2">
                    <SearchIcon className="h-4 w-4 shrink-0 text-faint" />
                    <LiveSearchInput
                      id="q"
                      name="q"
                      defaultValue={query}
                      placeholder="Search compounds…"
                      className="w-full min-w-0 bg-transparent text-sm text-content outline-none placeholder:text-faint sm:w-48"
                    />
                  </div>
                </form>
                <Link
                  href="/admin/compounds/upload-csv"
                  className="rounded-chip border border-line bg-surface px-4 py-2.5 text-center text-sm font-bold text-content transition-colors hover:border-brand hover:text-brand"
                >
                  Upload CSV
                </Link>
                <Link
                  href="/admin/compounds/new"
                  className="rounded-chip bg-brand px-4 py-2.5 text-center text-sm font-bold text-white hover:bg-brand-strong"
                >
                  Add compound
                </Link>
              </div>
            </div>

            {rows.length === 0 ? (
              <p className="p-10 text-center text-sm text-muted">
                {query ? `No compounds match "${query}".` : 'No compounds yet. Add the first one.'}
              </p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full min-w-[48rem] border-collapse text-sm">
                  <thead>
                    <tr className="border-b border-line text-left text-micro font-bold uppercase text-faint">
                      <th scope="col" className="w-8 pl-3">
                        <span className="sr-only">Reorder</span>
                      </th>
                      <th scope="col" className="px-5 py-3">Name</th>
                      <th scope="col" className="px-5 py-3">Doses</th>
                      <th scope="col" className="px-5 py-3">Vendors</th>
                      <th scope="col" className="px-5 py-3">COA</th>
                      <th scope="col" className="px-5 py-3">Compound</th>
                      <th scope="col" className="px-5 py-3">
                        <span className="sr-only">Actions</span>
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    <ReorderRows
                      slugs={rows.map(({ compound }) => compound.slug)}
                      saveOrder={saveCompoundOrderAction}
                      disabledReason={
                        query ? 'Clear the search to reorder. Dragging a filtered list would only renumber the rows you can see.' : undefined
                      }
                    >
                    {rows.map(({ compound, doses, vendorCount, coaCount }) => (
                      <tr key={compound.slug} className="border-b border-line last:border-0">
                        <td className="px-5 py-4">
                          <p className="font-bold text-content">{compound.name}</p>
                          {compound.forms.length > 0 ? (
                            <p className="text-xs capitalize text-muted">{compound.forms.join(', ')}</p>
                          ) : null}
                        </td>
                        <td className="px-5 py-4 text-content">{doses.length ? doses.join(', ') : ''}</td>
                        <td className="px-5 py-4 text-content">{vendorCount}</td>
                        <td className="px-5 py-4 text-content">{coaCount}</td>
                        <td className="px-5 py-4">
                          <CompoundFlagToggle slug={compound.slug} isCompound={compound.isCompound} />
                        </td>
                        <td className="px-5 py-4">
                          <div className="flex items-center justify-end gap-1">
                            <Link
                              href={`/admin/compounds/${compound.slug}/edit`}
                              aria-label={`Edit ${compound.name}`}
                              className="rounded-chip p-2 text-muted transition-colors hover:bg-surface-sunken hover:text-brand"
                            >
                              <PencilIcon className="h-4 w-4" />
                            </Link>
                            <CompoundDeleteButton slug={compound.slug} name={compound.name} />
                          </div>
                        </td>
                      </tr>
                    ))}
                    </ReorderRows>
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </div>
    </>
  );
}

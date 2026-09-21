import type { Metadata } from 'next';
import Link from 'next/link';
import Image from 'next/image';
import { listVendors, AdminDbError } from '@/lib/admin/vendors';
import { ReorderRows } from '@/components/admin/reorder-rows';
import { saveVendorOrderAction } from './actions';
import { AdminPageHeader } from '@/components/admin/page-header';
import { BulkVendorImport } from '@/components/admin/bulk-vendor-import';
import { VendorStatusToggle } from './vendor-status-toggle';
import { VendorFeaturedToggle } from './vendor-featured-toggle';
import { VendorDeleteButton } from './vendor-delete-button';
import { SearchIcon, PencilIcon, ExternalIcon, WarningIcon } from '@/components/icons/icons';
import { LiveSearchInput } from '@/components/ui/live-search-input';

export const metadata: Metadata = { title: 'Vendors | Admin', robots: { index: false, follow: false } };

export default async function AdminVendorsPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const { q } = await searchParams;
  const query = (q ?? '').trim();

  let vendors: Awaited<ReturnType<typeof listVendors>> = [];
  let loadError: string | null = null;
  try {
    vendors = await listVendors(query);
  } catch (error) {
    loadError = error instanceof AdminDbError ? error.message : 'Failed to load vendors.';
  }

  return (
    <>
      <AdminPageHeader title="Vendors" />
      <div className="px-4 py-6 sm:px-8 sm:py-8">
        <p className="text-sm text-muted">Create and manage marketplace suppliers</p>

        {loadError ? (
          <div className="mt-6 flex items-start gap-3 rounded-card border border-danger/30 bg-danger/5 p-5">
            <WarningIcon className="mt-0.5 h-5 w-5 shrink-0 text-danger" />
            <div>
              <p className="text-sm font-bold text-content">Vendors table isn&rsquo;t ready</p>
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
                {vendors.length} vendor{vendors.length === 1 ? '' : 's'}
              </p>
              <div className="flex w-full flex-col gap-3 sm:w-auto sm:flex-row sm:flex-wrap sm:items-center">
                <form className="w-full sm:w-auto" action="/admin/vendors">
                  <label htmlFor="q" className="sr-only">
                    Search vendors
                  </label>
                  <div className="search-field flex items-center gap-2 border px-3 py-2">
                    <SearchIcon className="h-4 w-4 shrink-0 text-faint" />
                    <LiveSearchInput
                      id="q"
                      name="q"
                      defaultValue={query}
                      placeholder="Search vendors…"
                      className="w-full min-w-0 bg-transparent text-sm text-content outline-none placeholder:text-faint sm:w-48"
                    />
                  </div>
                </form>
                <Link
                  href="/admin/vendors/new"
                  className="rounded-chip bg-brand px-4 py-2.5 text-center text-sm font-bold text-white hover:bg-brand-strong"
                >
                  Add vendor
                </Link>
                <BulkVendorImport />
              </div>
            </div>

            {vendors.length === 0 ? (
              <p className="p-10 text-center text-sm text-muted">
                {query ? `No vendors match "${query}".` : 'No vendors yet. Add the first one.'}
              </p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full min-w-[52rem] border-collapse text-sm">
                  <thead>
                    <tr className="border-b border-line text-left text-micro font-bold uppercase text-faint">
                      <th scope="col" className="w-8 pl-3">
                        <span className="sr-only">Reorder</span>
                      </th>
                      <th scope="col" className="px-5 py-3">Name</th>
                      <th scope="col" className="px-5 py-3">Country</th>
                      <th scope="col" className="px-5 py-3">Affiliate Link</th>
                      <th scope="col" className="px-5 py-3">Status</th>
                      <th scope="col" className="px-5 py-3">Featured</th>
                      <th scope="col" className="px-5 py-3">
                        <span className="sr-only">Actions</span>
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    <ReorderRows
                      slugs={vendors.map((v) => v.slug)}
                      saveOrder={saveVendorOrderAction}
                      disabledReason={
                        query ? 'Clear the search to reorder. Dragging a filtered list would only renumber the rows you can see.' : undefined
                      }
                    >
                    {vendors.map((vendor) => {
                      const logo = vendor.logoUrl ?? vendor.faviconUrl;
                      return (
                        <tr key={vendor.slug} className="border-b border-line last:border-0">
                          <td className="px-5 py-4">
                            <div className="flex min-w-0 items-center gap-3">
                              <span className="flex h-9 w-9 shrink-0 items-center justify-center overflow-hidden rounded-chip border border-line bg-surface">
                                {logo ? (
                                  <Image src={logo} alt="" width={36} height={36} className="h-full w-full object-contain" unoptimized />
                                ) : (
                                  <span aria-hidden="true" className="text-sm font-bold text-faint">
                                    {vendor.name.charAt(0)}
                                  </span>
                                )}
                              </span>
                              <div className="min-w-0">
                                <p className="truncate font-bold text-content">{vendor.name}</p>
                                {vendor.description ? (
                                  <p className="max-w-[16rem] truncate text-xs text-muted">
                                    {vendor.description}
                                  </p>
                                ) : null}
                              </div>
                            </div>
                          </td>
                          <td className="px-5 py-4 text-content">{vendor.country ?? ''}</td>
                          <td className="px-5 py-4">
                            <a
                              href={vendor.affiliateUrl || vendor.homepageUrl}
                              target="_blank"
                              rel="noopener"
                              className="inline-flex items-center gap-1 font-semibold text-brand hover:underline"
                            >
                              Link
                              <ExternalIcon className="h-3 w-3" />
                            </a>
                          </td>
                          <td className="px-5 py-4">
                            <VendorStatusToggle slug={vendor.slug} isActive={vendor.isActive} />
                          </td>
                          <td className="px-5 py-4">
                            <VendorFeaturedToggle slug={vendor.slug} isFeatured={vendor.isFeatured} />
                          </td>
                          <td className="px-5 py-4">
                            <div className="flex items-center justify-end gap-1">
                              <Link
                                href={`/admin/vendors/${vendor.slug}/edit`}
                                aria-label={`Edit ${vendor.name}`}
                                className="rounded-chip p-2 text-muted transition-colors hover:bg-surface-sunken hover:text-brand"
                              >
                                <PencilIcon className="h-4 w-4" />
                              </Link>
                              <VendorDeleteButton slug={vendor.slug} name={vendor.name} />
                            </div>
                          </td>
                        </tr>
                      );
                    })}
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

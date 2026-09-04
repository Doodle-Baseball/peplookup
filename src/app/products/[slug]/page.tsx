import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { getProduct, getProducts, getOffersForProduct, toListing } from '@/lib/repository';
import { rankByPricePerMg } from '@/lib/price';
import { formatPerMg, formatMoney } from '@/lib/money';
import { timeAgo, isStale } from '@/lib/format';
import { Badge } from '@/components/ui/badge';

export async function generateStaticParams() {
  const products = await getProducts();
  return products.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const product = await getProduct(slug);
  if (!product) return { title: 'Product not found' };
  return {
    title: `${product.name} Prices — Compare Cost per mg`,
    description:
      product.summary ?? `Compare ${product.name} prices across verified suppliers by cost per mg.`,
    alternates: { canonical: `/products/${product.slug}` },
  };
}

export default async function ProductPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const product = await getProduct(slug);
  if (!product) notFound();

  const offers = await getOffersForProduct(product.slug);
  const ranked = rankByPricePerMg(offers.map(toListing));

  return (
    <div className="mx-auto max-w-shell px-4 py-10">
      <nav aria-label="Breadcrumb" className="mb-6 text-sm text-muted">
        <Link href="/" className="hover:text-brand">
          Search
        </Link>
        <span aria-hidden="true"> / </span>
        <span className="text-content">{product.name}</span>
      </nav>

      <header>
        <h1 className="text-3xl font-black text-content sm:text-4xl">{product.name}</h1>
        {product.category ? (
          <div className="mt-3">
            <Badge tone="ok">{product.category}</Badge>
          </div>
        ) : null}
        {product.summary ? (
          <p className="mt-4 max-w-3xl text-sm text-muted">{product.summary}</p>
        ) : null}
      </header>

      <section className="mt-8">
        <h2 className="text-xl font-black text-content">Prices</h2>

        {ranked.length === 0 ? (
          <p className="mt-3 rounded-card border border-dashed border-line bg-surface-raised p-10 text-center text-sm text-muted">
            No in-stock prices recorded for {product.name} yet.
          </p>
        ) : (
          <div className="mt-3 overflow-x-auto rounded-card border border-line">
            <table className="w-full min-w-[40rem] border-collapse bg-surface-raised text-sm">
              <thead>
                <tr className="border-b border-line text-left">
                  <th scope="col" className="px-4 py-3 font-bold">Supplier</th>
                  <th scope="col" className="px-4 py-3 font-bold">Cost per mg</th>
                  <th scope="col" className="px-4 py-3 font-bold">Price</th>
                  <th scope="col" className="px-4 py-3 font-bold">Updated</th>
                </tr>
              </thead>
              <tbody>
                {ranked.map(({ listing, perMg }) => (
                  <tr key={listing.supplierSlug} className="border-b border-line last:border-0">
                    <th scope="row" className="px-4 py-3 text-left font-semibold">
                      <Link href={`/suppliers/${listing.supplierSlug}`} className="hover:text-brand">
                        {listing.supplierSlug}
                      </Link>
                    </th>
                    <td className="px-4 py-3 font-bold text-brand-strong">
                      {formatPerMg(perMg, listing.currency)}
                    </td>
                    <td className="px-4 py-3">
                      {formatMoney(listing.salePrice ?? listing.listPrice, listing.currency)}
                    </td>
                    <td className="px-4 py-3 text-muted">
                      {timeAgo(listing.scrapedAt)}
                      {isStale(listing.scrapedAt) ? (
                        <span className="ml-2 font-bold text-warn">stale</span>
                      ) : null}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}

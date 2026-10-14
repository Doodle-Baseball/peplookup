import type { SeoDefaults } from '@/lib/seo-defaults';
import {
  buildPageGraph,
  serializeGraph,
  type ItemListEntry,
  type ProductOfferSummary,
  type SupplierSubject,
} from '@/lib/structured-data/graph';
import { isSchemaExcluded } from '@/lib/structured-data/page-routes';
import { latestDate, resolvePageSeo } from '@/lib/structured-data/page-seo';

export interface PageSeoProps {
  /** The same defaults the page passes to pageMetadata(), so both resolve identically. */
  seo: SeoDefaults;
  /** For pages with their own indexing rule; otherwise the /admin/seo setting applies. */
  indexable?: boolean;
  /** Dates the page's own data last changed (offer scrapes, publish dates). */
  dataDates?: readonly (string | null | undefined)[];
  itemList?: readonly ItemListEntry[];
  supplier?: SupplierSubject;
  article?: { datePublished?: string | null };
  product?: ProductOfferSummary | null;
}

/**
 * The page's JSON-LD, rendered on the server from the same resolved title,
 * description and H1 as its metadata. Renders nothing visible: the breadcrumb
 * trail exists only as the BreadcrumbList. Noindex pages, and routes excluded
 * from structured data, output nothing at all.
 */
export async function PageSeo({
  seo,
  indexable,
  dataDates = [],
  itemList,
  supplier,
  article,
  product,
}: PageSeoProps) {
  const page = await resolvePageSeo(seo, { indexable });
  if (!page.indexable || isSchemaExcluded(page.path)) return null;

  const dateModified = latestDate([page.updatedAt, ...dataDates]);

  const graph = buildPageGraph({
    path: page.path,
    canonicalUrl: page.canonicalUrl,
    title: page.title,
    description: page.description,
    heading: page.heading,
    dateModified,
    itemList,
    supplier,
    article: article ? { datePublished: article.datePublished, dateModified } : undefined,
    product,
  });

  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: serializeGraph(graph) }} />;
}

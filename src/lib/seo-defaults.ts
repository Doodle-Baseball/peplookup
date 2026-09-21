import type { Metadata } from 'next';
import { site } from '@/config/site';

/**
 * The SEO a page has before anyone edits it in /admin/seo. Pages build their
 * metadata from these, and the dashboard shows the same values as each card's
 * starting point, so the two can never drift apart.
 */
export interface SeoDefaults {
  path: string;
  title: string;
  description: string;
  h1: string;
}

export function pageMetadata(defaults: SeoDefaults): Metadata {
  return {
    // Absolute: the stored title is already the full string shown in search results.
    title: { absolute: defaults.title },
    description: defaults.description,
    alternates: { canonical: defaults.path },
  };
}

export function compoundSeoDefaults(compound: { slug: string; name: string }): SeoDefaults {
  return {
    path: `/products/${compound.slug}`,
    title: `${compound.name} | Compare Prices, Vendors & COA | ${site.name}`,
    description: `Compare ${compound.name} prices per mg across verified suppliers, with stock status, shipping and lab-verification data.`,
    h1: compound.name,
  };
}

export function supplierSeoDefaults(supplier: { slug: string; name: string }): SeoDefaults {
  return {
    path: `/suppliers/${supplier.slug}`,
    title: `${supplier.name} | Supplier Profile, Prices & Coupons | ${site.name}`,
    description: `Prices, shipping, payment methods, lab verification status and discount codes for ${supplier.name}.`,
    h1: supplier.name,
  };
}

export function guideSeoDefaults(guide: { slug: string; title: string; excerpt: string }): SeoDefaults {
  return {
    path: `/guides/${guide.slug}`,
    title: `${guide.title} | ${site.name}`,
    description: guide.excerpt,
    h1: guide.title,
  };
}

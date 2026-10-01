/**
 * How long the shared server caches live before they re-read Supabase.
 *
 * A cache's lifetime is also the lifetime of every prerendered page that reads
 * it (the page inherits the shortest one), so a short window means each of those
 * pages is regenerated and rewritten that often while anyone is visiting.
 * Every admin save already drops the affected cache by tag, so these windows only
 * matter for rows changed outside the admin (SQL editor, seed scripts).
 */

/** Suppliers, products, guides, reviews, SEO overrides, FAQs and supplier text. */
export const CATALOGUE_REVALIDATE_SECONDS = 3600;

/** Offers carry prices and stock, so they refresh more often than the rest. */
export const OFFERS_REVALIDATE_SECONDS = 1800;

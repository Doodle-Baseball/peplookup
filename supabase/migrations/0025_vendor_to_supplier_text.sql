-- Replaces the word "vendor" with "supplier" in text stored in the database, to match the site's wording.
--
-- Run this once in the Supabase SQL editor. It is safe to re-run: once the text has been
-- replaced there is nothing left to match, so a second run changes no rows.
--
-- Only whole words are replaced (Vendor, Vendors, vendor, vendors), and only in the text columns
-- listed here, so URLs, slugs, table and column names, and anything inside a longer word
-- (for example "vendor_name") are never touched. offers.product_url is deliberately NOT in the list.
--
-- Columns changed (row counts at the time this was written):
--   seo_pages.meta_title (36), meta_description (3), keywords (3)
--   page_faqs.answer (30)
--   supplier_reviews.body (5)
--   suppliers.description (1)
--   supplier_page_content.about_body (18), compare_body (7)
--   product_faqs.answer (8)

create or replace function pg_temp.to_supplier(input text) returns text
language sql immutable as $$
  select regexp_replace(
           regexp_replace(input, '\mVendor(s?)\M', 'Supplier\1', 'g'),
           '\mvendor(s?)\M', 'supplier\1', 'g')
$$;

update public.seo_pages
   set meta_title = pg_temp.to_supplier(meta_title),
       meta_description = pg_temp.to_supplier(meta_description),
       h1 = pg_temp.to_supplier(h1),
       keywords = array(select pg_temp.to_supplier(k) from unnest(keywords) as k)
 where meta_title ~* '\mvendors?\M'
    or meta_description ~* '\mvendors?\M'
    or h1 ~* '\mvendors?\M'
    or exists (select 1 from unnest(keywords) as k where k ~* '\mvendors?\M');

update public.page_faqs
   set answer = pg_temp.to_supplier(answer),
       question = pg_temp.to_supplier(question)
 where answer ~* '\mvendors?\M' or question ~* '\mvendors?\M';

update public.supplier_reviews
   set body = pg_temp.to_supplier(body)
 where body ~* '\mvendors?\M';

update public.suppliers
   set description = pg_temp.to_supplier(description)
 where description ~* '\mvendors?\M';

update public.supplier_page_content
   set about_title = pg_temp.to_supplier(about_title),
       about_body = pg_temp.to_supplier(about_body),
       why_title = pg_temp.to_supplier(why_title),
       why_body = pg_temp.to_supplier(why_body),
       compare_title = pg_temp.to_supplier(compare_title),
       compare_body = pg_temp.to_supplier(compare_body)
 where about_title ~* '\mvendors?\M' or about_body ~* '\mvendors?\M'
    or why_title ~* '\mvendors?\M' or why_body ~* '\mvendors?\M'
    or compare_title ~* '\mvendors?\M' or compare_body ~* '\mvendors?\M';

update public.product_faqs
   set answer = pg_temp.to_supplier(answer),
       question = pg_temp.to_supplier(question)
 where answer ~* '\mvendors?\M' or question ~* '\mvendors?\M';

notify pgrst, 'reload schema';

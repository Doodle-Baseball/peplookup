-- Replaces hand-typed supplier counts in admin-written text with placeholders the site fills
-- with live numbers, so every page quotes the same, current count:
--   "80+ suppliers", "87+ research peptide suppliers", "84+ verified suppliers"  -> {vendorCount}
--   "83 other suppliers", "more than 90 other tracked suppliers"               -> {otherVendorCount}
-- ({otherVendorCount} is the total minus the supplier the page is about.)
--
-- Run this once in the Supabase SQL editor. It is safe to re-run: once a number has become a
-- placeholder there is nothing left to match, so a second run changes no rows.
--
-- Only a 2-3 digit number (optionally "N+" or "more than N") directly before "suppliers",
-- with at most the words other / tracked / verified / research / peptide in between, is
-- replaced. Every other number ("23 compounds", "5 of 13") is left alone. "N other suppliers
-- with listed prices" is also left alone: that counts only suppliers with prices, not all.
--
-- Rows changed at the time this was written:
--   seo_pages.meta_description (32): /, /price-checker, /suppliers, product and supplier pages
--   page_faqs.answer (3): two on /, one on /suppliers
--   supplier_page_content.compare_body (18)

create or replace function pg_temp.to_vendor_count(input text) returns text
language sql immutable as $$
  select regexp_replace(
           regexp_replace(
             input,
             '\m(more than )?[0-9]{2,3}\+?(\s+other(\s+(tracked|verified|research|peptide))*\s+suppliers\M)(?! with listed prices)',
             '{otherVendorCount}\2', 'gi'),
           '\m(more than )?[0-9]{2,3}\+?((\s+(tracked|verified|research|peptide))*\s+suppliers\M)',
           '{vendorCount}\2', 'gi')
$$;

update public.seo_pages
   set meta_title = pg_temp.to_vendor_count(meta_title),
       meta_description = pg_temp.to_vendor_count(meta_description),
       h1 = pg_temp.to_vendor_count(h1),
       keywords = array(select pg_temp.to_vendor_count(k) from unnest(keywords) as k)
 where (meta_title, meta_description, h1, keywords) is distinct from
       (pg_temp.to_vendor_count(meta_title), pg_temp.to_vendor_count(meta_description),
        pg_temp.to_vendor_count(h1), array(select pg_temp.to_vendor_count(k) from unnest(keywords) as k));

update public.page_faqs
   set question = pg_temp.to_vendor_count(question),
       answer = pg_temp.to_vendor_count(answer)
 where (question, answer) is distinct from (pg_temp.to_vendor_count(question), pg_temp.to_vendor_count(answer));

update public.supplier_page_content
   set about_title = pg_temp.to_vendor_count(about_title),
       about_body = pg_temp.to_vendor_count(about_body),
       why_title = pg_temp.to_vendor_count(why_title),
       why_body = pg_temp.to_vendor_count(why_body),
       compare_title = pg_temp.to_vendor_count(compare_title),
       compare_body = pg_temp.to_vendor_count(compare_body)
 where (about_title, about_body, why_title, why_body, compare_title, compare_body) is distinct from
       (pg_temp.to_vendor_count(about_title), pg_temp.to_vendor_count(about_body),
        pg_temp.to_vendor_count(why_title), pg_temp.to_vendor_count(why_body),
        pg_temp.to_vendor_count(compare_title), pg_temp.to_vendor_count(compare_body));

update public.review_page_content
   set intro = pg_temp.to_vendor_count(intro),
       rating_note = pg_temp.to_vendor_count(rating_note),
       reviews_note = pg_temp.to_vendor_count(reviews_note)
 where (intro, rating_note, reviews_note) is distinct from
       (pg_temp.to_vendor_count(intro), pg_temp.to_vendor_count(rating_note), pg_temp.to_vendor_count(reviews_note));

-- Saves the SEO for every coupon page (/coupons/<slug>-coupon-code) and every
-- reviews page (/reviews/<slug>-reviews), switches indexing on for them, and
-- sets their workflow status to "Optimized" (stored as 'done').
--
-- The text is the same as the built-in defaults in src/lib/seo-defaults.ts
-- (titles under 60 characters, descriptions under 150, 7 keywords, review
-- titles with "Reviews 2026"); saving it is what makes /admin/seo show it in
-- the fields instead of as placeholders, and what makes the pages indexable
-- (src/lib/seo-indexing.ts needs a saved title + description + index on).
--
-- Run once in the Supabase SQL editor, after 0010 and 0016. Re-running is safe.
-- To undo, run the block at the bottom.

-- 1. Backup of whatever these pages had before, so the undo can restore it.
create table if not exists public.seo_pages_backup_0026 as
  select * from public.seo_pages where false;

-- Not exposed through the public API, unlike seo_pages itself.
alter table public.seo_pages_backup_0026 enable row level security;

insert into public.seo_pages_backup_0026
select p.* from public.seo_pages p
where (p.path like '/coupons/%' or p.path like '/reviews/%')
  and not exists (select 1 from public.seo_pages_backup_0026 b where b.path = p.path);

-- 2. Coupon pages: every active supplier with a code and a percentage.
with coupon as (
  select
    slug,
    name,
    coupon_percent_off as pct,
    name || ' Coupon Code: ' || coupon_percent_off || '% Off | PepLookup' as title_long,
    'Get the ' || name || ' coupon code for ' || coupon_percent_off
      || '% off eligible orders. Offer details, how to apply it at checkout, shipping and payment.' as desc_long
  from public.suppliers
  where is_active and coupon_code is not null and coupon_percent_off is not null
)
insert into public.seo_pages
  (path, meta_title, meta_description, h1, keywords, canonical_url, robots_index, robots_follow, task_status)
select
  '/coupons/' || slug || '-coupon-code',
  case when char_length(title_long) <= 59 then title_long else name || ' Coupon Code | PepLookup' end,
  case when char_length(desc_long) <= 149 then desc_long
       else name || ' coupon code: ' || pct || '% off eligible orders. See offer details and how to apply it at checkout.' end,
  name || ' Coupon Code',
  array[
    name || ' coupon code',
    name || ' discount code',
    name || ' ' || pct || '% off',
    name || ' code not working',
    name || ' peptide prices',
    name || ' shipping and payment',
    name || ' supplier'
  ],
  'https://www.peplookup.com/coupons/' || slug || '-coupon-code',
  true,
  true,
  'done'
from coupon
on conflict (path) do update set
  meta_title = excluded.meta_title,
  meta_description = excluded.meta_description,
  h1 = excluded.h1,
  keywords = excluded.keywords,
  canonical_url = excluded.canonical_url,
  robots_index = true,
  robots_follow = true,
  task_status = 'done';

-- 3. Reviews pages: every active supplier with stored reviews.
with review as (
  select
    slug,
    name,
    name || ' Reviews 2026: Rating & Lab Reports | PepLookup' as title_1,
    name || ' Reviews 2026: Rating & COA | PepLookup' as title_2,
    name || ' reviews and overall rating, with its product catalog, lab report coverage, shipping and payment details on PepLookup.' as desc_1,
    name || ' reviews and overall rating, with its product catalog, lab reports, shipping and payment details.' as desc_2
  from public.suppliers
  where is_active and slug in (select supplier_slug from public.supplier_reviews)
)
insert into public.seo_pages
  (path, meta_title, meta_description, h1, keywords, canonical_url, robots_index, robots_follow, task_status)
select
  '/reviews/' || slug || '-reviews',
  case when char_length(title_1) <= 59 then title_1
       when char_length(title_2) <= 59 then title_2
       else name || ' Reviews 2026 | PepLookup' end,
  case when char_length(desc_1) <= 149 then desc_1
       when char_length(desc_2) <= 149 then desc_2
       else name || ' reviews and overall rating, plus its products, lab reports, shipping and payment details.' end,
  name || ' Reviews',
  array[
    name || ' reviews',
    name || ' reviews 2026',
    name || ' rating',
    name || ' lab reports',
    name || ' COA',
    name || ' shipping and payment',
    name || ' supplier'
  ],
  'https://www.peplookup.com/reviews/' || slug || '-reviews',
  true,
  true,
  'done'
from review
on conflict (path) do update set
  meta_title = excluded.meta_title,
  meta_description = excluded.meta_description,
  h1 = excluded.h1,
  keywords = excluded.keywords,
  canonical_url = excluded.canonical_url,
  robots_index = true,
  robots_follow = true,
  task_status = 'done';

-- 4. Check: expect 108 rows (73 coupon + 35 reviews when this was written),
--    every title <= 59 and every description <= 149.
select
  count(*) as pages,
  count(*) filter (where path like '/coupons/%') as coupon_pages,
  count(*) filter (where path like '/reviews/%') as review_pages,
  max(char_length(meta_title)) as longest_title,
  max(char_length(meta_description)) as longest_description
from public.seo_pages
where (path like '/coupons/%' or path like '/reviews/%') and robots_index and task_status = 'done';

-- ---------------------------------------------------------------------------
-- UNDO (run only if you want to go back): removes the rows this added and
-- restores any that existed before.
--
-- delete from public.seo_pages where path like '/coupons/%' or path like '/reviews/%';
-- insert into public.seo_pages select * from public.seo_pages_backup_0026;
-- drop table public.seo_pages_backup_0026;

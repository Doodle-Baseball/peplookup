-- SEO quality rules (one decision per page, see src/lib/seo/indexing.ts).
--
-- Run this once in the Supabase SQL editor, after 0030. It is safe to re-run.
--
-- 1. pg_trgm, so the admin can warn when a supplier's About text or review
--    summary is more than 70% similar to another supplier's.
-- 2. suppliers.review_summary: 3-6 sentences in the site owner's own words,
--    shown on /reviews/<slug>-reviews under "Our summary of <name> reviews".
-- 3. seo_pages.ready_to_index / ready_to_index_at: the "Ready to index" tick in
--    /admin/seo. Pages that already have a row are marked ready (they were live
--    before this rule); any row created afterwards starts unticked.
-- 4. guides.reviewed_by_me: the "Reviewed by me" tick in /admin/guides.
-- 5. seo_index_status: the last indexing decision per page, written by the
--    daily SEO job, so the weekly report can list pages that changed and why.
-- 6. seo_most_similar(): the closest other text for the admin's duplicate check.

create extension if not exists pg_trgm with schema extensions;

alter table public.suppliers
  add column if not exists review_summary text;

-- Backfill only on the run that adds the column, so a re-run never ticks a
-- page that was created later and is still waiting for review.
do $$
begin
  if not exists (
    select 1 from information_schema.columns
     where table_schema = 'public' and table_name = 'seo_pages' and column_name = 'ready_to_index'
  ) then
    alter table public.seo_pages add column ready_to_index boolean not null default false;
    update public.seo_pages set ready_to_index = true;
  end if;
end $$;

alter table public.seo_pages
  add column if not exists ready_to_index_at timestamptz;

alter table public.guides
  add column if not exists reviewed_by_me boolean not null default false;

create table if not exists public.seo_index_status (
  path text primary key,
  page_type text not null,
  indexable boolean not null,
  -- Whether the page passes its quality rules, separate from `indexable` while
  -- the rules are reported but not enforced.
  quality_passes boolean not null,
  reasons text[] not null default '{}',
  checked_at timestamptz not null default now(),
  -- When the page last changed state, so the weekly report can list changes.
  indexable_changed_at timestamptz,
  quality_changed_at timestamptz
);

create index if not exists seo_index_status_changed_idx on public.seo_index_status (indexable_changed_at desc);
create index if not exists seo_index_status_quality_idx on public.seo_index_status (quality_changed_at desc);

alter table public.seo_index_status enable row level security;

-- The most similar other text of one kind, scored by pg_trgm similarity (0-1).
--   p_kind 'about'          supplier_page_content.about_body
--   p_kind 'review_summary' suppliers.review_summary
-- The supplier's own name is removed from both sides first, so two texts that
-- differ only by the name score as the duplicates they are.
create or replace function public.seo_most_similar(p_kind text, p_slug text, p_text text)
returns table (slug text, name text, score real)
language sql stable
set search_path = public, extensions
as $$
  with candidates as (
    select c.supplier_slug as slug, s.name, c.about_body as body
      from public.supplier_page_content c
      join public.suppliers s on s.slug = c.supplier_slug
     where p_kind = 'about' and c.about_body is not null and c.supplier_slug <> p_slug
    union all
    select s.slug, s.name, s.review_summary
      from public.suppliers s
     where p_kind = 'review_summary' and s.review_summary is not null and s.slug <> p_slug
  ),
  own as (
    select coalesce((select name from public.suppliers where slug = p_slug), '') as name
  )
  select candidates.slug, candidates.name,
         similarity(
           replace(lower(p_text), lower(own.name), ''),
           replace(lower(candidates.body), lower(candidates.name), '')
         ) as score
    from candidates, own
   order by score desc
   limit 1;
$$;

revoke execute on function public.seo_most_similar(text, text, text) from public, anon, authenticated;

notify pgrst, 'reload schema';

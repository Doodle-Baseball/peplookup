-- Manual display ordering for the vendor and compound directories.
--
-- Both tables get a nullable `position`. Rows are sorted by it ascending with
-- NULLs last, so a row that has never been placed still appears (at the end,
-- by its previous ordering) rather than disappearing. Gaps of 10 leave room to
-- insert between two rows without renumbering the whole table.
--
-- Run this in the Supabase SQL editor.

alter table public.products add column if not exists position integer;
alter table public.suppliers add column if not exists position integer;

create index if not exists products_position_idx on public.products (position nulls last, name);
create index if not exists suppliers_position_idx on public.suppliers (position nulls last, name);

-- Seed compounds with the curated running order used on the home page.
update public.products as p
set position = v.position
from (values
  ('bpc-157', 10),
  ('tb-500', 20),
  ('tirzepatide', 30),
  ('semaglutide', 40),
  ('retatrutide', 50),
  ('ghk-cu', 60),
  ('cjc-1295-no-dac', 70),
  ('ipamorelin', 80),
  ('cagrilintide', 90),
  ('tesamorelin', 100),
  ('melanotan-2', 110),
  ('mots-c', 120),
  ('ss-31-elamipretide', 130),
  ('nad', 140),
  ('semax', 150),
  ('pt-141', 160),
  ('sermorelin', 170),
  ('ahk-cu', 180),
  ('ghrp-2', 190),
  ('selank', 200),
  ('cagrisema', 210),
  ('mazdutide', 220),
  ('survodutide', 230),
  ('bpc-157-tb-500', 240),
  ('glow-ghk-cu-bpc-157-tb-500', 250),
  ('klow-bpc-157-tb-500-kpv-ghk-cu', 260),
  ('hexarelin', 270),
  ('5-amino-1mq', 280),
  ('epitalon', 290),
  ('glutathione', 300),
  ('dihexa', 310),
  ('dsip', 320),
  ('melanotan-i', 330),
  ('wolverine', 340),
  ('ipamorelin-cjc-1295-no-dac', 350),
  ('bacteriostatic-water', 360)
) as v(slug, position)
where p.slug = v.slug;

-- Anything not in that list keeps a stable place after it, alphabetically.
with unplaced as (
  select slug, row_number() over (order by name, slug) as rn
  from public.products
  where position is null
)
update public.products as p
set position = 1000 + (u.rn * 10)
from unplaced as u
where p.slug = u.slug;

-- Seed vendors with their existing directory order (newest first), so running
-- this migration does not visibly reshuffle the site before anyone drags a card.
with ordered as (
  select slug, row_number() over (order by created_at desc, name) as rn
  from public.suppliers
)
update public.suppliers as s
set position = o.rn * 10
from ordered as o
where s.slug = o.slug;
-- Per-page FAQ entries, managed from /admin/seo.
--
-- One row per question. `path` matches the SEO dashboard's page paths (the same
-- values used by public.seo_pages), so a supplier page is '/suppliers/<slug>'
-- and the home page is '/'. Rows are ordered by `position` within a path; gaps
-- of 10 leave room to insert between two questions without renumbering.
--
-- A page with no rows here falls back to the built-in defaults shipped in
-- src/data/default-page-faqs.ts, so every listed page has FAQs before anyone
-- opens the admin. Saving from the admin writes the full set for that path.
--
-- Run this in the Supabase SQL editor.

create table if not exists public.page_faqs (
  id uuid primary key default gen_random_uuid(),
  path text not null check (path ~ '^/[a-z0-9/_-]*$'),
  question text not null check (length(btrim(question)) > 0),
  answer text not null check (length(btrim(answer)) > 0),
  position integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists page_faqs_path_position_idx on public.page_faqs (path, position);

-- Keeps `updated_at` honest without the application having to remember.
create or replace function public.page_faqs_touch_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists page_faqs_set_updated_at on public.page_faqs;
create trigger page_faqs_set_updated_at
  before update on public.page_faqs
  for each row
  execute function public.page_faqs_touch_updated_at();
-- Marks a vendor as a Special/Featured supplier, toggled from /admin/vendors.
-- Featured vendors are pinned to the top of the public /suppliers directory,
-- ahead of the usual reviews/coupon ranking.
--
-- Run this in the Supabase SQL editor.

alter table public.suppliers add column if not exists is_featured boolean not null default false;

create index if not exists suppliers_is_featured_idx on public.suppliers (is_featured) where is_featured;

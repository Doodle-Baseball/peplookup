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

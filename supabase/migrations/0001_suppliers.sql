-- Suppliers table backing the admin Vendors panel and (once populated) the
-- public suppliers directory. Run this once in the Supabase SQL editor:
-- https://supabase.com/dashboard/project/_/sql/new
--
-- Writes only ever happen server-side with the service-role (secret) key, so
-- RLS intentionally has no INSERT/UPDATE/DELETE policy for anon/authenticated,
-- the service role bypasses RLS entirely. The SELECT policy below is for
-- when the public site is later migrated to read suppliers from here too.

create table if not exists public.suppliers (
  slug text primary key check (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
  name text not null,
  logo_url text,
  favicon_url text,
  homepage_url text not null,
  affiliate_url text not null,
  tier text check (tier in ('elite', 'pro')),
  trust_rating numeric check (trust_rating between 0 and 5),
  lab_score numeric check (lab_score between 0 and 10),
  lab_verified boolean not null default false,
  founded_year integer check (founded_year between 1900 and 2100),
  review_rating numeric check (review_rating between 0 and 5),
  review_count_kind text check (review_count_kind in ('exact', 'atLeast')),
  review_count_value integer,
  reviews_url text,
  shipping_cost jsonb not null default '{"kind":"unknown"}'::jsonb,
  shipping_speed text,
  payment_methods text[] not null default '{}',
  coupon_code text,
  coupon_percent_off integer,
  description text,
  hotline text,
  policy_shipping_url text,
  policy_returns_url text,
  policy_privacy_url text,
  policy_terms_url text,
  inventory_refreshed_at timestamptz,
  country text,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.suppliers enable row level security;

create policy "Public can read active suppliers"
  on public.suppliers for select
  to anon, authenticated
  using (is_active = true);

-- Keeps updated_at honest on every admin edit without relying on callers to set it.
create or replace function public.set_suppliers_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists suppliers_set_updated_at on public.suppliers;
create trigger suppliers_set_updated_at
  before update on public.suppliers
  for each row
  execute function public.set_suppliers_updated_at();

-- Migrate the 3 existing seed suppliers so nothing is lost when the admin
-- panel and public site cut over to this table as the source of truth.
insert into public.suppliers (
  slug, name, logo_url, favicon_url, homepage_url, affiliate_url,
  coupon_code, coupon_percent_off, is_active, created_at
) values
  (
    'elevate-research-co', 'Elevate Research Co', null,
    'https://www.google.com/s2/favicons?sz=128&domain=elevateresearchco.com',
    'https://elevateresearchco.com/', 'https://elevateresearchco.com/?ref=PRODUCTS',
    'PRODUCTS', 10, true, '2026-09-04T00:00:00Z'
  ),
  (
    'peptime', 'Peptime', null,
    'https://www.google.com/s2/favicons?sz=128&domain=www.peptime.com',
    'https://www.peptime.com/', 'https://peptime.link/peplookup',
    '11@Awan22', 11, true, '2026-09-04T00:00:00Z'
  ),
  (
    'refined-bio-labs', 'Refined Bio Labs', null,
    'https://www.google.com/s2/favicons?sz=128&domain=refinedbiolabs.com',
    'https://refinedbiolabs.com/', 'https://refinedbiolabs.com/',
    null, null, true, '2026-09-04T00:00:00Z'
  )
on conflict (slug) do nothing;

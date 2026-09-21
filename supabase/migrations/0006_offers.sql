-- Offers (a vendor's price/stock listing for one compound) backing the admin
-- "Add Product" panel and the public product/supplier pages. Run this once
-- in the Supabase SQL editor, then `notify pgrst, 'reload schema';`.
--
-- No foreign keys to products/suppliers, matching products.primary_supplier_slug,
-- a listing referencing a not-yet-added compound/vendor shouldn't be
-- blocked, and slugs are the stable join key the app already uses everywhere.

create table if not exists public.offers (
  id uuid primary key default gen_random_uuid(),
  product_slug text not null check (product_slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
  supplier_slug text not null check (supplier_slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
  form text not null,
  -- Integer micrograms per vial / integer cents, same convention as the rest
  -- of the app (see src/lib/price.ts, src/lib/money.ts).
  vial_size integer not null check (vial_size > 0),
  vial_count integer not null check (vial_count > 0),
  list_price integer not null check (list_price > 0),
  sale_price integer check (sale_price > 0),
  currency text not null default 'USD',
  in_stock boolean not null default true,
  product_url text not null,
  image_url text,
  lab_report jsonb,
  -- When this listing was last confirmed accurate. Set to now() on every
  -- admin save, never left blank, per "a price with no observation time
  -- cannot be shown responsibly" (src/lib/schema.ts).
  scraped_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists offers_product_slug_idx on public.offers (product_slug);
create index if not exists offers_supplier_slug_idx on public.offers (supplier_slug);

alter table public.offers enable row level security;

create policy "Public can read offers"
  on public.offers for select
  to anon, authenticated
  using (true);

create or replace function public.set_offers_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists offers_set_updated_at on public.offers;
create trigger offers_set_updated_at
  before update on public.offers
  for each row
  execute function public.set_offers_updated_at();

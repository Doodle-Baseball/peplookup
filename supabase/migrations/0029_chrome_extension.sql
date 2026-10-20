-- Website support for the PepLookup Chrome extension.
--
-- Run this once in the Supabase SQL editor. It is safe to re-run.
--
-- 1. Four supplier columns the admin edits on the supplier form:
--      store_domains              every hostname the supplier's store uses (no scheme, no www.)
--      show_in_extension          hides a supplier from the extension feed without touching its coupon
--      review_rating_updated_at   the day the existing review_rating ("Trust factor") was last checked
--      coupon_verified_at         the day the coupon code was last tested (admin only, never public)
--    The extension's Trustpilot score reuses review_rating / review_count_value; no second rating.
--
-- 2. affiliate_clicks: one row per click on /go?to=<supplier-slug>&src=..., so the admin can
--    count extension clicks against website clicks. No IP, user agent or other personal data.
--
-- 3. extension_uninstall_feedback: the optional answer on /extension/uninstalled.
--
-- Both tables have row-level security on with no policies: only the server (service key)
-- reads or writes them, never the publishable key.

alter table public.suppliers
  add column if not exists store_domains text[] not null default '{}',
  add column if not exists show_in_extension boolean not null default true,
  add column if not exists review_rating_updated_at date,
  add column if not exists coupon_verified_at date;

-- Start every supplier with the hostname of its saved website link, the same value the admin
-- form fills in for a new supplier. Only rows that have no domains yet, so a re-run never
-- overwrites domains added by hand.
update public.suppliers
   set store_domains = array[
         regexp_replace(lower(substring(homepage_url from '^[a-zA-Z]+://([^/:?#]+)')), '^www\.', '')
       ]
 where store_domains = '{}'
   and substring(homepage_url from '^[a-zA-Z]+://([^/:?#]+)') is not null;

-- Lets the admin's "same domain on two suppliers" check use an index.
create index if not exists suppliers_store_domains_idx on public.suppliers using gin (store_domains);

create table if not exists public.affiliate_clicks (
  id bigint generated always as identity primary key,
  clicked_at timestamptz not null default now(),
  supplier_slug text not null,
  -- Where the click came from: the Chrome extension or the website.
  source text not null check (source in ('extension', 'website'))
);

create index if not exists affiliate_clicks_clicked_idx on public.affiliate_clicks (clicked_at desc);
create index if not exists affiliate_clicks_source_idx on public.affiliate_clicks (source, clicked_at desc);

alter table public.affiliate_clicks enable row level security;

-- Totals per supplier and source. `since` NULL means all time.
create or replace function public.affiliate_clicks_summary(since timestamptz default null)
returns table (supplier_slug text, source text, clicks bigint, last_clicked_at timestamptz)
language sql stable
as $$
  select c.supplier_slug, c.source, count(*) as clicks, max(c.clicked_at) as last_clicked_at
  from public.affiliate_clicks c
  where since is null or c.clicked_at >= since
  group by c.supplier_slug, c.source
  order by count(*) desc;
$$;

revoke execute on function public.affiliate_clicks_summary(timestamptz) from public, anon, authenticated;

create table if not exists public.extension_uninstall_feedback (
  id bigint generated always as identity primary key,
  created_at timestamptz not null default now(),
  reason text check (reason in ('codes_did_not_work', 'too_many_popups', 'not_useful', 'other')),
  details text check (char_length(details) <= 1000)
);

create index if not exists extension_uninstall_feedback_created_idx
  on public.extension_uninstall_feedback (created_at desc);

alter table public.extension_uninstall_feedback enable row level security;

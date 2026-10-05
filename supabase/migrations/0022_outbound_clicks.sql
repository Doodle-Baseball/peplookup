-- One row per click on a link that leaves the site, recorded by the tracker
-- in the root layout (POST /api/track/outbound) and read by /admin/traffic.
--
-- Run this once in the Supabase SQL editor. It is safe to re-run.
--
-- vendor_slug / vendor_name are resolved from the `suppliers` table at the
-- moment of the click (by matching the link's host to a supplier's homepage or
-- affiliate URL) and stay NULL for destinations that are not a listed vendor,
-- such as WhatsApp or Skool. Nothing here is ever seeded with sample rows.
--
-- Row-level security is enabled with no policies on purpose: only the server
-- (service key) reads or writes this table, so click data is never readable
-- with the publishable key.

create table if not exists public.outbound_clicks (
  id bigint generated always as identity primary key,
  clicked_at timestamptz not null default now(),
  -- The exact link that was clicked, including any query string.
  url text not null check (url ~* '^https?://'),
  -- Lowercased, without a leading "www.", so example.com and www.example.com count together.
  host text not null,
  vendor_slug text,
  vendor_name text,
  -- Path of the page on this site the visitor clicked from.
  source_path text
);

create index if not exists outbound_clicks_clicked_idx
  on public.outbound_clicks (clicked_at desc);
create index if not exists outbound_clicks_host_idx
  on public.outbound_clicks (host, clicked_at desc);

alter table public.outbound_clicks enable row level security;

-- Totals per destination website. `since` NULL means all time.
create or replace function public.outbound_clicks_by_host(since timestamptz default null)
returns table (host text, vendor_slug text, vendor_name text, clicks bigint, last_clicked_at timestamptz)
language sql stable
as $$
  select
    c.host,
    max(c.vendor_slug) as vendor_slug,
    max(c.vendor_name) as vendor_name,
    count(*) as clicks,
    max(c.clicked_at) as last_clicked_at
  from public.outbound_clicks c
  where since is null or c.clicked_at >= since
  group by c.host
  order by count(*) desc, max(c.clicked_at) desc
  limit 200;
$$;

-- Totals per exact link. `since` NULL means all time.
create or replace function public.outbound_clicks_by_url(since timestamptz default null)
returns table (url text, host text, vendor_name text, clicks bigint, last_clicked_at timestamptz)
language sql stable
as $$
  select
    c.url,
    max(c.host) as host,
    max(c.vendor_name) as vendor_name,
    count(*) as clicks,
    max(c.clicked_at) as last_clicked_at
  from public.outbound_clicks c
  where since is null or c.clicked_at >= since
  group by c.url
  order by count(*) desc, max(c.clicked_at) desc
  limit 100;
$$;

-- Only the server (service role) may call these; the publishable key must not.
revoke execute on function public.outbound_clicks_by_host(timestamptz) from public, anon, authenticated;
revoke execute on function public.outbound_clicks_by_url(timestamptz) from public, anon, authenticated;

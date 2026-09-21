-- Real, individually-attributed reviews for a supplier (e.g. imported from
-- Trustpilot), shown in the "Trustpilot Reviews" panel on the supplier page
-- and edited in /admin/vendors -> step 7 Reviews.
--
-- Run this once in the Supabase SQL editor. It is safe to re-run: every
-- statement is guarded, and an earlier version of this file that created
-- `rating` as an integer is repaired in place rather than left behind.
--
-- Deliberately separate from suppliers.review_rating/review_count_* (0001):
-- those two columns are an aggregate summary that can be set without any
-- individual review text, while this table holds the actual reviews behind
-- that summary, when they exist. A supplier can have one without the other.
--
-- No demo/placeholder rows are seeded here, CLAUDE.md's "never invent data"
-- rule applies to review content precisely because a fabricated quote
-- attributed to a named reviewer is presented to buyers as evidence. Rows are
-- only ever written from real review content (an admin action, or a direct
-- import once real text is supplied).

create table if not exists public.supplier_reviews (
  id uuid primary key default gen_random_uuid(),
  supplier_slug text not null references public.suppliers (slug) on update cascade on delete cascade,
  -- Display order on the vendor page; the admin reorders with the up/down
  -- controls and the whole list is rewritten on save.
  position integer not null check (position >= 0),
  author text not null check (btrim(author) <> ''),
  -- numeric(2,1), not integer: vendors commonly publish a 4.5, and exact
  -- decimal storage means it round-trips as 4.5 rather than 4.4999…, which
  -- matters for a number shown to buyers as evidence.
  rating numeric(2, 1) not null,
  body text not null check (btrim(body) <> ''),
  -- When the review was left, not when it was imported here.
  reviewed_at date,
  -- Where this was sourced (e.g. "trustpilot"), for a "read more on X" link/badge.
  source text,
  source_url text check (source_url is null or source_url ~* '^https?://'),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (supplier_slug, position)
);

-- Repairs a database where an earlier version of this file already ran and
-- created `rating` as an integer. Widening preserves existing whole numbers.
alter table public.supplier_reviews
  alter column rating type numeric(2, 1) using rating::numeric(2, 1);

-- 1–5 on the half-point grid, so a stray 4.3 can't be written behind the UI's back.
alter table public.supplier_reviews
  drop constraint if exists supplier_reviews_rating_check;

alter table public.supplier_reviews
  add constraint supplier_reviews_rating_check
  check (rating >= 1 and rating <= 5 and (rating * 2) = floor(rating * 2));

create index if not exists supplier_reviews_supplier_slug_idx on public.supplier_reviews (supplier_slug);

alter table public.supplier_reviews enable row level security;

-- Reviews are public content on the vendor page. Writes go through the admin,
-- which uses the secret key and bypasses RLS, so no write policy is granted here.
drop policy if exists "Public can read supplier_reviews" on public.supplier_reviews;
create policy "Public can read supplier_reviews" on public.supplier_reviews
  for select to anon, authenticated using (true);

-- Normally created by 0008; defined here too so this file can stand alone.
create or replace function public.set_row_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists supplier_reviews_set_updated_at on public.supplier_reviews;
create trigger supplier_reviews_set_updated_at
  before update on public.supplier_reviews
  for each row execute function public.set_row_updated_at();

notify pgrst, 'reload schema';

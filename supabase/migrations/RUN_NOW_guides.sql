-- ACTION NEEDED: this is why "Add new guide" at /admin/guides/new fails with
-- "Could not find the table 'public.guides' in the schema cache."
--
-- Open the Supabase SQL editor for this project, paste this whole file in,
-- and run it once. Safe to re-run. (Identical to 0012_guides.sql — copied
-- here under an obvious name so it's easy to find and run right now.)
--
-- Editorial research guides, managed from /admin/guides.
--
-- Guides shipped in src/data/guides.ts stay as the built-in set: rows here are
-- merged over them by slug, so an admin can add new guides or override a
-- shipped one without the repository copy disappearing.
--
-- `sections` is JSONB rather than its own table because a guide's body is only
-- ever read and written whole, there is no query that wants one section.
-- Shape: [{ "heading": "...", "body": ["paragraph", "paragraph"] }]

create table if not exists public.guides (
  slug text primary key check (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
  title text not null check (btrim(title) <> ''),
  category text not null check (btrim(category) <> ''),
  excerpt text not null check (btrim(excerpt) <> ''),
  -- Matches GuideIcon / GuideAccent in src/data/guides.ts; the cover art is
  -- generated from these rather than an uploaded image.
  icon text not null default 'document' check (icon in ('document', 'flask', 'shield', 'bolt', 'badge', 'globe')),
  accent text not null default 'cat-2' check (accent in ('cat-1', 'cat-2', 'cat-3', 'cat-4', 'cat-5')),
  -- Cover photo. External URLs only, no upload storage is wired up. Null means
  -- the guide falls back to the generated icon + colour art above.
  cover_image_url text check (cover_image_url is null or cover_image_url ~* '^https?://'),
  read_minutes integer not null default 5 check (read_minutes between 1 and 120),
  published_at date not null default current_date,
  sections jsonb not null default '[]'::jsonb check (jsonb_typeof(sections) = 'array'),
  related_tool_label text,
  related_tool_href text,
  -- Lets a draft exist without appearing on /guides.
  is_published boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Adds the cover column to a database where an earlier version of this file
-- already ran without it.
alter table public.guides
  add column if not exists cover_image_url text;

alter table public.guides
  drop constraint if exists guides_cover_image_url_check;

alter table public.guides
  add constraint guides_cover_image_url_check
  check (cover_image_url is null or cover_image_url ~* '^https?://');

create index if not exists guides_published_at_idx on public.guides (published_at desc);

alter table public.guides enable row level security;

-- Guides are public content. Writes go through the admin, which uses the
-- secret key and bypasses RLS, so no write policy is granted here.
drop policy if exists "Public can read guides" on public.guides;
create policy "Public can read guides" on public.guides
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

drop trigger if exists guides_set_updated_at on public.guides;
create trigger guides_set_updated_at
  before update on public.guides
  for each row execute function public.set_row_updated_at();

notify pgrst, 'reload schema';

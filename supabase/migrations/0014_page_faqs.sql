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

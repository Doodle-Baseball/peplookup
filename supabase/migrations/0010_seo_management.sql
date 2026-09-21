-- SEO management for the admin dashboard at /admin/seo. Run this once in the
-- Supabase SQL editor, after 0001-0009. Every statement is idempotent, so
-- running it again is safe.
--
--   seo_pages       per-page overrides: meta title/description, H1, keywords,
--                   canonical, social image, robots, custom head/body HTML.
--                   Keyed by the page's current path; a page with no row
--                   simply uses its built-in defaults.
--   seo_redirects   old path -> new path, written automatically whenever a
--                   compound or supplier slug is renamed, so old links and
--                   bookmarks keep working.
--   rename_page_slug(kind, old, new)
--                   renames a compound or supplier in one transaction: the
--                   row itself, everything that references it, its SEO
--                   settings and a permanent redirect from the old address.

create table if not exists public.seo_pages (
  path text primary key check (path ~ '^/[a-z0-9/_-]*$'),
  meta_title text,
  meta_description text,
  h1 text,
  keywords text[] not null default '{}',
  canonical_url text check (canonical_url is null or canonical_url ~* '^(https?://|/)'),
  og_image_url text check (og_image_url is null or og_image_url ~* '^https?://'),
  robots_index boolean not null default true,
  robots_follow boolean not null default true,
  head_html text,
  body_html text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.seo_redirects (
  from_path text primary key check (from_path ~ '^/'),
  to_path text not null check (to_path ~ '^/'),
  created_at timestamptz not null default now(),
  check (from_path <> to_path)
);

create index if not exists seo_redirects_to_path_idx on public.seo_redirects (to_path);

-- Same access model as the other content tables: anyone may read (these values
-- end up in public page HTML anyway), only the server's secret key may write.
alter table public.seo_pages enable row level security;
alter table public.seo_redirects enable row level security;

drop policy if exists "Public can read seo_pages" on public.seo_pages;
create policy "Public can read seo_pages" on public.seo_pages
  for select to anon, authenticated using (true);

drop policy if exists "Public can read seo_redirects" on public.seo_redirects;
create policy "Public can read seo_redirects" on public.seo_redirects
  for select to anon, authenticated using (true);

-- set_row_updated_at() comes from 0008.
drop trigger if exists seo_pages_set_updated_at on public.seo_pages;
create trigger seo_pages_set_updated_at
  before update on public.seo_pages
  for each row execute function public.set_row_updated_at();

-- ---------------------------------------------------------------------------
-- Slug renames. Internal links are generated from the slug columns, so once
-- the row is renamed every link on the site follows automatically; this also
-- updates the columns that reference the slug without a foreign key.
-- ---------------------------------------------------------------------------
create or replace function public.rename_page_slug(p_kind text, p_old_slug text, p_new_slug text)
returns text
language plpgsql
set search_path = public
as $$
declare
  prefix text;
  old_path text;
  new_path text;
begin
  if p_new_slug is null or p_new_slug !~ '^[a-z0-9]+(-[a-z0-9]+)*$' then
    raise exception 'Invalid slug "%". Use lowercase letters, numbers and single hyphens.', p_new_slug
      using errcode = '22023';
  end if;
  if p_old_slug = p_new_slug then
    raise exception 'The new slug is the same as the current one.' using errcode = '22023';
  end if;

  if p_kind = 'compound' then
    prefix := '/products/';
    if not exists (select 1 from public.products where slug = p_old_slug) then
      raise exception 'Compound "%" does not exist.', p_old_slug using errcode = 'P0002';
    end if;
    if exists (select 1 from public.products where slug = p_new_slug) then
      raise exception 'Another compound already uses the slug "%".', p_new_slug using errcode = '23505';
    end if;
    -- Benefits, evidence, interactions, FAQs and dosage follow via ON UPDATE CASCADE (0008).
    update public.products set slug = p_new_slug where slug = p_old_slug;
    update public.offers set product_slug = p_new_slug where product_slug = p_old_slug;

  elsif p_kind = 'supplier' then
    prefix := '/suppliers/';
    if not exists (select 1 from public.suppliers where slug = p_old_slug) then
      raise exception 'Supplier "%" does not exist.', p_old_slug using errcode = 'P0002';
    end if;
    if exists (select 1 from public.suppliers where slug = p_new_slug) then
      raise exception 'Another supplier already uses the slug "%".', p_new_slug using errcode = '23505';
    end if;
    update public.suppliers set slug = p_new_slug where slug = p_old_slug;
    update public.offers set supplier_slug = p_new_slug where supplier_slug = p_old_slug;
    update public.products set primary_supplier_slug = p_new_slug where primary_supplier_slug = p_old_slug;

  else
    raise exception 'Slugs can only be changed for compounds and suppliers (got "%").', p_kind
      using errcode = '22023';
  end if;

  old_path := prefix || p_old_slug;
  new_path := prefix || p_new_slug;

  -- Renaming back to an earlier slug: that old redirect would now loop.
  delete from public.seo_redirects where from_path = new_path;
  -- Collapse chains so every old address points straight at the current one.
  update public.seo_redirects set to_path = new_path where to_path = old_path;
  insert into public.seo_redirects (from_path, to_path) values (old_path, new_path)
    on conflict (from_path) do update set to_path = excluded.to_path, created_at = now();

  -- The page keeps its SEO settings at its new address.
  delete from public.seo_pages where path = new_path;
  update public.seo_pages set path = new_path where path = old_path;

  return new_path;
end;
$$;

revoke all on function public.rename_page_slug(text, text, text) from public, anon, authenticated;
grant execute on function public.rename_page_slug(text, text, text) to service_role;

notify pgrst, 'reload schema';

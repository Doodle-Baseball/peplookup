-- Extends rename_page_slug (0010_seo_management.sql) with a 'guide' kind, so
-- a guide's slug can be renamed from /admin/seo the same way a compound's or
-- a supplier's already can: the row itself, a permanent redirect from the old
-- address, and its SEO settings all move together in one transaction.
--
-- Also fixes a gap that predates guides entirely: renaming a compound or
-- supplier already carried its seo_pages row to the new path, but never its
-- page_faqs rows (0014_page_faqs.sql, added after this function was first
-- written) — those were silently orphaned at the old path. Fixed here for all
-- three kinds, not just guides.
--
-- Run this in the Supabase SQL editor, after 0012_guides.sql and
-- 0014_page_faqs.sql. Safe to re-run.

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

  elsif p_kind = 'guide' then
    prefix := '/guides/';
    if not exists (select 1 from public.guides where slug = p_old_slug) then
      raise exception 'Guide "%" does not exist.', p_old_slug using errcode = 'P0002';
    end if;
    if exists (select 1 from public.guides where slug = p_new_slug) then
      raise exception 'Another guide already uses the slug "%".', p_new_slug using errcode = '23505';
    end if;
    update public.guides set slug = p_new_slug where slug = p_old_slug;

  else
    raise exception 'Slugs can only be changed for compounds, suppliers and guides (got "%").', p_kind
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

  -- The page keeps its SEO settings and FAQs at its new address. new_path can
  -- never already hold rows here (the collision checks above already rule out
  -- a page existing at that slug), so there is nothing to clear first.
  delete from public.seo_pages where path = new_path;
  update public.seo_pages set path = new_path where path = old_path;
  update public.page_faqs set path = new_path where path = old_path;

  return new_path;
end;
$$;

revoke all on function public.rename_page_slug(text, text, text) from public, anon, authenticated;
grant execute on function public.rename_page_slug(text, text, text) to service_role;

notify pgrst, 'reload schema';

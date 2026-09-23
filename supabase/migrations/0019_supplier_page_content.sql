-- Editable copy for the three content boxes on every supplier page:
--   "About <vendor>", "Why researchers choose <vendor>" and
--   "<vendor> vs other suppliers". Managed from the supplier's popup in /admin/seo.
--
-- One row per supplier. Every column is nullable on purpose: null means "use the
-- text generated from this vendor's own record", so a vendor nobody has edited
-- still gets all three boxes, and clearing a field in the admin puts the
-- generated text back rather than leaving the box empty.
--
-- Keyed by supplier slug with ON UPDATE CASCADE, so a slug rename from
-- /admin/seo (rename_page_slug in 0010) carries the edited copy with it, and
-- deleting a supplier removes its copy.
--
-- Run this once in the Supabase SQL editor, after 0001-0018. Safe to re-run.

create table if not exists public.supplier_page_content (
  supplier_slug text primary key
    references public.suppliers (slug) on update cascade on delete cascade,
  about_title text,
  about_body text,
  why_title text,
  why_body text,
  compare_title text,
  compare_body text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Same access model as the other content tables: anyone may read (the text is
-- rendered on public pages anyway), only the server's secret key may write.
alter table public.supplier_page_content enable row level security;

drop policy if exists "Public can read supplier_page_content" on public.supplier_page_content;
create policy "Public can read supplier_page_content" on public.supplier_page_content
  for select to anon, authenticated using (true);

-- set_row_updated_at() comes from 0008.
drop trigger if exists supplier_page_content_set_updated_at on public.supplier_page_content;
create trigger supplier_page_content_set_updated_at
  before update on public.supplier_page_content
  for each row execute function public.set_row_updated_at();

notify pgrst, 'reload schema';

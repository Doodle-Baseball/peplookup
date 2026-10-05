-- Editable copy for each vendor's reviews page (/reviews/<vendor>-reviews),
-- managed from /admin/reviews ("Edit review page").
--
-- One row per vendor. Every column is nullable on purpose: null means "use the
-- text generated from this vendor's own record", so a page nobody has edited
-- still shows everything, and clearing a field in the admin puts the generated
-- text back rather than leaving the section empty. The rating, its review count
-- and the source link are NOT stored here: they stay on the vendor record
-- (Vendors in the admin), and the individual reviews live in supplier_reviews
-- (/admin/reviews > "Add review").
--
-- Meta title/description, keywords, FAQs and the indexing switch for these
-- pages live in the existing seo_pages / page_faqs tables and are edited from
-- /admin/seo, keyed by the page's path.
--
-- Keyed by supplier slug with ON UPDATE CASCADE, so a slug rename carries the
-- edited copy with it, and deleting a vendor removes its copy.
--
-- Run this once in the Supabase SQL editor, after 0001-0023. Safe to re-run.

create table if not exists public.review_page_content (
  supplier_slug text primary key
    references public.suppliers (slug) on update cascade on delete cascade,
  -- Intro paragraph in the page's top card.
  intro text,
  -- The small print under the rating box.
  rating_note text,
  -- The note under the list of customer reviews.
  reviews_note text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Same access model as the other content tables: anyone may read (the text is
-- rendered on public pages anyway), only the server's secret key may write.
alter table public.review_page_content enable row level security;

drop policy if exists "Public can read review_page_content" on public.review_page_content;
create policy "Public can read review_page_content" on public.review_page_content
  for select to anon, authenticated using (true);

-- set_row_updated_at() comes from 0008.
drop trigger if exists review_page_content_set_updated_at on public.review_page_content;
create trigger review_page_content_set_updated_at
  before update on public.review_page_content
  for each row execute function public.set_row_updated_at();

notify pgrst, 'reload schema';

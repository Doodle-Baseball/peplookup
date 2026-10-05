-- Editable copy for each vendor's coupon page (/<vendor>-coupon-code), managed
-- from /admin/coupon-pages.
--
-- One row per vendor. Every column is nullable on purpose: null means "use the
-- text generated from this vendor's own coupon", so a page nobody has edited
-- still shows everything, and clearing a field in the admin puts the generated
-- text back rather than leaving the section empty. The vendor's code and
-- discount themselves are NOT stored here: they stay on the vendor record
-- (Vendors in the admin), where the site's prices read them from.
--
-- FAQs, meta title/description, keywords and the indexing switch for these
-- pages live in the existing seo_pages / page_faqs tables and are edited from
-- /admin/seo, keyed by the page's path.
--
-- Keyed by supplier slug with ON UPDATE CASCADE, so a slug rename carries the
-- edited copy with it, and deleting a vendor removes its copy.
--
-- Run this once in the Supabase SQL editor, after 0001-0022. Safe to re-run.

create table if not exists public.coupon_page_content (
  supplier_slug text primary key
    references public.suppliers (slug) on update cascade on delete cascade,
  -- Intro paragraph in the page's top card.
  intro text,
  -- The six rows of the "Coupon Details" table.
  detail_code_and_offer text,
  detail_offer_status text,
  detail_customers text,
  detail_expiry text,
  detail_stacking text,
  detail_shipping text,
  -- The numbered "How to use" steps, in order, and the note under them.
  how_to_steps text[],
  working_note text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Same access model as the other content tables: anyone may read (the text is
-- rendered on public pages anyway), only the server's secret key may write.
alter table public.coupon_page_content enable row level security;

drop policy if exists "Public can read coupon_page_content" on public.coupon_page_content;
create policy "Public can read coupon_page_content" on public.coupon_page_content
  for select to anon, authenticated using (true);

-- set_row_updated_at() comes from 0008.
drop trigger if exists coupon_page_content_set_updated_at on public.coupon_page_content;
create trigger coupon_page_content_set_updated_at
  before update on public.coupon_page_content
  for each row execute function public.set_row_updated_at();

notify pgrst, 'reload schema';

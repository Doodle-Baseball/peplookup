-- Editable copy for the supplier page sections added since 0019, managed from
-- the supplier's popup in /admin/seo:
--   intro_body                  the paragraph under the H1
--   legit_title / legit_body    "Is <vendor> legit?"
--   market_title / market_body  the market price table's heading and intro
--   faqs                        the FAQ list, as [{ "question", "answer" }]
--
-- Every column is nullable on purpose: null means "show the text the page
-- builds from the supplier's own record", so no page changes until it is
-- edited. For faqs, an empty array [] is a real choice (no FAQ section),
-- distinct from null (the built-in questions).
--
-- Run this once in the Supabase SQL editor, after 0019. Safe to re-run.

alter table public.supplier_page_content add column if not exists intro_body text;
alter table public.supplier_page_content add column if not exists legit_title text;
alter table public.supplier_page_content add column if not exists legit_body text;
alter table public.supplier_page_content add column if not exists market_title text;
alter table public.supplier_page_content add column if not exists market_body text;
alter table public.supplier_page_content add column if not exists faqs jsonb;

notify pgrst, 'reload schema';

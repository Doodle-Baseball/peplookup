-- Backup before content v2 (CONTENT_V2), 4 November 2026.
--
-- Run this once in the Supabase SQL editor before turning CONTENT_V2 on.
-- It only copies: nothing is changed or deleted. Content v2 itself never
-- writes to the database; it only reads and hides on the page.
--
-- "if not exists" keeps a second run from overwriting the first copy.

create table if not exists public.suppliers_backup_20261104 as table public.suppliers;
create table if not exists public.seo_pages_backup_20261104 as table public.seo_pages;
create table if not exists public.supplier_page_content_backup_20261104 as table public.supplier_page_content;
create table if not exists public.page_faqs_backup_20261104 as table public.page_faqs;

-- Backups are for the owner only: row-level security on, no policies, so the
-- public key can't read them.
alter table public.suppliers_backup_20261104 enable row level security;
alter table public.seo_pages_backup_20261104 enable row level security;
alter table public.supplier_page_content_backup_20261104 enable row level security;
alter table public.page_faqs_backup_20261104 enable row level security;

-- Check: each pair of counts should match.
select 'suppliers' as table_name, (select count(*) from public.suppliers) as live, (select count(*) from public.suppliers_backup_20261104) as backup
union all select 'seo_pages', (select count(*) from public.seo_pages), (select count(*) from public.seo_pages_backup_20261104)
union all select 'supplier_page_content', (select count(*) from public.supplier_page_content), (select count(*) from public.supplier_page_content_backup_20261104)
union all select 'page_faqs', (select count(*) from public.page_faqs), (select count(*) from public.page_faqs_backup_20261104);

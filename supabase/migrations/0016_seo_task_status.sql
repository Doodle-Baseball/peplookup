-- Adds a manual workflow status to seo_pages, so the admin can track which
-- pages still need attention independent of the computed "Optimized / Needs
-- work" score already shown on each card.
--
-- Run this once in the Supabase SQL editor, after 0010_seo_management.sql.
-- Safe to re-run.

alter table public.seo_pages
  add column if not exists task_status text;

alter table public.seo_pages
  drop constraint if exists seo_pages_task_status_check;

alter table public.seo_pages
  add constraint seo_pages_task_status_check
  check (task_status is null or task_status in ('needs-work', 'pending', 'done'));

notify pgrst, 'reload schema';

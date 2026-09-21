-- Plain COA document link per offer, distinct from the structured
-- (graded/scored) lab_report jsonb column, for listings where the admin
-- has a certificate URL but no grade/score to enter.
alter table public.offers add column if not exists coa_url text;

notify pgrst, 'reload schema';

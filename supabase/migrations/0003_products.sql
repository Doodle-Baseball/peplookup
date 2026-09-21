-- Products (compounds) table backing the admin Compounds panel and the
-- public product/catalog pages. Run this once in the Supabase SQL editor.

create table if not exists public.products (
  slug text primary key check (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
  name text not null,
  category text,
  summary text,
  aliases text[] not null default '{}',
  forms text[] not null default '{}',
  intake_types text[] not null default '{}',
  typical_dose text,
  cycle text,
  storage text,
  images text[] not null default '{}',
  is_compound boolean not null default true,
  description text,
  purpose_pills text[] not null default '{}',
  research jsonb not null default '{
    "benefitsIntro": null, "benefits": [], "dosageIntro": null, "route": null,
    "exampleRange": null, "frequency": null, "timing": null,
    "evidence": [], "interactions": [], "faq": []
  }'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.products enable row level security;

create policy "Public can read products"
  on public.products for select
  to anon, authenticated
  using (true);

create or replace function public.set_products_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists products_set_updated_at on public.products;
create trigger products_set_updated_at
  before update on public.products
  for each row
  execute function public.set_products_updated_at();

-- Migrate the 8 existing seed compounds so nothing is lost on cutover.
insert into public.products (slug, name, category, summary, aliases) values
  ('bpc-157', 'BPC-157', 'Healing',
   'A synthetic peptide fragment studied in preclinical models for tendon, muscle and gastrointestinal tissue repair, and for anti-inflammatory activity.',
   array['Body Protection Compound 157', 'PL 14736']),
  ('tb-500', 'TB-500', 'Healing',
   'A synthetic version of the active region of thymosin beta-4, studied preclinically for cell migration and tissue repair.',
   array['Thymosin Beta-4 fragment']),
  ('semaglutide', 'Semaglutide', 'GLP-1',
   'A GLP-1 receptor agonist peptide studied for metabolic and glycaemic research endpoints.',
   array['GLP-1']),
  ('tirzepatide', 'Tirzepatide', 'GLP-1',
   'A dual GIP and GLP-1 receptor agonist peptide used in metabolic research.',
   array['GIP/GLP-1']),
  ('retatrutide', 'Retatrutide', 'GLP-1',
   'A triple GIP, GLP-1 and glucagon receptor agonist peptide under metabolic research.',
   array['GGG', 'Triple-G']),
  ('epithalon', 'Epithalon', 'Longevity',
   'A synthetic tetrapeptide studied in relation to telomerase activity and circadian regulation.',
   array['Epitalon', 'AEDG']),
  ('cjc-1295-no-dac', 'CJC-1295 (No DAC)', 'Growth',
   'A growth-hormone-releasing hormone analogue studied for pulsatile GH release in research models.',
   array['Mod GRF (1-29)']),
  ('aod-9604', 'AOD-9604', 'Metabolic',
   'A modified fragment of human growth hormone studied for lipolytic activity in research models.',
   array['hGH fragment 176-191'])
on conflict (slug) do nothing;

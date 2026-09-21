-- Structured compound content for the admin compound form and the CSV
-- importer: FAQs, benefits, evidence, interactions and dosage, each linked to
-- its compound. Run this once in the Supabase SQL editor (after 0001–0007).
-- Every statement is idempotent, so running it again is safe.
--
-- Reused instead of duplicated:
--   * aliases, forms, intake_types and purpose_pills stay the ordered text[]
--     columns they already are on products, plain value lists owned by one
--     compound, with nothing else to store per value.
--   * products.description is the form's Description (the Overview box).
--
-- The existing products.research JSON is copied into the new tables below and
-- then left in place untouched, as a backup. The app stops reading it once
-- these tables exist.

-- ---------------------------------------------------------------------------
-- Section headings: exactly one per compound, so they live on products.
-- ---------------------------------------------------------------------------
alter table public.products
  add column if not exists benefits_title text,
  add column if not exists benefits_description text,
  add column if not exists evidence_title text,
  add column if not exists evidence_description text,
  add column if not exists interactions_title text;

create or replace function public.set_row_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- ---------------------------------------------------------------------------
-- Repeatable content. `position` is the display order (0-based) chosen in the
-- admin form; slugs are the join key used everywhere else in the app, and
-- "on update cascade" keeps content attached if a slug is ever renamed.
-- ---------------------------------------------------------------------------
create table if not exists public.product_faqs (
  id uuid primary key default gen_random_uuid(),
  product_slug text not null references public.products (slug) on update cascade on delete cascade,
  position integer not null check (position >= 0),
  question text not null check (btrim(question) <> ''),
  answer text not null check (btrim(answer) <> ''),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (product_slug, position)
);

create table if not exists public.product_benefits (
  id uuid primary key default gen_random_uuid(),
  product_slug text not null references public.products (slug) on update cascade on delete cascade,
  position integer not null check (position >= 0),
  title text not null check (btrim(title) <> ''),
  description text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (product_slug, position)
);

create table if not exists public.product_evidence (
  id uuid primary key default gen_random_uuid(),
  product_slug text not null references public.products (slug) on update cascade on delete cascade,
  position integer not null check (position >= 0),
  title text not null check (btrim(title) <> ''),
  description text,
  -- Rendered as a link on the public page, so only http(s) is allowed.
  link text check (link is null or link ~* '^https?://'),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (product_slug, position)
);

create table if not exists public.product_interactions (
  id uuid primary key default gen_random_uuid(),
  product_slug text not null references public.products (slug) on update cascade on delete cascade,
  position integer not null check (position >= 0),
  name text not null check (btrim(name) <> ''),
  details text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (product_slug, position)
);

-- One dosage block per compound.
create table if not exists public.product_dosage (
  product_slug text primary key references public.products (slug) on update cascade on delete cascade,
  title text,
  description text,
  route text,
  example_range text,
  frequency text,
  timing text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Same access model as products: anyone may read, only the server's secret
-- key (which bypasses RLS) may write.
do $$
declare
  content_table text;
begin
  foreach content_table in array array[
    'product_faqs', 'product_benefits', 'product_evidence', 'product_interactions', 'product_dosage'
  ] loop
    execute format('alter table public.%I enable row level security', content_table);
    execute format('drop policy if exists %I on public.%I', 'Public can read ' || content_table, content_table);
    execute format(
      'create policy %I on public.%I for select to anon, authenticated using (true)',
      'Public can read ' || content_table,
      content_table
    );
    execute format('drop trigger if exists %I on public.%I', content_table || '_set_updated_at', content_table);
    execute format(
      'create trigger %I before update on public.%I for each row execute function public.set_row_updated_at()',
      content_table || '_set_updated_at',
      content_table
    );
  end loop;
end;
$$;

-- ---------------------------------------------------------------------------
-- Copy existing content out of products.research. Each insert skips compounds
-- that already have rows in the target table, so a re-run never duplicates.
-- ---------------------------------------------------------------------------

-- The form now has a single Description field. Compounds that only ever had
-- the short summary get it copied across so their Overview isn't blank.
update public.products
set description = summary
where description is null
  and nullif(btrim(summary), '') is not null;

update public.products
set benefits_description = nullif(btrim(research ->> 'benefitsIntro'), '')
where benefits_description is null
  and jsonb_typeof(research) = 'object';

insert into public.product_benefits (product_slug, position, title, description)
select
  p.slug,
  (item.ord - 1)::integer,
  btrim(case jsonb_typeof(item.value) when 'string' then item.value #>> '{}' else item.value ->> 'title' end),
  case jsonb_typeof(item.value) when 'object' then nullif(btrim(item.value ->> 'description'), '') end
from public.products p
cross join lateral jsonb_array_elements(
  case when jsonb_typeof(p.research -> 'benefits') = 'array' then p.research -> 'benefits' else '[]'::jsonb end
) with ordinality as item(value, ord)
where not exists (select 1 from public.product_benefits existing where existing.product_slug = p.slug)
  and nullif(
    btrim(case jsonb_typeof(item.value) when 'string' then item.value #>> '{}' else item.value ->> 'title' end),
    ''
  ) is not null;

insert into public.product_evidence (product_slug, position, title, description, link)
select
  p.slug,
  (item.ord - 1)::integer,
  btrim(item.value ->> 'title'),
  nullif(btrim(item.value ->> 'body'), ''),
  case when btrim(item.value ->> 'link') ~* '^https?://' then btrim(item.value ->> 'link') end
from public.products p
cross join lateral jsonb_array_elements(
  case when jsonb_typeof(p.research -> 'evidence') = 'array' then p.research -> 'evidence' else '[]'::jsonb end
) with ordinality as item(value, ord)
where not exists (select 1 from public.product_evidence existing where existing.product_slug = p.slug)
  and jsonb_typeof(item.value) = 'object'
  and nullif(btrim(item.value ->> 'title'), '') is not null;

insert into public.product_interactions (product_slug, position, name, details)
select
  p.slug,
  (item.ord - 1)::integer,
  btrim(item.value ->> 'pair'),
  nullif(btrim(item.value ->> 'note'), '')
from public.products p
cross join lateral jsonb_array_elements(
  case when jsonb_typeof(p.research -> 'interactions') = 'array' then p.research -> 'interactions' else '[]'::jsonb end
) with ordinality as item(value, ord)
where not exists (select 1 from public.product_interactions existing where existing.product_slug = p.slug)
  and jsonb_typeof(item.value) = 'object'
  and nullif(btrim(item.value ->> 'pair'), '') is not null;

insert into public.product_faqs (product_slug, position, question, answer)
select
  p.slug,
  (item.ord - 1)::integer,
  btrim(item.value ->> 'question'),
  btrim(item.value ->> 'answer')
from public.products p
cross join lateral jsonb_array_elements(
  case when jsonb_typeof(p.research -> 'faq') = 'array' then p.research -> 'faq' else '[]'::jsonb end
) with ordinality as item(value, ord)
where not exists (select 1 from public.product_faqs existing where existing.product_slug = p.slug)
  and jsonb_typeof(item.value) = 'object'
  and nullif(btrim(item.value ->> 'question'), '') is not null
  and nullif(btrim(item.value ->> 'answer'), '') is not null;

insert into public.product_dosage (product_slug, description, route, example_range, frequency, timing)
select
  p.slug,
  nullif(btrim(p.research ->> 'dosageIntro'), ''),
  nullif(btrim(p.research ->> 'route'), ''),
  nullif(btrim(p.research ->> 'exampleRange'), ''),
  nullif(btrim(p.research ->> 'frequency'), ''),
  nullif(btrim(p.research ->> 'timing'), '')
from public.products p
where jsonb_typeof(p.research) = 'object'
  and coalesce(
    nullif(btrim(p.research ->> 'dosageIntro'), ''),
    nullif(btrim(p.research ->> 'route'), ''),
    nullif(btrim(p.research ->> 'exampleRange'), ''),
    nullif(btrim(p.research ->> 'frequency'), ''),
    nullif(btrim(p.research ->> 'timing'), '')
  ) is not null
on conflict (product_slug) do nothing;

-- ---------------------------------------------------------------------------
-- Saving. The admin form and the CSV importer both call this: it replaces all
-- of a compound's FAQs, benefits, evidence, interactions and dosage in one
-- transaction, so a failed save can never leave a compound half-updated.
-- Array order becomes `position`.
-- ---------------------------------------------------------------------------
create or replace function public.replace_product_content(
  p_slug text,
  p_faqs jsonb default '[]'::jsonb,
  p_benefits jsonb default '[]'::jsonb,
  p_evidence jsonb default '[]'::jsonb,
  p_interactions jsonb default '[]'::jsonb,
  p_dosage jsonb default '{}'::jsonb
)
returns void
language plpgsql
set search_path = public
as $$
begin
  if not exists (select 1 from public.products where slug = p_slug) then
    raise exception 'Compound "%" does not exist', p_slug using errcode = 'P0002';
  end if;

  delete from public.product_faqs where product_slug = p_slug;
  insert into public.product_faqs (product_slug, position, question, answer)
  select p_slug, (item.ord - 1)::integer, btrim(item.value ->> 'question'), btrim(item.value ->> 'answer')
  from jsonb_array_elements(coalesce(p_faqs, '[]'::jsonb)) with ordinality as item(value, ord);

  delete from public.product_benefits where product_slug = p_slug;
  insert into public.product_benefits (product_slug, position, title, description)
  select p_slug, (item.ord - 1)::integer, btrim(item.value ->> 'title'), nullif(btrim(item.value ->> 'description'), '')
  from jsonb_array_elements(coalesce(p_benefits, '[]'::jsonb)) with ordinality as item(value, ord);

  delete from public.product_evidence where product_slug = p_slug;
  insert into public.product_evidence (product_slug, position, title, description, link)
  select
    p_slug,
    (item.ord - 1)::integer,
    btrim(item.value ->> 'title'),
    nullif(btrim(item.value ->> 'description'), ''),
    nullif(btrim(item.value ->> 'link'), '')
  from jsonb_array_elements(coalesce(p_evidence, '[]'::jsonb)) with ordinality as item(value, ord);

  delete from public.product_interactions where product_slug = p_slug;
  insert into public.product_interactions (product_slug, position, name, details)
  select p_slug, (item.ord - 1)::integer, btrim(item.value ->> 'name'), nullif(btrim(item.value ->> 'details'), '')
  from jsonb_array_elements(coalesce(p_interactions, '[]'::jsonb)) with ordinality as item(value, ord);

  insert into public.product_dosage (product_slug, title, description, route, example_range, frequency, timing)
  values (
    p_slug,
    nullif(btrim(p_dosage ->> 'title'), ''),
    nullif(btrim(p_dosage ->> 'description'), ''),
    nullif(btrim(p_dosage ->> 'route'), ''),
    nullif(btrim(p_dosage ->> 'example_range'), ''),
    nullif(btrim(p_dosage ->> 'frequency'), ''),
    nullif(btrim(p_dosage ->> 'timing'), '')
  )
  on conflict (product_slug) do update set
    title = excluded.title,
    description = excluded.description,
    route = excluded.route,
    example_range = excluded.example_range,
    frequency = excluded.frequency,
    timing = excluded.timing;
end;
$$;

-- Supabase grants new functions to anon/authenticated by default; this one
-- deletes rows, so only the server-side secret key may call it.
revoke all on function public.replace_product_content(text, jsonb, jsonb, jsonb, jsonb, jsonb)
  from public, anon, authenticated;
grant execute on function public.replace_product_content(text, jsonb, jsonb, jsonb, jsonb, jsonb)
  to service_role;

notify pgrst, 'reload schema';

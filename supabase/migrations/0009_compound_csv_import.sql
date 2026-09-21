-- Bulk compound import for the admin "Upload CSV" page
-- (/admin/compounds/upload-csv). Run this once in the Supabase SQL editor,
-- after 0001–0008. Every statement is idempotent, so running it again is safe.
--
-- No new content tables are needed: each CSV row maps onto the structure the
-- admin compound form already saves (0003 + 0008), so imported compounds
-- appear on the existing compound pages and open in the edit form:
--
--   products               name, category, description, aliases, forms,
--                          intake_types, purpose_pills, benefits_title,
--                          benefits_description, evidence_title,
--                          evidence_description, interactions_title
--   product_benefits       1benefit_… to 5benefit_…            (one row each)
--   product_evidence       1evidence_… to 3evidence_…          (one row each)
--   product_interactions   1interaction_… to 4interaction_…    (one row each)
--   product_dosage         dosage_title, dosage_description, route,
--                          example_range, frequency, timing    (one per compound)
--
-- Each row references products(slug) with on delete cascade, so a compound
-- can hold any number of benefits, evidence entries and interactions.

-- Tolerates a missing key or JSON null, which jsonb_array_elements_text would reject.
create or replace function public.jsonb_to_text_array(p_value jsonb)
returns text[]
language sql
immutable
as $$
  select case
    when jsonb_typeof(p_value) = 'array' then array(select jsonb_array_elements_text(p_value))
    else '{}'::text[]
  end;
$$;

-- ---------------------------------------------------------------------------
-- Imports a batch of compounds in ONE transaction: if any compound in the
-- batch fails, none of the batch is written. The app validates every row
-- before calling this, resolves slugs, and decides create vs update.
--
-- p_compounds is a JSON array of:
--   {
--     "slug": "bpc-157",
--     "mode": "create" | "update",
--     "product": { name, category, description, aliases[], forms[],
--                  intake_types[], purpose_pills[], benefits_title,
--                  benefits_description, evidence_title,
--                  evidence_description, interactions_title },
--     "benefits": [{ title, description }],
--     "evidence": [{ title, description, link }],
--     "interactions": [{ name, details }],
--     "dosage": { title, description, route, example_range, frequency, timing }
--   }
--
-- Returns the number of compounds written.
-- ---------------------------------------------------------------------------
create or replace function public.import_compounds(p_compounds jsonb)
returns integer
language plpgsql
set search_path = public
as $$
declare
  compound jsonb;
  product jsonb;
  compound_slug text;
  imported integer := 0;
begin
  if jsonb_typeof(p_compounds) is distinct from 'array' then
    raise exception 'p_compounds must be a JSON array' using errcode = '22023';
  end if;

  for compound in select value from jsonb_array_elements(p_compounds) loop
    compound_slug := compound ->> 'slug';
    product := coalesce(compound -> 'product', '{}'::jsonb);

    if nullif(btrim(product ->> 'name'), '') is null then
      raise exception 'Compound "%" has no name', compound_slug using errcode = '23514';
    end if;

    case compound ->> 'mode'
      when 'create' then
        insert into public.products (
          slug, name, category, description, aliases, forms, intake_types, purpose_pills,
          benefits_title, benefits_description, evidence_title, evidence_description, interactions_title
        )
        values (
          compound_slug,
          btrim(product ->> 'name'),
          nullif(btrim(product ->> 'category'), ''),
          nullif(btrim(product ->> 'description'), ''),
          public.jsonb_to_text_array(product -> 'aliases'),
          public.jsonb_to_text_array(product -> 'forms'),
          public.jsonb_to_text_array(product -> 'intake_types'),
          public.jsonb_to_text_array(product -> 'purpose_pills'),
          nullif(btrim(product ->> 'benefits_title'), ''),
          nullif(btrim(product ->> 'benefits_description'), ''),
          nullif(btrim(product ->> 'evidence_title'), ''),
          nullif(btrim(product ->> 'evidence_description'), ''),
          nullif(btrim(product ->> 'interactions_title'), '')
        );

      when 'update' then
        -- Only the columns a compound save owns; images, is_compound, summary
        -- and legacy dosing fields are left exactly as they are.
        update public.products set
          name = btrim(product ->> 'name'),
          category = nullif(btrim(product ->> 'category'), ''),
          description = nullif(btrim(product ->> 'description'), ''),
          aliases = public.jsonb_to_text_array(product -> 'aliases'),
          forms = public.jsonb_to_text_array(product -> 'forms'),
          intake_types = public.jsonb_to_text_array(product -> 'intake_types'),
          purpose_pills = public.jsonb_to_text_array(product -> 'purpose_pills'),
          benefits_title = nullif(btrim(product ->> 'benefits_title'), ''),
          benefits_description = nullif(btrim(product ->> 'benefits_description'), ''),
          evidence_title = nullif(btrim(product ->> 'evidence_title'), ''),
          evidence_description = nullif(btrim(product ->> 'evidence_description'), ''),
          interactions_title = nullif(btrim(product ->> 'interactions_title'), '')
        where slug = compound_slug;

        if not found then
          raise exception 'Compound "%" no longer exists', compound_slug using errcode = 'P0002';
        end if;

      else
        raise exception 'Unknown import mode "%" for compound "%"', compound ->> 'mode', compound_slug
          using errcode = '22023';
    end case;

    -- The same save path as the admin form (0008). FAQs aren't part of the CSV
    -- format, so the compound's current FAQs are passed back in unchanged.
    perform public.replace_product_content(
      compound_slug,
      coalesce(
        (
          select jsonb_agg(jsonb_build_object('question', faq.question, 'answer', faq.answer) order by faq.position)
          from public.product_faqs faq
          where faq.product_slug = compound_slug
        ),
        '[]'::jsonb
      ),
      coalesce(compound -> 'benefits', '[]'::jsonb),
      coalesce(compound -> 'evidence', '[]'::jsonb),
      coalesce(compound -> 'interactions', '[]'::jsonb),
      coalesce(compound -> 'dosage', '{}'::jsonb)
    );

    imported := imported + 1;
  end loop;

  return imported;
end;
$$;

-- Writes and deletes rows, so only the server-side secret key may call it.
revoke all on function public.import_compounds(jsonb) from public, anon, authenticated;
grant execute on function public.import_compounds(jsonb) to service_role;

notify pgrst, 'reload schema';

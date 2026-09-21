import 'server-only';
import type { SupabaseClient } from '@supabase/supabase-js';
import type { Product, ResearchSections } from '@/lib/schema';
import { researchFromLegacyJson, type CompoundInput } from '@/lib/compound-content';

/**
 * Snake_case shape of a row in the `products` table
 * (0003_products.sql, extended by 0004, 0005 and 0008).
 */
export interface ProductRow {
  slug: string;
  name: string;
  category: string | null;
  summary: string | null;
  aliases: string[];
  forms: Product['forms'];
  intake_types: Product['intakeTypes'];
  typical_dose: string | null;
  cycle: string | null;
  storage: string | null;
  images: string[];
  is_compound: boolean;
  description: string | null;
  purpose_pills: string[];
  /** Pre-0008 research JSON. Read only while the content tables don't exist yet. */
  research: unknown;
  primary_supplier_slug: string | null;
  coa_url: string | null;
  /** Added by 0013_display_order.sql; undefined until that migration runs. */
  position?: number | null;
  // Section headings added by 0008_compound_content.sql, undefined until it runs.
  benefits_title?: string | null;
  benefits_description?: string | null;
  evidence_title?: string | null;
  evidence_description?: string | null;
  interactions_title?: string | null;
  created_at: string;
  updated_at: string;
}

interface FaqRow {
  product_slug: string;
  position: number;
  question: string;
  answer: string;
}

interface BenefitRow {
  product_slug: string;
  position: number;
  title: string;
  description: string | null;
}

interface EvidenceRow {
  product_slug: string;
  position: number;
  title: string;
  description: string | null;
  link: string | null;
}

interface InteractionRow {
  product_slug: string;
  position: number;
  name: string;
  details: string | null;
}

interface DosageRow {
  product_slug: string;
  title: string | null;
  description: string | null;
  route: string | null;
  example_range: string | null;
  frequency: string | null;
  timing: string | null;
}

interface ProductContent {
  faqs: FaqRow[];
  benefits: BenefitRow[];
  evidence: EvidenceRow[];
  interactions: InteractionRow[];
  dosage: DosageRow | null;
}

/** PostgREST returns at most 1,000 rows per request; page through rather than silently truncate. */
const PAGE_SIZE = 1000;

async function selectAll<T>(
  client: SupabaseClient,
  table: string,
  options: { match?: { column: string; value: string }; orderBy: readonly string[] },
): Promise<T[] | null> {
  const rows: T[] = [];
  for (let from = 0; ; from += PAGE_SIZE) {
    let query = client.from(table).select('*');
    if (options.match) query = query.eq(options.match.column, options.match.value);
    for (const column of options.orderBy) query = query.order(column);
    const { data, error } = await query.range(from, from + PAGE_SIZE - 1);
    if (error || !data) return null;
    rows.push(...(data as T[]));
    if (data.length < PAGE_SIZE) return rows;
  }
}

/**
 * Loads the 0008 content tables grouped by compound. Null when any of them
 * can't be read, in practice, before that migration has been run, so callers
 * fall back to the legacy research JSON instead of rendering empty sections.
 */
async function fetchContentBySlug(
  client: SupabaseClient,
  slug?: string,
): Promise<Map<string, ProductContent> | null> {
  const match = slug ? { column: 'product_slug', value: slug } : undefined;
  const ordered = { match, orderBy: ['product_slug', 'position'] };
  const [faqs, benefits, evidence, interactions, dosage] = await Promise.all([
    selectAll<FaqRow>(client, 'product_faqs', ordered),
    selectAll<BenefitRow>(client, 'product_benefits', ordered),
    selectAll<EvidenceRow>(client, 'product_evidence', ordered),
    selectAll<InteractionRow>(client, 'product_interactions', ordered),
    selectAll<DosageRow>(client, 'product_dosage', { match, orderBy: ['product_slug'] }),
  ]);
  if (!faqs || !benefits || !evidence || !interactions || !dosage) return null;

  const bySlug = new Map<string, ProductContent>();
  const contentFor = (productSlug: string): ProductContent => {
    const existing = bySlug.get(productSlug);
    if (existing) return existing;
    const created: ProductContent = { faqs: [], benefits: [], evidence: [], interactions: [], dosage: null };
    bySlug.set(productSlug, created);
    return created;
  };
  for (const row of faqs) contentFor(row.product_slug).faqs.push(row);
  for (const row of benefits) contentFor(row.product_slug).benefits.push(row);
  for (const row of evidence) contentFor(row.product_slug).evidence.push(row);
  for (const row of interactions) contentFor(row.product_slug).interactions.push(row);
  for (const row of dosage) contentFor(row.product_slug).dosage = row;
  return bySlug;
}

function researchFromTables(row: ProductRow, content: ProductContent | undefined): ResearchSections {
  const dosage = content?.dosage ?? null;
  return {
    benefitsTitle: row.benefits_title ?? null,
    benefitsIntro: row.benefits_description ?? null,
    benefits: (content?.benefits ?? []).map((benefit) => ({
      title: benefit.title,
      description: benefit.description,
    })),
    dosageTitle: dosage?.title ?? null,
    dosageIntro: dosage?.description ?? null,
    route: dosage?.route ?? null,
    exampleRange: dosage?.example_range ?? null,
    frequency: dosage?.frequency ?? null,
    timing: dosage?.timing ?? null,
    evidenceTitle: row.evidence_title ?? null,
    evidenceIntro: row.evidence_description ?? null,
    evidence: (content?.evidence ?? []).map((item) => ({
      title: item.title,
      body: item.description,
      link: item.link,
    })),
    interactionsTitle: row.interactions_title ?? null,
    interactions: (content?.interactions ?? []).map((item) => ({ pair: item.name, note: item.details })),
    faq: (content?.faqs ?? []).map((item) => ({ question: item.question, answer: item.answer })),
  };
}

function rowToProduct(row: ProductRow, content: Map<string, ProductContent> | null): Product {
  return {
    slug: row.slug,
    name: row.name,
    category: row.category,
    summary: row.summary,
    aliases: row.aliases,
    forms: row.forms,
    intakeTypes: row.intake_types,
    typicalDose: row.typical_dose,
    cycle: row.cycle,
    storage: row.storage,
    images: row.images,
    isCompound: row.is_compound,
    description: row.description,
    purposePills: row.purpose_pills,
    research: content ? researchFromTables(row, content.get(row.slug)) : researchFromLegacyJson(row.research),
    primarySupplierSlug: row.primary_supplier_slug,
    coaUrl: row.coa_url,
    position: row.position ?? null,
  };
}

/** Returns null (not []) on any failure so callers can fall back to the static seed. */
export async function fetchProductsFromDb(client: SupabaseClient): Promise<Product[] | null> {
  const rows = await selectAll<ProductRow>(client, 'products', { orderBy: ['name', 'slug'] });
  if (!rows) return null;
  const content = await fetchContentBySlug(client);
  return rows.map((row) => rowToProduct(row, content));
}

export async function fetchProductFromDb(
  client: SupabaseClient,
  slug: string,
): Promise<Product | null> {
  const { data, error } = await client.from('products').select('*').eq('slug', slug).maybeSingle();
  if (error || !data) return null;
  const content = await fetchContentBySlug(client, slug);
  return rowToProduct(data as ProductRow, content);
}

/** Slug, name and category of every compound, what the CSV importer needs to spot existing ones. */
export async function fetchProductIdentitiesFromDb(
  client: SupabaseClient,
): Promise<{ slug: string; name: string; category: string | null }[] | null> {
  const rows = await selectAll<ProductRow>(client, 'products', { orderBy: ['slug'] });
  return rows ? rows.map((row) => ({ slug: row.slug, name: row.name, category: row.category })) : null;
}

/**
 * The `products` columns a compound save owns. Everything else on the row
 * (images, is_compound, summary, legacy dosing fields) is left as it is.
 */
export function compoundInputToProductColumns(input: CompoundInput) {
  return {
    name: input.name,
    category: input.category,
    description: input.description,
    aliases: input.aliases,
    forms: input.forms,
    intake_types: input.intakeTypes,
    purpose_pills: input.purposePills,
    benefits_title: input.research.benefitsTitle,
    benefits_description: input.research.benefitsIntro,
    evidence_title: input.research.evidenceTitle,
    evidence_description: input.research.evidenceIntro,
    interactions_title: input.research.interactionsTitle,
  };
}

/** Arguments for public.replace_product_content (0008): array order becomes each row's position. */
export function compoundInputToContentArgs(slug: string, input: CompoundInput) {
  const research = input.research;
  return {
    p_slug: slug,
    p_faqs: research.faq.map((item) => ({ question: item.question, answer: item.answer })),
    p_benefits: research.benefits.map((item) => ({ title: item.title, description: item.description })),
    p_evidence: research.evidence.map((item) => ({ title: item.title, description: item.body, link: item.link })),
    p_interactions: research.interactions.map((item) => ({ name: item.pair, details: item.note })),
    p_dosage: {
      title: research.dosageTitle,
      description: research.dosageIntro,
      route: research.route,
      example_range: research.exampleRange,
      frequency: research.frequency,
      timing: research.timing,
    },
  };
}

import type { IntakeType, ProductForm, ResearchSections } from './schema';

/**
 * Compound content rules shared by the admin form, the CSV importer and the
 * database layer, so a compound saved either way is validated identically.
 * Pure (type-only imports), so client components can use the option lists.
 */

export const COMPOUND_FORM_OPTIONS: readonly { value: ProductForm; label: string }[] = [
  { value: 'vial', label: 'Vial' },
  { value: 'capsule', label: 'Capsule' },
  { value: 'spray', label: 'Spray' },
];

export const INTAKE_TYPE_OPTIONS: readonly { value: IntakeType; label: string }[] = [
  { value: 'injections', label: 'Injections' },
  { value: 'oral', label: 'Oral' },
  { value: 'topical', label: 'Topical Creams and Serums' },
  { value: 'nasal', label: 'Nasal Sprays' },
  { value: 'sublingual', label: 'Sublingual Troches' },
];

/** Nothing written yet: every section falls back to its default heading and empty state. */
export const EMPTY_RESEARCH: ResearchSections = {
  benefitsTitle: null,
  benefitsIntro: null,
  benefits: [],
  dosageTitle: null,
  dosageIntro: null,
  route: null,
  exampleRange: null,
  frequency: null,
  timing: null,
  evidenceTitle: null,
  evidenceIntro: null,
  evidence: [],
  interactionsTitle: null,
  interactions: [],
  faq: [],
};

/**
 * Everything the compound form and CSV import write. Other product columns
 * (images, the compound/blend flag, legacy dosing fields) are never touched by
 * a save, so data entered elsewhere survives an edit.
 */
export interface CompoundInput {
  name: string;
  category: string | null;
  description: string | null;
  aliases: string[];
  forms: ProductForm[];
  intakeTypes: IntakeType[];
  purposePills: string[];
  research: ResearchSections;
}

export type RepeatableItem = Readonly<Record<string, unknown>>;

/** Untrusted values as they arrive from the form or a CSV row, before validation. */
export interface RawCompoundFields {
  name: string;
  category: string;
  description: string;
  aliases: readonly string[];
  forms: readonly string[];
  intakeTypes: readonly string[];
  purposePills: readonly string[];
  faqs: readonly RepeatableItem[];
  benefitsTitle: string;
  benefitsDescription: string;
  benefits: readonly RepeatableItem[];
  evidenceTitle: string;
  evidenceDescription: string;
  evidence: readonly RepeatableItem[];
  interactionsTitle: string;
  interactions: readonly RepeatableItem[];
  dosageTitle: string;
  dosageDescription: string;
  route: string;
  exampleRange: string;
  frequency: string;
  timing: string;
}

export type CompoundInputResult = { ok: true; input: CompoundInput } | { ok: false; errors: string[] };

export function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function text(value: unknown): string {
  return typeof value === 'string' ? value.trim() : '';
}

function optionalText(value: unknown): string | null {
  return text(value) || null;
}

export function slugifyCompoundName(name: string): string {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

/** Only http(s): these links are rendered on the public page, and `javascript:` is a valid URL too. */
export function isHttpUrl(value: string): boolean {
  try {
    const url = new URL(value);
    return url.protocol === 'http:' || url.protocol === 'https:';
  } catch {
    return false;
  }
}

/** Trims, drops blanks, and removes case-insensitive duplicates while keeping first-seen order. */
export function uniqueValues(values: readonly string[]): string[] {
  const seen = new Set<string>();
  const result: string[] = [];
  for (const value of values) {
    const trimmed = value.trim();
    const key = trimmed.toLowerCase();
    if (!trimmed || seen.has(key)) continue;
    seen.add(key);
    result.push(trimmed);
  }
  return result;
}

/** Accepts either the stored value ("nasal") or the label the admin sees ("Nasal Sprays"). */
function resolveOptions<V extends string>(
  values: readonly string[],
  options: readonly { value: V; label: string }[],
  noun: string,
  errors: string[],
): V[] {
  const resolved: V[] = [];
  for (const value of values) {
    const needle = value.trim().toLowerCase();
    if (!needle) continue;
    const match = options.find((option) => option.value === needle || option.label.toLowerCase() === needle);
    if (!match) {
      errors.push(`Unknown ${noun} "${value.trim()}". Use one of: ${options.map((option) => option.label).join(', ')}.`);
      continue;
    }
    if (!resolved.includes(match.value)) resolved.push(match.value);
  }
  return resolved;
}

/**
 * Validates and normalises one compound. Completely blank repeatable items are
 * dropped (an "Add FAQ" click that was never filled in); half-filled ones are
 * errors, numbered by their position so the admin can find them.
 */
export function buildCompoundInput(raw: RawCompoundFields): CompoundInputResult {
  const errors: string[] = [];

  const name = text(raw.name);
  if (!name) errors.push('Name is required.');
  else if (!slugifyCompoundName(name)) errors.push('Name must contain at least one letter or number.');

  const forms = resolveOptions(raw.forms, COMPOUND_FORM_OPTIONS, 'form', errors);
  const intakeTypes = resolveOptions(raw.intakeTypes, INTAKE_TYPE_OPTIONS, 'intake type', errors);

  const faq = raw.faqs.flatMap((item, index) => {
    const question = text(item.question);
    const answer = text(item.answer);
    if (!question && !answer) return [];
    if (!question || !answer) {
      errors.push(`FAQ ${index + 1} needs both a question and an answer.`);
      return [];
    }
    return [{ question, answer }];
  });

  const benefits = raw.benefits.flatMap((item, index) => {
    const title = text(item.title);
    const description = optionalText(item.description);
    if (!title && !description) return [];
    if (!title) {
      errors.push(`Benefit ${index + 1} needs a title.`);
      return [];
    }
    return [{ title, description }];
  });

  const evidence = raw.evidence.flatMap((item, index) => {
    const title = text(item.title);
    const body = optionalText(item.description);
    const link = optionalText(item.link);
    if (!title && !body && !link) return [];
    if (!title) {
      errors.push(`Evidence ${index + 1} needs a title.`);
      return [];
    }
    if (link && !isHttpUrl(link)) {
      errors.push(`Evidence ${index + 1} link must be a full URL starting with http:// or https://.`);
      return [];
    }
    return [{ title, body, link }];
  });

  const interactions = raw.interactions.flatMap((item, index) => {
    const pair = text(item.name);
    const note = optionalText(item.details);
    if (!pair && !note) return [];
    if (!pair) {
      errors.push(`Interaction ${index + 1} needs a name.`);
      return [];
    }
    return [{ pair, note }];
  });

  if (errors.length > 0) return { ok: false, errors };

  return {
    ok: true,
    input: {
      name,
      category: optionalText(raw.category),
      description: optionalText(raw.description),
      aliases: uniqueValues(raw.aliases),
      forms,
      intakeTypes,
      purposePills: uniqueValues(raw.purposePills),
      research: {
        benefitsTitle: optionalText(raw.benefitsTitle),
        benefitsIntro: optionalText(raw.benefitsDescription),
        benefits,
        dosageTitle: optionalText(raw.dosageTitle),
        dosageIntro: optionalText(raw.dosageDescription),
        route: optionalText(raw.route),
        exampleRange: optionalText(raw.exampleRange),
        frequency: optionalText(raw.frequency),
        timing: optionalText(raw.timing),
        evidenceTitle: optionalText(raw.evidenceTitle),
        evidenceIntro: optionalText(raw.evidenceDescription),
        evidence,
        interactionsTitle: optionalText(raw.interactionsTitle),
        interactions,
        faq,
      },
    },
  };
}

/**
 * Reads the pre-0008 `products.research` JSON, where benefits were plain
 * strings and sections had no titles. It's unvalidated jsonb, so anything
 * malformed is skipped rather than trusted.
 */
export function researchFromLegacyJson(raw: unknown): ResearchSections {
  const json: Record<string, unknown> = isRecord(raw) ? raw : {};
  const list = (key: string): unknown[] => {
    const value = json[key];
    return Array.isArray(value) ? value : [];
  };

  return {
    benefitsTitle: optionalText(json.benefitsTitle),
    benefitsIntro: optionalText(json.benefitsIntro),
    benefits: list('benefits').flatMap((item) => {
      if (typeof item === 'string') return item.trim() ? [{ title: item.trim(), description: null }] : [];
      if (!isRecord(item) || !text(item.title)) return [];
      return [{ title: text(item.title), description: optionalText(item.description) }];
    }),
    dosageTitle: optionalText(json.dosageTitle),
    dosageIntro: optionalText(json.dosageIntro),
    route: optionalText(json.route),
    exampleRange: optionalText(json.exampleRange),
    frequency: optionalText(json.frequency),
    timing: optionalText(json.timing),
    evidenceTitle: optionalText(json.evidenceTitle),
    evidenceIntro: optionalText(json.evidenceIntro),
    evidence: list('evidence').flatMap((item) => {
      if (!isRecord(item) || !text(item.title)) return [];
      const link = text(item.link);
      return [{ title: text(item.title), body: optionalText(item.body), link: link && isHttpUrl(link) ? link : null }];
    }),
    interactionsTitle: optionalText(json.interactionsTitle),
    interactions: list('interactions').flatMap((item) => {
      if (!isRecord(item) || !text(item.pair)) return [];
      return [{ pair: text(item.pair), note: optionalText(item.note) }];
    }),
    faq: list('faq').flatMap((item) => {
      if (!isRecord(item) || !text(item.question) || !text(item.answer)) return [];
      return [{ question: text(item.question), answer: text(item.answer) }];
    }),
  };
}

import { parseCsvText } from './vendor-import';
import {
  buildCompoundInput,
  COMPOUND_FORM_OPTIONS,
  INTAKE_TYPE_OPTIONS,
  isHttpUrl,
  slugifyCompoundName,
  uniqueValues,
  type CompoundInput,
  type RawCompoundFields,
} from './compound-content';

/**
 * CSV format for bulk compound import: one row per compound, a fixed header
 * row (any column order), `,` between categories and aliases, `|` between
 * forms, intake types and purpose pills. Rows are normalised by the same
 * buildCompoundInput as the admin form, so they save into the same structure.
 */

export const CSV_COMMA_SEPARATOR = ',';
export const CSV_PIPE_SEPARATOR = '|';

export const BENEFIT_SLOTS = 5;
export const EVIDENCE_SLOTS = 3;
export const INTERACTION_SLOTS = 4;

type LengthRange = readonly [min: number, max: number];

export interface CompoundCsvColumn {
  header: string;
  note: string;
  length?: LengthRange;
}

export interface CompoundCsvSection {
  title: string;
  columns: readonly CompoundCsvColumn[];
}

const slots = (count: number) => Array.from({ length: count }, (_, index) => index + 1);

const optionLabels = (options: readonly { label: string }[]) => options.map((option) => option.label).join(', ');

export const COMPOUND_CSV_SECTIONS: readonly CompoundCsvSection[] = [
  {
    title: 'Basic information',
    columns: [
      { header: 'name', note: 'Required. Existing compounds are matched by name.' },
      { header: 'category', note: `One or more categories separated by "${CSV_COMMA_SEPARATOR}"` },
      { header: 'description', note: 'Main compound description (the Overview box).' },
      { header: 'aliases', note: `Alternative names separated by "${CSV_COMMA_SEPARATOR}"` },
      { header: 'forms', note: `${optionLabels(COMPOUND_FORM_OPTIONS)}, separated by "${CSV_PIPE_SEPARATOR}"` },
      { header: 'intake_types', note: `${optionLabels(INTAKE_TYPE_OPTIONS)}, separated by "${CSV_PIPE_SEPARATOR}"` },
      { header: 'purpose_pills', note: `Purposes separated by "${CSV_PIPE_SEPARATOR}", e.g. Fat Loss|Energy` },
    ],
  },
  {
    title: 'Benefits',
    columns: [
      { header: 'benefits_title', note: 'Main Benefits Title', length: [25, 35] },
      { header: 'benefits_description', note: 'Main Benefits Description', length: [130, 150] },
      ...slots(BENEFIT_SLOTS).flatMap((n): CompoundCsvColumn[] => [
        { header: `${n}benefit_title`, note: `Benefit ${n} title`, length: [25, 35] },
        { header: `${n}benefit_description`, note: `Benefit ${n} description`, length: [150, 170] },
      ]),
    ],
  },
  {
    title: 'Evidence',
    columns: [
      { header: 'evidence_title', note: 'Main Evidence Title', length: [30, 35] },
      { header: 'evidence_description', note: 'Main Evidence Description', length: [100, 110] },
      ...slots(EVIDENCE_SLOTS).flatMap((n): CompoundCsvColumn[] => [
        { header: `${n}evidence_title`, note: `Evidence ${n} title`, length: [25, 35] },
        { header: `${n}evidence_description`, note: `Evidence ${n} description`, length: [160, 190] },
        { header: `${n}evidence_link`, note: `Evidence ${n} link, full http(s):// URL` },
      ]),
    ],
  },
  {
    title: 'Dosage',
    columns: [
      { header: 'dosage_title', note: 'Main Dosage Title', length: [28, 35] },
      { header: 'dosage_description', note: 'Dosage Description', length: [170, 190] },
      { header: 'route', note: 'e.g. Subcutaneous injection', length: [20, 25] },
      { header: 'example_range', note: 'e.g. 250–500 mcg' },
      { header: 'frequency', note: 'e.g. Once daily' },
      { header: 'timing', note: 'e.g. Morning, before food', length: [50, 100] },
    ],
  },
  {
    title: 'Interactions',
    columns: [
      { header: 'interactions_title', note: 'Main Interactions Title', length: [30, 40] },
      ...slots(INTERACTION_SLOTS).flatMap((n): CompoundCsvColumn[] => [
        { header: `${n}interaction_name`, note: `Interaction ${n} name`, length: [10, 20] },
        { header: `${n}interaction_details`, note: `Interaction ${n} details`, length: [90, 120] },
      ]),
    ],
  },
];

const ALL_COLUMNS = COMPOUND_CSV_SECTIONS.flatMap((section) => section.columns);

/** Every supported column, in template order. */
export const COMPOUND_CSV_HEADERS: readonly string[] = ALL_COLUMNS.map((column) => column.header);

const COLUMN_BY_HEADER = new Map(ALL_COLUMNS.map((column) => [column.header, column]));

/** Header-only template: an example row would risk being imported as a real compound. */
export function compoundCsvTemplate(): string {
  return `${COMPOUND_CSV_HEADERS.join(',')}\r\n`;
}

export interface ParsedCompoundRow {
  /** Spreadsheet row number, counting the header as row 1. */
  rowNumber: number;
  name: string;
  slug: string;
  /** Null when the row has errors; length issues alone still produce an input. */
  input: CompoundInput | null;
  errors: string[];
  /** Values outside their character range, blocking only while length rules are enforced. */
  lengthIssues: string[];
}

export interface ParsedCompoundCsv {
  rows: ParsedCompoundRow[];
  /** Problems with the file as a whole; when present, `rows` is empty. */
  errors: string[];
  ignoredColumns: string[];
}

export function rowProblems(row: ParsedCompoundRow, enforceLengths: boolean): string[] {
  return enforceLengths ? [...row.errors, ...row.lengthIssues] : row.errors;
}

export function isRowImportable(
  row: ParsedCompoundRow,
  enforceLengths: boolean,
): row is ParsedCompoundRow & { input: CompoundInput } {
  return row.input !== null && rowProblems(row, enforceLengths).length === 0;
}

/** "1Benefit Title" and "1benefit-title" both become 1benefit_title. */
function normalizeHeader(header: string): string {
  return header
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '_')
    .replace(/^_+|_+$/g, '');
}

function splitList(cell: string, separator: string): string[] {
  return uniqueValues(cell.split(separator));
}

/** Code points, so "250–500 mcg" counts the en dash once. */
function characterCount(value: string): number {
  return [...value].length;
}

const NUMBERED_HEADER = /^(\d+)(benefit|evidence|interaction)_[a-z]+$/;
const SLOT_LIMITS: Record<string, { count: number; noun: string }> = {
  benefit: { count: BENEFIT_SLOTS, noun: 'benefits' },
  evidence: { count: EVIDENCE_SLOTS, noun: 'evidence entries' },
  interaction: { count: INTERACTION_SLOTS, noun: 'interactions' },
};

export function parseCompoundCsv(text: string): ParsedCompoundCsv {
  // Excel prepends a byte-order mark, which would otherwise glue onto "name".
  const table = parseCsvText(text.replace(/^﻿/, ''));
  const [headerRow, ...dataRows] = table;
  if (!headerRow) return { rows: [], errors: ['The file is empty.'], ignoredColumns: [] };

  const errors: string[] = [];
  const ignoredColumns: string[] = [];
  const columnIndex = new Map<string, number>();

  headerRow.forEach((rawHeader, index) => {
    const header = normalizeHeader(rawHeader);
    if (!header) return;

    if (COLUMN_BY_HEADER.has(header)) {
      if (columnIndex.has(header)) errors.push(`The "${header}" column appears more than once.`);
      else columnIndex.set(header, index);
      return;
    }

    // A 6th benefit would otherwise be dropped without anyone noticing.
    const numbered = NUMBERED_HEADER.exec(header);
    const limit = numbered ? SLOT_LIMITS[numbered[2] ?? ''] : undefined;
    if (numbered && limit && Number(numbered[1]) > limit.count) {
      errors.push(`"${rawHeader.trim()}" isn't supported, a compound can have at most ${limit.count} ${limit.noun}.`);
      return;
    }

    ignoredColumns.push(rawHeader.trim());
  });

  // Every column is required in the header so a forgotten one can't silently blank that field on update.
  const missing = COMPOUND_CSV_HEADERS.filter((header) => !columnIndex.has(header));
  if (missing.length > 0) {
    errors.push(`Missing ${missing.length === 1 ? 'column' : 'columns'}: ${missing.join(', ')}. Download the template for the full header row.`);
  }
  if (dataRows.length === 0) errors.push('The file has a header row but no compound rows.');
  if (errors.length > 0) return { rows: [], errors, ignoredColumns };

  const firstRowBySlug = new Map<string, number>();
  const rows = dataRows.map((cells, dataIndex) => {
    const row = parseRow(cells, columnIndex, dataIndex + 2);
    // "BPC 157" and "BPC-157" would become the same compound page.
    if (row.slug) {
      const firstRow = firstRowBySlug.get(row.slug);
      if (firstRow !== undefined) {
        row.errors.push(`Same compound as row ${firstRow}, each compound can appear once per file.`);
        row.input = null;
      } else {
        firstRowBySlug.set(row.slug, row.rowNumber);
      }
    }
    return row;
  });

  return { rows, errors: [], ignoredColumns };
}

function parseRow(cells: readonly string[], columnIndex: ReadonlyMap<string, number>, rowNumber: number): ParsedCompoundRow {
  const errors: string[] = [];
  const lengthIssues: string[] = [];

  const cell = (header: string): string => {
    const index = columnIndex.get(header);
    return index === undefined ? '' : (cells[index] ?? '').trim();
  };

  /** Blank cells are allowed; filled ones must fit the column's character range. */
  const checked = (header: string): string => {
    const value = cell(header);
    const range = COLUMN_BY_HEADER.get(header)?.length;
    if (value && range) {
      const count = characterCount(value);
      const [min, max] = range;
      if (count < min || count > max) {
        lengthIssues.push(`${header}: ${count} characters (needs ${min}–${max}).`);
      }
    }
    return value;
  };

  const list = (header: string, separator: string, wrongSeparator: string): string[] => {
    const value = cell(header);
    if (value.includes(wrongSeparator)) {
      // Returning nothing avoids a second, confusing "Unknown form "Vial,Capsule"" error.
      errors.push(`${header}: separate values with "${separator}", not "${wrongSeparator}".`);
      return [];
    }
    return splitList(value, separator);
  };

  const name = cell('name');
  const categories = list('category', CSV_COMMA_SEPARATOR, CSV_PIPE_SEPARATOR);
  const aliases = list('aliases', CSV_COMMA_SEPARATOR, CSV_PIPE_SEPARATOR);
  const forms = list('forms', CSV_PIPE_SEPARATOR, CSV_COMMA_SEPARATOR);
  const intakeTypes = list('intake_types', CSV_PIPE_SEPARATOR, CSV_COMMA_SEPARATOR);
  // Purposes like "Skin, hair & nails" legitimately contain commas.
  const purposePills = splitList(cell('purpose_pills'), CSV_PIPE_SEPARATOR);

  const benefits = slots(BENEFIT_SLOTS).flatMap((n) => {
    const title = checked(`${n}benefit_title`);
    const description = checked(`${n}benefit_description`);
    if (!title && !description) return [];
    if (!title || !description) {
      errors.push(`Benefit ${n}: fill in both ${n}benefit_title and ${n}benefit_description, or leave both blank.`);
      return [];
    }
    return [{ title, description }];
  });

  const evidence = slots(EVIDENCE_SLOTS).flatMap((n) => {
    const title = checked(`${n}evidence_title`);
    const description = checked(`${n}evidence_description`);
    const link = cell(`${n}evidence_link`);
    if (!title && !description && !link) return [];
    let complete = true;
    if (!title || !description) {
      errors.push(`Evidence ${n}: fill in both ${n}evidence_title and ${n}evidence_description, or leave the entry blank.`);
      complete = false;
    }
    if (link && !isHttpUrl(link)) {
      errors.push(`${n}evidence_link: "${link}" isn't a valid URL, it must start with http:// or https://.`);
      complete = false;
    }
    return complete ? [{ title, description, link }] : [];
  });

  const interactions = slots(INTERACTION_SLOTS).flatMap((n) => {
    const interactionName = checked(`${n}interaction_name`);
    const details = checked(`${n}interaction_details`);
    if (!interactionName && !details) return [];
    if (!interactionName || !details) {
      errors.push(`Interaction ${n}: fill in both ${n}interaction_name and ${n}interaction_details, or leave both blank.`);
      return [];
    }
    return [{ name: interactionName, details }];
  });

  const raw: RawCompoundFields = {
    name,
    category: categories.join(', '),
    description: cell('description'),
    aliases,
    forms,
    intakeTypes,
    purposePills,
    // FAQs aren't part of the CSV format; an update keeps the compound's existing ones.
    faqs: [],
    benefitsTitle: checked('benefits_title'),
    benefitsDescription: checked('benefits_description'),
    benefits,
    evidenceTitle: checked('evidence_title'),
    evidenceDescription: checked('evidence_description'),
    evidence,
    interactionsTitle: checked('interactions_title'),
    interactions,
    dosageTitle: checked('dosage_title'),
    dosageDescription: checked('dosage_description'),
    route: checked('route'),
    exampleRange: cell('example_range'),
    frequency: cell('frequency'),
    timing: checked('timing'),
  };

  // Name, forms and intake types are validated here, exactly as for the admin form.
  const result = buildCompoundInput(raw);
  if (!result.ok) errors.unshift(...result.errors);

  return {
    rowNumber,
    name,
    slug: slugifyCompoundName(name),
    input: result.ok && errors.length === 0 ? result.input : null,
    errors,
    lengthIssues,
  };
}

export interface CompoundIdentity {
  slug: string;
  name: string;
}

export interface CompoundMatcher {
  /** The slug of the compound this name would update, if one already exists. */
  existingSlugFor(name: string): string | undefined;
}

/**
 * A compound "already exists" when its name (case-insensitive) or its slug
 * matches, so "BPC 157" in a file matches the existing BPC-157. Shared by the
 * preview and the server so both agree on what will be created or updated.
 */
export function createCompoundMatcher(identities: readonly CompoundIdentity[]): CompoundMatcher {
  const slugByName = new Map(identities.map((identity) => [identity.name.trim().toLowerCase(), identity.slug]));
  const slugs = new Set(identities.map((identity) => identity.slug));
  return {
    existingSlugFor(name) {
      const byName = slugByName.get(name.trim().toLowerCase());
      if (byName) return byName;
      const slug = slugifyCompoundName(name);
      return slugs.has(slug) ? slug : undefined;
    },
  };
}

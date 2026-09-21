import { describe, expect, it } from 'vitest';

import { buildCompoundInput, researchFromLegacyJson, type RawCompoundFields } from '../compound-content';
import {
  COMPOUND_CSV_HEADERS,
  createCompoundMatcher,
  isRowImportable,
  parseCompoundCsv,
  rowProblems,
} from '../compound-import';

/** Exactly `length` characters, so tests state the rule they exercise rather than a magic string. */
const chars = (length: number, fill = 'a') => fill.repeat(length);

function csvCell(value: string): string {
  return /[",\n\r]/.test(value) ? `"${value.replace(/"/g, '""')}"` : value;
}

/** A full-header CSV where each row only sets the columns it cares about. */
function buildCsv(rows: readonly Readonly<Record<string, string>>[]): string {
  return [
    COMPOUND_CSV_HEADERS.join(','),
    ...rows.map((row) => COMPOUND_CSV_HEADERS.map((header) => csvCell(row[header] ?? '')).join(',')),
  ].join('\r\n');
}

const VALID_ROW: Readonly<Record<string, string>> = {
  name: 'AOD-9604',
  category: 'Metabolic, Fat Loss, metabolic',
  description: 'A fragment, studied for lipolysis.',
  aliases: 'hGH fragment 176-191, AOD',
  forms: 'Vial|capsule',
  intake_types: 'Injections|Nasal Sprays',
  purpose_pills: 'Fat Loss|Skin, hair & nails|fat loss',
  benefits_title: chars(30, 'B'),
  benefits_description: chars(140),
  '1benefit_title': chars(25, 'T'),
  '1benefit_description': chars(150),
  '3benefit_title': chars(35, 'U'),
  '3benefit_description': chars(170),
  evidence_title: chars(32, 'E'),
  evidence_description: chars(105),
  '1evidence_title': chars(30, 'S'),
  '1evidence_description': chars(175),
  '1evidence_link': 'https://example.com/study',
  dosage_title: chars(30, 'D'),
  dosage_description: chars(180),
  route: 'Subcutaneous injection',
  example_range: '250–500 mcg',
  frequency: 'Once daily',
  timing: `Morning, before food${chars(40, '.')}`,
  interactions_title: chars(35, 'I'),
  '1interaction_name': 'CJC-1295 (No DAC)',
  '1interaction_details': chars(100),
};

const BLANK_FIELDS: RawCompoundFields = {
  name: '',
  category: '',
  description: '',
  aliases: [],
  forms: [],
  intakeTypes: [],
  purposePills: [],
  faqs: [],
  benefitsTitle: '',
  benefitsDescription: '',
  benefits: [],
  evidenceTitle: '',
  evidenceDescription: '',
  evidence: [],
  interactionsTitle: '',
  interactions: [],
  dosageTitle: '',
  dosageDescription: '',
  route: '',
  exampleRange: '',
  frequency: '',
  timing: '',
};

describe('compound CSV import', () => {
  it('uses the exact header row from the upload spec', () => {
    expect(COMPOUND_CSV_HEADERS.join(',')).toBe(
      'name,category,description,aliases,forms,intake_types,purpose_pills,benefits_title,benefits_description,1benefit_title,1benefit_description,2benefit_title,2benefit_description,3benefit_title,3benefit_description,4benefit_title,4benefit_description,5benefit_title,5benefit_description,evidence_title,evidence_description,1evidence_title,1evidence_description,1evidence_link,2evidence_title,2evidence_description,2evidence_link,3evidence_title,3evidence_description,3evidence_link,dosage_title,dosage_description,route,example_range,frequency,timing,interactions_title,1interaction_name,1interaction_details,2interaction_name,2interaction_details,3interaction_name,3interaction_details,4interaction_name,4interaction_details',
    );
  });

  it('maps every column into the same shape as the admin form', () => {
    const parsed = parseCompoundCsv(buildCsv([VALID_ROW]));

    expect(parsed.errors).toEqual([]);
    expect(parsed.ignoredColumns).toEqual([]);
    const [row] = parsed.rows;
    expect(row?.errors).toEqual([]);
    expect(row?.lengthIssues).toEqual([]);
    expect(row?.input).toMatchObject({
      name: 'AOD-9604',
      category: 'Metabolic, Fat Loss',
      description: 'A fragment, studied for lipolysis.',
      aliases: ['hGH fragment 176-191', 'AOD'],
      forms: ['vial', 'capsule'],
      intakeTypes: ['injections', 'nasal'],
      purposePills: ['Fat Loss', 'Skin, hair & nails'],
      research: {
        faq: [],
        benefitsTitle: VALID_ROW.benefits_title,
        benefitsIntro: VALID_ROW.benefits_description,
        // Blank slot 2 is dropped; order follows the column numbers.
        benefits: [
          { title: VALID_ROW['1benefit_title'], description: VALID_ROW['1benefit_description'] },
          { title: VALID_ROW['3benefit_title'], description: VALID_ROW['3benefit_description'] },
        ],
        evidenceTitle: VALID_ROW.evidence_title,
        evidence: [
          {
            title: VALID_ROW['1evidence_title'],
            body: VALID_ROW['1evidence_description'],
            link: 'https://example.com/study',
          },
        ],
        interactionsTitle: VALID_ROW.interactions_title,
        interactions: [{ pair: 'CJC-1295 (No DAC)', note: VALID_ROW['1interaction_details'] }],
        dosageTitle: VALID_ROW.dosage_title,
        route: 'Subcutaneous injection',
        exampleRange: '250–500 mcg',
        frequency: 'Once daily',
      },
    });
    expect(row && isRowImportable(row, true)).toBe(true);
  });

  it('reports format problems per row, including the same compound twice', () => {
    const { rows, errors } = parseCompoundCsv(
      buildCsv([
        { forms: 'Vial' },
        {
          name: 'BPC-157',
          forms: 'Vial,Capsule',
          intake_types: 'Oral|Inhaled',
          aliases: 'BPC|PL 14736',
          '2benefit_title': chars(30),
          '1evidence_title': chars(30),
          '1evidence_description': chars(170),
          '1evidence_link': 'javascript:alert(1)',
          '4interaction_details': chars(100),
        },
        { name: 'BPC 157' },
      ]),
    );

    expect(errors).toEqual([]);
    expect(rows.map((row) => row.rowNumber)).toEqual([2, 3, 4]);
    expect(rows[0]?.errors).toEqual(['Name is required.']);
    expect(rows[1]?.errors).toEqual([
      expect.stringContaining('Unknown intake type "Inhaled"'),
      'aliases: separate values with ",", not "|".',
      'forms: separate values with "|", not ",".',
      'Benefit 2: fill in both 2benefit_title and 2benefit_description, or leave both blank.',
      expect.stringContaining('1evidence_link: "javascript:alert(1)" isn\'t a valid URL'),
      'Interaction 4: fill in both 4interaction_name and 4interaction_details, or leave both blank.',
    ]);
    expect(rows[2]?.errors).toEqual(['Same compound as row 3, each compound can appear once per file.']);
    expect(rows.every((row) => row.input === null)).toBe(true);
  });

  it('checks character ranges at both boundaries and only blocks while they are enforced', () => {
    const { rows } = parseCompoundCsv(
      buildCsv([
        { ...VALID_ROW, name: 'At the limits', benefits_title: chars(25), '1benefit_description': chars(170) },
        {
          ...VALID_ROW,
          name: 'Outside the limits',
          benefits_title: chars(36),
          route: 'Oral',
          '1interaction_name': chars(9),
          // 35 characters but 36 UTF-16 units: the emoji must count once.
          evidence_title: `${chars(34)}🧪`,
        },
      ]),
    );

    const [atLimits, outside] = rows;
    expect(atLimits?.lengthIssues).toEqual([]);
    expect(outside?.errors).toEqual([]);
    expect(outside?.lengthIssues).toEqual([
      '1interaction_name: 9 characters (needs 10–20).',
      'benefits_title: 36 characters (needs 25–35).',
      'route: 4 characters (needs 20–25).',
    ]);

    expect(outside && isRowImportable(outside, true)).toBe(false);
    expect(outside && rowProblems(outside, true)).toHaveLength(3);
    expect(outside && isRowImportable(outside, false)).toBe(true);
    expect(outside && rowProblems(outside, false)).toEqual([]);
  });

  it('rejects files with missing, duplicated or out-of-range columns', () => {
    expect(parseCompoundCsv('name,category\nBPC-157,Healing').errors).toEqual([
      expect.stringMatching(/^Missing columns: description, aliases, .*4interaction_details\. Download the template/),
    ]);

    const extraBenefit = parseCompoundCsv(`${COMPOUND_CSV_HEADERS.join(',')},6benefit_title,name\nBPC-157`);
    expect(extraBenefit.errors).toEqual([
      '"6benefit_title" isn\'t supported, a compound can have at most 5 benefits.',
      'The "name" column appears more than once.',
    ]);

    expect(parseCompoundCsv(COMPOUND_CSV_HEADERS.join(',')).errors).toEqual([
      'The file has a header row but no compound rows.',
    ]);
  });

  it('accepts the template header with a byte-order mark, loose casing and unknown columns', () => {
    const headers = COMPOUND_CSV_HEADERS.map((header) => (header === 'intake_types' ? 'Intake Types' : header));
    const parsed = parseCompoundCsv(`﻿${headers.join(',')},Notes\nExample Compound`);

    expect(parsed.errors).toEqual([]);
    expect(parsed.ignoredColumns).toEqual(['Notes']);
    expect(parsed.rows[0]?.errors).toEqual([]);
    expect(parsed.rows[0]?.input?.name).toBe('Example Compound');
  });

  it('matches existing compounds by name or slug', () => {
    const matcher = createCompoundMatcher([
      { slug: 'bpc-157', name: 'BPC-157' },
      { slug: 'tb-500', name: 'TB 500' },
    ]);

    expect(matcher.existingSlugFor('bpc 157')).toBe('bpc-157');
    expect(matcher.existingSlugFor('  tb 500 ')).toBe('tb-500');
    expect(matcher.existingSlugFor('Semax')).toBeUndefined();
  });
});

describe('compound content validation', () => {
  it('drops untouched repeatable items but flags half-filled ones', () => {
    const result = buildCompoundInput({
      ...BLANK_FIELDS,
      name: 'Semax',
      faqs: [{ question: '', answer: '' }, { question: 'Only a question', answer: '' }],
      benefits: [{ title: '', description: '' }],
      interactions: [{ name: '', details: 'Details without a name' }],
    });

    expect(result).toEqual({
      ok: false,
      errors: ['FAQ 2 needs both a question and an answer.', 'Interaction 1 needs a name.'],
    });
  });

  it('converts the legacy research JSON, skipping anything malformed or unsafe', () => {
    const research = researchFromLegacyJson({
      benefitsIntro: 'Intro',
      benefits: ['Lipolysis', '  ', 42],
      evidence: [{ title: 'Trial', body: 'Body', link: 'javascript:alert(1)' }],
      interactions: [{ pair: 'CJC-1295', note: '' }],
      faq: [{ question: 'Q', answer: '' }],
    });

    expect(research.benefitsIntro).toBe('Intro');
    expect(research.benefits).toEqual([{ title: 'Lipolysis', description: null }]);
    expect(research.evidence).toEqual([{ title: 'Trial', body: 'Body', link: null }]);
    expect(research.interactions).toEqual([{ pair: 'CJC-1295', note: null }]);
    expect(research.faq).toEqual([]);
  });
});

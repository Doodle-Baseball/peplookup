import { describe, expect, it } from 'vitest';
import {
  defaultSupplierPageSections,
  isEmptySectionsOverride,
  resolveSupplierPageSections,
  toSupplierPageSectionsOverride,
  type SupplierPageSections,
} from '@/lib/supplier-page-sections';

const defaults = defaultSupplierPageSections({
  name: 'Nura Peptide',
  intro: 'Nura Peptide operates under Nura Systems LLC.',
  legitSummary: 'Nura Peptide has received customer feedback.',
  faqs: [{ question: 'Does Nura Peptide offer a discount code?', answer: 'Yes.' }],
});

describe('defaultSupplierPageSections', () => {
  it('matches the headings and text the supplier page shows', () => {
    expect(defaults.legit.title).toBe('Is Nura Peptide legit?');
    expect(defaults.market.title).toBe('Nura Peptide vs market average prices');
    expect(defaults.market.body).toBe(
      "See how Nura Peptide's prices compare with the average market price for the exact same compound and vial size.",
    );
  });
});

describe('toSupplierPageSectionsOverride', () => {
  it('stores nothing when every field is unchanged or blank', () => {
    const submitted: SupplierPageSections = { ...defaults, intro: '  ', legit: { title: '', body: defaults.legit.body } };
    const override = toSupplierPageSectionsOverride(submitted, defaults);
    expect(isEmptySectionsOverride(override)).toBe(true);
  });

  it('stores only the fields that were edited', () => {
    const submitted: SupplierPageSections = {
      ...defaults,
      market: { title: defaults.market.title, body: ' Our own market intro. ' },
      faqs: [...defaults.faqs, { question: 'Where does it ship?', answer: 'The US.' }],
    };
    expect(toSupplierPageSectionsOverride(submitted, defaults)).toEqual({
      intro: null,
      legitTitle: null,
      legitBody: null,
      marketTitle: null,
      marketBody: 'Our own market intro.',
      faqs: [...defaults.faqs, { question: 'Where does it ship?', answer: 'The US.' }],
    });
  });

  it('keeps an emptied FAQ list as a real choice, distinct from "unchanged"', () => {
    const override = toSupplierPageSectionsOverride({ ...defaults, faqs: [] }, defaults);
    expect(override.faqs).toEqual([]);
    expect(resolveSupplierPageSections(defaults, override).faqs).toEqual([]);
  });

  it('drops blank FAQ rows before comparing', () => {
    const override = toSupplierPageSectionsOverride(
      { ...defaults, faqs: [...defaults.faqs, { question: ' ', answer: '' }] },
      defaults,
    );
    expect(override.faqs).toBeNull();
  });
});

describe('resolveSupplierPageSections', () => {
  it('lets saved text win field by field', () => {
    const resolved = resolveSupplierPageSections(defaults, {
      intro: 'Saved intro.',
      legitTitle: null,
      legitBody: '   ',
      marketTitle: 'Saved market title',
      marketBody: null,
      faqs: null,
    });
    expect(resolved.intro).toBe('Saved intro.');
    expect(resolved.legit).toEqual(defaults.legit);
    expect(resolved.market).toEqual({ title: 'Saved market title', body: defaults.market.body });
    expect(resolved.faqs).toEqual(defaults.faqs);
  });
});

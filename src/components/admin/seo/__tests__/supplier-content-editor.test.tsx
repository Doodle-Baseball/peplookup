// @vitest-environment jsdom
import { afterEach, describe, expect, it, vi } from 'vitest';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { SupplierContentEditor } from '../supplier-content-editor';
import type { SupplierContent } from '@/lib/supplier-content';
import type { SupplierPageSections } from '@/lib/supplier-page-sections';

// The FAQ editor's standalone save calls a Server Action; inside this form it never does.
vi.mock('@/app/admin/(dashboard)/seo/actions', () => ({ savePageFaqsAction: vi.fn() }));

const DEFAULTS: SupplierContent = {
  about: { title: 'About Amino Club', body: 'Generated about.' },
  why: { title: 'Why researchers choose Amino Club', body: 'Generated why.' },
  compare: { title: 'Amino Club vs other suppliers', body: 'Generated compare.' },
};

const SECTION_DEFAULTS: SupplierPageSections = {
  intro: 'Generated intro.',
  legit: { title: 'Is Amino Club legit?', body: 'Generated legit.' },
  market: { title: 'Amino Club vs market average prices', body: 'Generated market.' },
  faqs: [{ question: 'Does Amino Club offer a discount code?', answer: 'Yes.' }],
};

type Props = Parameters<typeof SupplierContentEditor>[0];

function renderInForm(saved: Props['saved'] = null, savedSections: Props['savedSections'] = null) {
  render(
    <form aria-label="seo">
      <SupplierContentEditor
        path="/supplier/amino-club"
        saved={saved}
        defaults={DEFAULTS}
        savedSections={savedSections}
        sectionDefaults={SECTION_DEFAULTS}
      />
    </form>,
  );
  return () => new FormData(screen.getByRole('form', { name: 'seo' }) as HTMLFormElement);
}

describe('SupplierContentEditor', () => {
  afterEach(cleanup);

  it('submits edits with the dialog form, so "Save changes" saves them', () => {
    const formData = renderInForm();
    fireEvent.change(screen.getAllByLabelText('Details')[0]!, { target: { value: 'My own about text.' } });

    const data = formData();
    expect(data.get('supplierContent_about_body')).toBe('My own about text.');
  });

  it('carries saved Why and Compare text it no longer shows, so a save keeps it', () => {
    const formData = renderInForm({
      about: { title: null, body: null },
      why: { title: null, body: 'Saved why.' },
      compare: { title: 'Saved compare title', body: null },
    });

    const data = formData();
    expect(data.get('supplierContent_why_body')).toBe('Saved why.');
    expect(data.get('supplierContent_why_title')).toBe('');
    expect(data.get('supplierContent_compare_title')).toBe('Saved compare title');
    expect(screen.getAllByRole('textbox').some((field) => (field as HTMLInputElement).value === 'Saved why.')).toBe(false);
  });

  it('shows the intro, legit, market and FAQ sections seeded with the page text', () => {
    const formData = renderInForm();

    const data = formData();
    expect(data.get('supplierSection_intro')).toBe('Generated intro.');
    expect(data.get('supplierSection_legitTitle')).toBe('Is Amino Club legit?');
    expect(data.get('supplierSection_marketBody')).toBe('Generated market.');
    expect(JSON.parse(String(data.get('supplierSection_faqs')))).toEqual(SECTION_DEFAULTS.faqs);
  });

  it('opens on saved text and can restore the generated version', () => {
    const formData = renderInForm(
      {
        about: { title: 'Meet Amino Club', body: null },
        why: { title: null, body: null },
        compare: { title: null, body: null },
      },
      {
        intro: 'Saved intro.',
        legitTitle: null,
        legitBody: 'Saved legit.',
        marketTitle: null,
        marketBody: null,
        faqs: [],
      },
    );
    expect(formData().get('supplierContent_about_title')).toBe('Meet Amino Club');
    expect(formData().get('supplierSection_intro')).toBe('Saved intro.');
    expect(formData().get('supplierSection_legitBody')).toBe('Saved legit.');
    expect(formData().get('supplierSection_faqs')).toBe('[]');

    fireEvent.click(screen.getByRole('button', { name: 'Restore generated text' }));
    expect(formData().get('supplierContent_about_title')).toBe('About Amino Club');
    expect(formData().get('supplierSection_intro')).toBe('Generated intro.');
    expect(JSON.parse(String(formData().get('supplierSection_faqs')))).toEqual(SECTION_DEFAULTS.faqs);
  });
});

// @vitest-environment jsdom
import { afterEach, describe, expect, it } from 'vitest';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { SupplierContentEditor } from '../supplier-content-editor';
import type { SupplierContent } from '@/lib/supplier-content';

const DEFAULTS: SupplierContent = {
  about: { title: 'About Amino Club', body: 'Generated about.' },
  why: { title: 'Why researchers choose Amino Club', body: 'Generated why.' },
  compare: { title: 'Amino Club vs other suppliers', body: 'Generated compare.' },
};

function renderInForm(saved: Parameters<typeof SupplierContentEditor>[0]['saved'] = null) {
  render(
    <form aria-label="seo">
      <SupplierContentEditor saved={saved} defaults={DEFAULTS} />
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
    expect(data.get('supplierContent_why_title')).toBe('Why researchers choose Amino Club');
  });

  it('opens on saved text and can restore the generated version', () => {
    const formData = renderInForm({
      about: { title: 'Meet Amino Club', body: null },
      why: { title: null, body: null },
      compare: { title: null, body: null },
    });
    expect(formData().get('supplierContent_about_title')).toBe('Meet Amino Club');

    fireEvent.click(screen.getByRole('button', { name: 'Restore generated text' }));
    expect(formData().get('supplierContent_about_title')).toBe('About Amino Club');
  });
});

'use client';

import { useState, type ReactNode } from 'react';
import {
  SUPPLIER_CONTENT_WORD_TARGET,
  resolveSupplierContent,
  supplierContentFieldName,
  wordCount,
  type SupplierContent,
  type SupplierContentOverride,
} from '@/lib/supplier-content';
import {
  SUPPLIER_SECTION_FIELDS,
  resolveSupplierPageSections,
  type SupplierPageSections,
  type SupplierPageSectionsOverride,
} from '@/lib/supplier-page-sections';
import { FaqEditor } from '@/components/admin/seo/faq-editor';
import { cn } from '@/lib/cn';

const inputClass =
  'mt-1 w-full rounded-chip border border-line bg-surface px-3.5 py-2.5 text-sm text-content outline-none transition-colors duration-150 placeholder:text-faint focus:border-brand';

function WordCounter({ text, target }: { text: string; target: { min: number; max: number } }) {
  const count = wordCount(text);
  const inRange = count >= target.min && count <= target.max;
  return (
    <span className={cn('text-xs font-semibold', inRange ? 'text-ok' : 'text-warn')}>
      {count} / {target.min}-{target.max} words
    </span>
  );
}

function SectionBox({ number, label, hint, children }: { number: number; label: string; hint?: string; children: ReactNode }) {
  return (
    <fieldset className="space-y-2 rounded-chip border border-line bg-surface p-3.5">
      <legend className="px-1 text-micro font-bold uppercase text-faint">
        {number}. {label}
      </legend>
      {hint ? <p className="text-xs text-muted">{hint}</p> : null}
      {children}
    </fieldset>
  );
}

function TextField({
  id,
  label,
  name,
  value,
  placeholder,
  onChange,
  rows,
  counter,
}: {
  id: string;
  label: string;
  name: string;
  value: string;
  placeholder: string;
  onChange: (value: string) => void;
  /** Set for a multi-line field. */
  rows?: number;
  counter?: ReactNode;
}) {
  return (
    <div>
      <div className="flex items-center justify-between gap-3">
        <label htmlFor={id} className="text-xs font-semibold text-content">
          {label}
        </label>
        {counter}
      </div>
      {rows ? (
        <textarea
          id={id}
          name={name}
          value={value}
          onChange={(event) => onChange(event.target.value)}
          rows={rows}
          placeholder={placeholder}
          className={inputClass}
        />
      ) : (
        <input
          id={id}
          name={name}
          value={value}
          onChange={(event) => onChange(event.target.value)}
          placeholder={placeholder}
          className={inputClass}
        />
      )}
    </div>
  );
}

/**
 * Edit every text section of one supplier page, in the order the page shows
 * them: the intro under the H1, About, "Is {Name} legit?", the market price
 * section and the FAQs.
 *
 * The fields are named inputs of the dialog's own form, so the footer's "Save
 * changes" saves them along with the SEO fields. They used to have a separate
 * save button, and an edit followed by "Save changes" (or Enter in a title)
 * was silently thrown away when the dialog closed.
 *
 * "Why researchers choose" and "vs other suppliers" are no longer on the page,
 * so they aren't shown here; whatever was saved for them is carried through
 * hidden fields so a save never wipes it.
 */
export function SupplierContentEditor({
  path,
  saved,
  defaults,
  savedSections,
  sectionDefaults,
}: {
  path: string;
  saved: SupplierContentOverride | null;
  defaults: SupplierContent;
  savedSections: SupplierPageSectionsOverride | null;
  sectionDefaults: SupplierPageSections;
}) {
  const [about, setAbout] = useState(() => resolveSupplierContent(defaults, saved).about);
  const [sections, setSections] = useState<SupplierPageSections>(() =>
    resolveSupplierPageSections(sectionDefaults, savedSections),
  );
  // Remounts the FAQ editor when the generated text is restored.
  const [faqVersion, setFaqVersion] = useState(0);

  const hasSaved = saved !== null || savedSections !== null;

  function restoreGenerated() {
    setAbout(defaults.about);
    setSections(sectionDefaults);
    setFaqVersion((version) => version + 1);
  }

  return (
    <div className="space-y-4">
      <p className="text-xs text-muted">
        {hasSaved
          ? 'Fields you have saved show your text. Clear a field, or restore the generated text, to go back to the version built from the supplier’s data.'
          : 'Every section is showing the text the page builds from the supplier’s own data. Edit any field to replace it.'}{' '}
        Saved with <span className="font-semibold text-content">Save changes</span> below.
      </p>

      {/* No longer shown on the page; carried so a save keeps what was stored. */}
      <input type="hidden" name={supplierContentFieldName('why', 'title')} value={saved?.why.title ?? ''} />
      <input type="hidden" name={supplierContentFieldName('why', 'body')} value={saved?.why.body ?? ''} />
      <input type="hidden" name={supplierContentFieldName('compare', 'title')} value={saved?.compare.title ?? ''} />
      <input type="hidden" name={supplierContentFieldName('compare', 'body')} value={saved?.compare.body ?? ''} />

      <SectionBox number={1} label="Intro" hint="The paragraph under the H1 heading at the top of the page.">
        <TextField
          id="supplier-intro"
          label="Text"
          name={SUPPLIER_SECTION_FIELDS.intro}
          value={sections.intro}
          onChange={(intro) => setSections((current) => ({ ...current, intro }))}
          placeholder={sectionDefaults.intro || 'No intro on this page yet.'}
          rows={4}
        />
      </SectionBox>

      <SectionBox number={2} label="About" hint="The About box above the product catalogue.">
        <TextField
          id="supplier-about-title"
          label="Title"
          name={supplierContentFieldName('about', 'title')}
          value={about.title}
          onChange={(title) => setAbout((current) => ({ ...current, title }))}
          placeholder={defaults.about.title}
        />
        <TextField
          id="supplier-about-body"
          label="Details"
          name={supplierContentFieldName('about', 'body')}
          value={about.body}
          onChange={(body) => setAbout((current) => ({ ...current, body }))}
          placeholder={defaults.about.body}
          rows={7}
          counter={<WordCounter text={about.body} target={SUPPLIER_CONTENT_WORD_TARGET.about} />}
        />
      </SectionBox>

      <SectionBox
        number={3}
        label="Is it legit?"
        hint="Below the catalogue. Hidden on the page while its text is empty."
      >
        <TextField
          id="supplier-legit-title"
          label="Title"
          name={SUPPLIER_SECTION_FIELDS.legitTitle}
          value={sections.legit.title}
          onChange={(title) => setSections((current) => ({ ...current, legit: { ...current.legit, title } }))}
          placeholder={sectionDefaults.legit.title}
        />
        <TextField
          id="supplier-legit-body"
          label="Details"
          name={SUPPLIER_SECTION_FIELDS.legitBody}
          value={sections.legit.body}
          onChange={(body) => setSections((current) => ({ ...current, legit: { ...current.legit, body } }))}
          placeholder={sectionDefaults.legit.body || 'No rating or COAs on file, so the page shows no summary.'}
          rows={5}
        />
      </SectionBox>

      <SectionBox
        number={4}
        label="Market average prices"
        hint="The price comparison table. The coupon note and the table itself are filled in from live data."
      >
        <TextField
          id="supplier-market-title"
          label="Title"
          name={SUPPLIER_SECTION_FIELDS.marketTitle}
          value={sections.market.title}
          onChange={(title) => setSections((current) => ({ ...current, market: { ...current.market, title } }))}
          placeholder={sectionDefaults.market.title}
        />
        <TextField
          id="supplier-market-body"
          label="Intro text"
          name={SUPPLIER_SECTION_FIELDS.marketBody}
          value={sections.market.body}
          onChange={(body) => setSections((current) => ({ ...current, market: { ...current.market, body } }))}
          placeholder={sectionDefaults.market.body}
          rows={3}
        />
      </SectionBox>

      <SectionBox
        number={5}
        label="FAQs"
        hint="Shown at the bottom of the page and published as FAQPage structured data. An empty list removes the section."
      >
        <FaqEditor
          key={faqVersion}
          path={path}
          saved={faqVersion === 0 ? (savedSections?.faqs ?? null) : null}
          effective={sectionDefaults.faqs}
          fieldName={SUPPLIER_SECTION_FIELDS.faqs}
        />
      </SectionBox>

      <button
        type="button"
        onClick={restoreGenerated}
        className="rounded-chip border border-line px-3 py-1.5 text-xs font-bold text-content transition-colors hover:border-brand"
      >
        Restore generated text
      </button>
    </div>
  );
}

'use client';

import { useActionState, useState } from 'react';
import Link from 'next/link';
import type { GuideFormState } from '@/app/admin/(dashboard)/guides/actions';
import type { Guide, GuideAccent, GuideIcon } from '@/data/guides';
import { Field, TextArea } from '@/components/admin/form-fields';
import { GuideCover } from '@/components/guides/guide-cover';
import { ChevronDownIcon } from '@/components/icons/icons';

const INITIAL_STATE: GuideFormState = { error: null };

/** Body paragraphs are edited as one textarea, split on blank lines. */
interface SectionDraft {
  heading: string;
  body: string;
}

interface FaqDraft {
  question: string;
  answer: string;
}

const ROW_BUTTON_CLASS =
  'inline-flex h-7 w-7 items-center justify-center rounded-chip border border-line bg-surface text-muted transition-colors hover:border-brand hover:text-content disabled:pointer-events-none disabled:opacity-40';

function toDrafts(guide?: Guide): SectionDraft[] {
  if (!guide || guide.sections.length === 0) return [{ heading: '', body: '' }];
  return guide.sections.map((section) => ({ heading: section.heading, body: section.body.join('\n\n') }));
}

export function GuideForm({
  action,
  guide,
  submitLabel,
  initialFaqs,
}: {
  action: (prevState: GuideFormState, formData: FormData) => Promise<GuideFormState>;
  guide?: Guide;
  submitLabel: string;
  /** FAQs already saved for this guide's page; omitted on the new-guide form. */
  initialFaqs?: FaqDraft[];
}) {
  const [rawState, formAction, pending] = useActionState(action, INITIAL_STATE);
  // An unresolvable Server Action (a tab open across a deploy, or a dev
  // rebuild that reassigned action ids) resolves to undefined instead of a
  // state object; falling back keeps the form usable instead of crashing.
  const state = rawState ?? INITIAL_STATE;
  const [sections, setSections] = useState<SectionDraft[]>(() => toDrafts(guide));
  const [faqs, setFaqs] = useState<FaqDraft[]>(() => (initialFaqs ?? []).map((f) => ({ ...f })));
  // No picker for these anymore, so a fixed value rather than state: nothing changes them.
  const icon: GuideIcon = guide?.icon ?? 'document';
  const accent: GuideAccent = guide?.accent ?? 'cat-2';
  const [coverImageUrl, setCoverImageUrl] = useState(guide?.coverImageUrl ?? '');
  const trimmedCover = coverImageUrl.trim();

  const updateSection = (index: number, patch: Partial<SectionDraft>) =>
    setSections((current) => current.map((s, i) => (i === index ? { ...s, ...patch } : s)));

  const moveSection = (index: number, offset: -1 | 1) =>
    setSections((current) => {
      const target = index + offset;
      if (target < 0 || target >= current.length) return current;
      const next = [...current];
      [next[index], next[target]] = [next[target]!, next[index]!];
      return next;
    });

  const serialized = JSON.stringify(
    sections
      .map((s) => ({
        heading: s.heading.trim(),
        body: s.body.split(/\n{2,}/).map((p) => p.trim()).filter(Boolean),
      }))
      .filter((s) => s.heading && s.body.length > 0),
  );

  const updateFaq = (index: number, patch: Partial<FaqDraft>) =>
    setFaqs((current) => current.map((f, i) => (i === index ? { ...f, ...patch } : f)));

  const moveFaq = (index: number, offset: -1 | 1) =>
    setFaqs((current) => {
      const target = index + offset;
      if (target < 0 || target >= current.length) return current;
      const next = [...current];
      [next[index], next[target]] = [next[target]!, next[index]!];
      return next;
    });

  const serializedFaqs = JSON.stringify(
    faqs.map((f) => ({ question: f.question.trim(), answer: f.answer.trim() })).filter((f) => f.question && f.answer),
  );

  return (
    <form action={formAction} className="max-w-4xl space-y-6">
      <section className="rounded-card border border-line bg-surface-raised p-4 sm:p-6">
        <h2 className="text-sm font-black uppercase tracking-wide text-content">Heading &amp; intro</h2>
        <p className="mt-1 text-sm text-muted">
          The top of the guide page: one H1, then a single introductory paragraph under it.
        </p>

        <div className="mt-5 grid grid-cols-1 gap-5 md:grid-cols-2">
          <div className="md:col-span-2">
            <Field
              label="Heading (H1)"
              name="title"
              defaultValue={guide?.title}
              required
              placeholder="What a COA Actually Certifies"
              hint="The page's only H1, and the title shown on its card and in search results."
            />
          </div>

          <div className="md:col-span-2">
            <TextArea
              label="Description (intro paragraph)"
              name="excerpt"
              rows={3}
              defaultValue={guide?.excerpt}
              placeholder="One or two sentences introducing the guide."
              hint="Shown directly under the H1, and reused as the guide card summary and the page's meta description."
            />
          </div>

          <Field label="Category" name="category" defaultValue={guide?.category} required placeholder="Verification" />

          <Field
            label="Read time (minutes)"
            name="readMinutes"
            type="number"
            min="1"
            max="120"
            defaultValue={String(guide?.readMinutes ?? 5)}
          />

          <Field
            label="Publish date"
            name="publishedAt"
            type="date"
            defaultValue={guide?.publishedAt ?? new Date().toISOString().slice(0, 10)}
          />

          <div className="flex items-end">
            <label className="flex items-center gap-2.5 text-sm font-semibold text-content">
              <input
                type="checkbox"
                name="isPublished"
                defaultChecked={guide ? true : true}
                className="h-4 w-4 rounded border-line accent-brand"
              />
              Visible on /guides
            </label>
          </div>
        </div>
      </section>

      {/* ------------------------------------------------------------- Cover */}
      <section className="rounded-card border border-line bg-surface-raised p-4 sm:p-6">
        <h2 className="text-sm font-black uppercase tracking-wide text-content">Cover image</h2>
        <p className="mt-1 text-sm text-muted">
          Paste the URL of the image to use at the top of the guide and on its card. External links only, no
          upload storage is wired up. Leave it empty to use a generated cover instead.
        </p>

        <div className="mt-5 grid grid-cols-1 gap-6 lg:grid-cols-[1fr_20rem]">
          <div className="space-y-5">
            <div>
              <label htmlFor="coverImageUrl" className="block text-sm font-semibold text-content">
                Image URL
              </label>
              <input
                id="coverImageUrl"
                name="coverImageUrl"
                type="url"
                value={coverImageUrl}
                onChange={(e) => setCoverImageUrl(e.target.value)}
                placeholder="https://example.com/cover.jpg"
                className="mt-1.5 w-full rounded-chip border border-line bg-surface px-3.5 py-2.5 text-sm text-content outline-none transition-colors"
              />
              <p className="mt-1 text-xs text-muted">
                {trimmedCover
                  ? 'The preview shows the live image. A URL that fails to load falls back to the generated cover.'
                  : 'No image set, so the generated cover below is what visitors see.'}
              </p>
            </div>

            {/* Icon/colour picker removed from the UI; still submitted as fixed
                values so the generated cover (used whenever no image URL is
                set) keeps rendering something rather than breaking the form. */}
            <input type="hidden" name="icon" value={icon} />
            <input type="hidden" name="accent" value={accent} />
          </div>

          <div>
            <span className="block text-sm font-semibold text-content">Live preview</span>
            <GuideCover
              imageUrl={trimmedCover || null}
              icon={icon}
              accent={accent}
              alt=""
              className="mt-1.5 aspect-[16/9] w-full rounded-card border border-line"
            />
            <p className="mt-1.5 text-xs text-muted">
              {trimmedCover ? 'Cover image' : 'Generated cover'} · shown at 16:9 on the guide and its card
            </p>
          </div>
        </div>
      </section>

      {/* ---------------------------------------------------------- Sections */}
      <section className="rounded-card border border-line bg-surface-raised p-4 sm:p-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-sm font-black uppercase tracking-wide text-content">
              Content sections ({sections.length})
            </h2>
            <p className="mt-1 text-sm text-muted">
              Everything below the intro. Each section renders as an H2 heading with its paragraphs under it.
              Separate paragraphs with a blank line. Add as many as the guide needs.
            </p>
          </div>
          <button
            type="button"
            onClick={() => setSections((current) => [...current, { heading: '', body: '' }])}
            className="rounded-chip border border-line bg-surface px-4 py-2.5 text-sm font-bold text-content transition-colors hover:border-brand hover:bg-brand-soft hover:text-brand-strong"
          >
            Add section
          </button>
        </div>

        <input type="hidden" name="sections" value={serialized} />

        <ol className="mt-5 space-y-4">
          {sections.map((section, index) => (
            <li key={index} className="rounded-card border border-line bg-surface p-4">
              <div className="flex items-center justify-between gap-3">
                <span className="text-micro font-bold uppercase text-faint">Section {index + 1} &middot; H2</span>
                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => moveSection(index, -1)}
                    disabled={index === 0}
                    aria-label={`Move section ${index + 1} up`}
                    className={ROW_BUTTON_CLASS}
                  >
                    <ChevronDownIcon className="h-3.5 w-3.5 rotate-180" />
                  </button>
                  <button
                    type="button"
                    onClick={() => moveSection(index, 1)}
                    disabled={index === sections.length - 1}
                    aria-label={`Move section ${index + 1} down`}
                    className={ROW_BUTTON_CLASS}
                  >
                    <ChevronDownIcon className="h-3.5 w-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => setSections((current) => current.filter((_, i) => i !== index))}
                    disabled={sections.length === 1}
                    className="px-1 text-xs font-bold text-danger transition-colors hover:text-danger/80 disabled:pointer-events-none disabled:opacity-40"
                  >
                    Remove
                  </button>
                </div>
              </div>

              <div className="mt-3 space-y-4">
                <div>
                  <label htmlFor={`section-heading-${index}`} className="block text-sm font-semibold text-content">
                    Heading (H2)
                  </label>
                  <input
                    id={`section-heading-${index}`}
                    type="text"
                    value={section.heading}
                    onChange={(e) => updateSection(index, { heading: e.target.value })}
                    placeholder="What a COA actually certifies"
                    className="mt-1.5 w-full rounded-chip border border-line bg-surface-raised px-3.5 py-2.5 text-sm text-content outline-none transition-colors"
                  />
                </div>

                <div>
                  <label htmlFor={`section-body-${index}`} className="block text-sm font-semibold text-content">
                    Description
                  </label>
                  <textarea
                    id={`section-body-${index}`}
                    rows={6}
                    value={section.body}
                    onChange={(e) => updateSection(index, { body: e.target.value })}
                    placeholder={'First paragraph.\n\nSecond paragraph.'}
                    className="mt-1.5 w-full rounded-chip border border-line bg-surface-raised px-3.5 py-2.5 text-sm leading-relaxed text-content outline-none transition-colors"
                  />
                  <p className="mt-1 text-xs text-muted">
                    {section.body.split(/\n{2,}/).filter((p) => p.trim()).length} paragraph
                    {section.body.split(/\n{2,}/).filter((p) => p.trim()).length === 1 ? '' : 's'}
                  </p>
                </div>
              </div>
            </li>
          ))}
        </ol>
      </section>

      {/* ------------------------------------------------------ Related tool */}
      <section className="rounded-card border border-line bg-surface-raised p-4 sm:p-6">
        <h2 className="text-sm font-black uppercase tracking-wide text-content">Related tool (optional)</h2>
        <p className="mt-1 text-sm text-muted">
          Shown as a call-to-action at the end of the guide. Both fields are needed, or neither is used.
        </p>
        <div className="mt-5 grid grid-cols-1 gap-5 md:grid-cols-2">
          <Field
            label="Link label"
            name="relatedToolLabel"
            defaultValue={guide?.relatedTool?.label}
            placeholder="Try the COA Reader"
          />
          <Field
            label="Link path"
            name="relatedToolHref"
            defaultValue={guide?.relatedTool?.href}
            placeholder="/tools/coa-reader"
          />
        </div>
      </section>

      {/* ------------------------------------------------------------ FAQs */}
      <section className="rounded-card border border-line bg-surface-raised p-4 sm:p-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-sm font-black uppercase tracking-wide text-content">FAQs (optional)</h2>
            <p className="mt-1 text-sm text-muted">
              Shown at the end of the guide, in the site&rsquo;s FAQ design. Leave empty to keep showing the
              auto-generated defaults instead.
            </p>
          </div>
          <button
            type="button"
            onClick={() => setFaqs((current) => [...current, { question: '', answer: '' }])}
            className="rounded-chip border border-line bg-surface px-4 py-2.5 text-sm font-bold text-content transition-colors hover:border-brand hover:bg-brand-soft hover:text-brand-strong"
          >
            Add FAQ
          </button>
        </div>

        <input type="hidden" name="faqs" value={serializedFaqs} />

        {faqs.length === 0 ? (
          <p className="mt-4 rounded-card border border-dashed border-line bg-surface p-4 text-center text-sm text-muted">
            No FAQs yet. Add one, or leave this empty to keep the auto-generated defaults.
          </p>
        ) : (
          <ol className="mt-5 space-y-4">
            {faqs.map((faq, index) => (
              <li key={index} className="rounded-card border border-line bg-surface p-4">
                <div className="flex items-center justify-between gap-3">
                  <span className="text-micro font-bold uppercase text-faint">FAQ {index + 1}</span>
                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => moveFaq(index, -1)}
                      disabled={index === 0}
                      aria-label={`Move FAQ ${index + 1} up`}
                      className={ROW_BUTTON_CLASS}
                    >
                      <ChevronDownIcon className="h-3.5 w-3.5 rotate-180" />
                    </button>
                    <button
                      type="button"
                      onClick={() => moveFaq(index, 1)}
                      disabled={index === faqs.length - 1}
                      aria-label={`Move FAQ ${index + 1} down`}
                      className={ROW_BUTTON_CLASS}
                    >
                      <ChevronDownIcon className="h-3.5 w-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => setFaqs((current) => current.filter((_, i) => i !== index))}
                      className="px-1 text-xs font-bold text-danger transition-colors hover:text-danger/80"
                    >
                      Remove
                    </button>
                  </div>
                </div>

                <div className="mt-3 space-y-4">
                  <div>
                    <label htmlFor={`faq-question-${index}`} className="block text-sm font-semibold text-content">
                      Question
                    </label>
                    <input
                      id={`faq-question-${index}`}
                      type="text"
                      value={faq.question}
                      onChange={(e) => updateFaq(index, { question: e.target.value })}
                      placeholder="What does this guide cover?"
                      className="mt-1.5 w-full rounded-chip border border-line bg-surface-raised px-3.5 py-2.5 text-sm text-content outline-none transition-colors"
                    />
                  </div>
                  <div>
                    <label htmlFor={`faq-answer-${index}`} className="block text-sm font-semibold text-content">
                      Answer
                    </label>
                    <textarea
                      id={`faq-answer-${index}`}
                      rows={4}
                      value={faq.answer}
                      onChange={(e) => updateFaq(index, { answer: e.target.value })}
                      placeholder="Keep it factual and research-use-only."
                      className="mt-1.5 w-full rounded-chip border border-line bg-surface-raised px-3.5 py-2.5 text-sm leading-relaxed text-content outline-none transition-colors"
                    />
                  </div>
                </div>
              </li>
            ))}
          </ol>
        )}
      </section>

      {state.error ? (
        <p role="alert" className="text-sm font-semibold text-danger">
          {state.error}
        </p>
      ) : null}

      <div className="flex items-center justify-between gap-3 border-t border-line pt-5">
        <Link
          href="/admin/guides"
          className="rounded-chip border border-line bg-surface px-5 py-2.5 text-sm font-bold text-content transition-colors hover:border-brand hover:bg-brand-soft hover:text-brand-strong"
        >
          Cancel
        </Link>
        <button
          type="submit"
          disabled={pending}
          className="rounded-chip bg-brand px-5 py-2.5 text-sm font-bold text-surface transition-colors hover:bg-brand-strong disabled:opacity-60"
        >
          {pending ? 'Saving…' : submitLabel}
        </button>
      </div>
    </form>
  );
}

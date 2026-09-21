'use client';

import { startTransition, useActionState, type FormEvent, type ReactNode } from 'react';
import Link from 'next/link';
import type { CompoundFormState } from '@/app/admin/(dashboard)/compounds/actions';
import type { Product } from '@/lib/schema';
import { COMPOUND_FORM_OPTIONS, INTAKE_TYPE_OPTIONS } from '@/lib/compound-content';
import { CheckboxGroup, Field, TextArea } from '@/components/admin/form-fields';
import { RepeatableList, type RepeatableField } from '@/components/admin/repeatable-list';
import { TagListInput } from '@/components/admin/tag-list-input';

const INITIAL_STATE: CompoundFormState = { errors: [] };

const SECTIONS = [
  { id: 'basic-info', title: 'Basic Info' },
  { id: 'faqs', title: 'FAQs' },
  { id: 'benefits', title: 'Benefits' },
  { id: 'evidence-interactions', title: 'Evidence & Interactions' },
  { id: 'dosage', title: 'Dosage' },
] as const;

const FAQ_FIELDS: readonly RepeatableField[] = [
  { key: 'question', label: 'Question', required: true },
  { key: 'answer', label: 'Answer', kind: 'textarea', required: true },
];

const BENEFIT_FIELDS: readonly RepeatableField[] = [
  { key: 'title', label: 'Benefit Title', required: true },
  { key: 'description', label: 'Benefit Description', kind: 'textarea' },
];

const EVIDENCE_FIELDS: readonly RepeatableField[] = [
  { key: 'title', label: 'Evidence Title', required: true },
  { key: 'description', label: 'Evidence Description', kind: 'textarea' },
  { key: 'link', label: 'Evidence Link', kind: 'url', placeholder: 'https://' },
];

const INTERACTION_FIELDS: readonly RepeatableField[] = [
  { key: 'name', label: 'Interaction Name', required: true, placeholder: 'e.g. CJC-1295' },
  { key: 'details', label: 'One-line Details' },
];

function FormSection({
  id,
  step,
  title,
  description,
  children,
}: {
  id: string;
  step: number;
  title: string;
  description?: string;
  children: ReactNode;
}) {
  return (
    <section
      id={id}
      aria-labelledby={`${id}-title`}
      className="scroll-mt-20 rounded-card border border-line bg-surface-raised p-5 sm:p-6"
    >
      <div className="mb-5 flex items-start gap-3">
        <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-pill bg-brand text-xs font-black text-surface">
          {step}
        </span>
        <div>
          <h2 id={`${id}-title`} className="text-base font-black text-content">
            {title}
          </h2>
          {description ? <p className="mt-0.5 text-xs text-muted">{description}</p> : null}
        </div>
      </div>
      <div className="space-y-5">{children}</div>
    </section>
  );
}

function SubHeading({ children }: { children: ReactNode }) {
  return (
    <h3 className="border-t border-line pt-5 text-sm font-black uppercase tracking-wide text-content first:border-0 first:pt-0">
      {children}
    </h3>
  );
}

export function CompoundForm({
  action,
  compound,
  submitLabel,
}: {
  action: (prevState: CompoundFormState, formData: FormData) => Promise<CompoundFormState>;
  compound?: Product;
  submitLabel: string;
}) {
  const [rawState, formAction, pending] = useActionState(action, INITIAL_STATE);
  // An unresolvable Server Action (a tab open across a deploy, or a dev
  // rebuild that reassigned action ids) resolves to undefined instead of a
  // state object; falling back keeps the form usable instead of crashing.
  const state = rawState ?? INITIAL_STATE;
  const research = compound?.research;

  // Dispatched manually rather than via <form action>: React resets
  // uncontrolled fields after a form action, which would wipe everything typed
  // whenever the server sends back a validation error.
  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    startTransition(() => formAction(formData));
  }

  return (
    <form onSubmit={handleSubmit} className="max-w-3xl space-y-6">
      <nav
        aria-label="Form sections"
        className="sticky top-0 z-10 -mx-6 overflow-x-auto border-b border-line bg-surface/95 px-6 py-3 backdrop-blur sm:mx-0 sm:rounded-card sm:border sm:px-3"
      >
        <ol className="flex gap-1 text-sm font-bold">
          {SECTIONS.map((section, index) => (
            <li key={section.id} className="shrink-0">
              <a
                href={`#${section.id}`}
                className="inline-flex items-center gap-2 rounded-pill px-3 py-1.5 text-muted transition-colors hover:bg-brand-soft hover:text-content"
              >
                <span className="text-xs text-faint">{index + 1}</span>
                {section.title}
              </a>
            </li>
          ))}
        </ol>
      </nav>

      <FormSection id="basic-info" step={1} title="Basic Info">
        <Field label="Name" name="name" defaultValue={compound?.name} required />
        <Field
          label="Compound Category"
          name="category"
          defaultValue={compound?.category ?? undefined}
          placeholder="e.g. Healing, GLP-1, Longevity"
        />
        <TextArea
          label="Description"
          name="description"
          defaultValue={compound?.description ?? compound?.summary ?? undefined}
          rows={5}
          hint="Shown in the Overview box on the compound page, followed by the purpose pills."
        />
        <TagListInput
          label="Aliases"
          name="aliases"
          defaultValue={compound?.aliases}
          placeholder="Type an alias and press Enter"
        />
        <CheckboxGroup
          label="Forms (select one or more)"
          name="forms"
          defaultValue={compound?.forms}
          options={COMPOUND_FORM_OPTIONS}
        />
        <CheckboxGroup
          label="Intake Types (select one or more)"
          name="intakeTypes"
          defaultValue={compound?.intakeTypes}
          options={INTAKE_TYPE_OPTIONS}
        />
        <TagListInput
          label="Purpose Pills"
          name="purposePills"
          defaultValue={compound?.purposePills}
          placeholder="Type a purpose and press Enter"
        />
      </FormSection>

      <FormSection
        id="faqs"
        step={2}
        title="FAQs"
        description="Shown in the FAQ section, in this order. With none added, the page shows its standard questions."
      >
        <RepeatableList
          name="faqs"
          itemNoun="FAQ"
          addLabel="Add FAQ"
          emptyText="No FAQs yet."
          fields={FAQ_FIELDS}
          defaultItems={research?.faq.map((item) => ({ question: item.question, answer: item.answer }))}
        />
      </FormSection>

      <FormSection id="benefits" step={3} title="Benefits">
        <Field
          label="Main Benefits Title"
          name="benefitsTitle"
          defaultValue={research?.benefitsTitle ?? undefined}
          placeholder="Reported research benefits."
          hint="Leave blank to use the default heading."
        />
        <TextArea
          label="Main Benefits Description"
          name="benefitsDescription"
          defaultValue={research?.benefitsIntro ?? undefined}
          rows={3}
        />
        <RepeatableList
          name="benefits"
          itemNoun="benefit"
          addLabel="Add Benefit"
          emptyText="No benefits yet."
          fields={BENEFIT_FIELDS}
          defaultItems={research?.benefits.map((item) => ({ title: item.title, description: item.description ?? '' }))}
        />
      </FormSection>

      <FormSection id="evidence-interactions" step={4} title="Evidence & Interactions">
        <SubHeading>Evidence</SubHeading>
        <Field
          label="Main Evidence Title"
          name="evidenceTitle"
          defaultValue={research?.evidenceTitle ?? undefined}
          placeholder="What the studies actually show."
          hint="Leave blank to use the default heading."
        />
        <TextArea
          label="Main Evidence Description"
          name="evidenceDescription"
          defaultValue={research?.evidenceIntro ?? undefined}
          rows={3}
        />
        <RepeatableList
          name="evidence"
          itemNoun="evidence item"
          addLabel="Add Evidence"
          emptyText="No evidence yet."
          fields={EVIDENCE_FIELDS}
          defaultItems={research?.evidence.map((item) => ({
            title: item.title,
            description: item.body ?? '',
            link: item.link ?? '',
          }))}
        />

        <SubHeading>Interactions</SubHeading>
        <Field
          label="Main Interactions Title"
          name="interactionsTitle"
          defaultValue={research?.interactionsTitle ?? undefined}
          placeholder="How it pairs with other peptides."
          hint="Leave blank to use the default heading."
        />
        <RepeatableList
          name="interactions"
          itemNoun="interaction"
          addLabel="Add Interaction"
          emptyText="No interactions yet."
          fields={INTERACTION_FIELDS}
          defaultItems={research?.interactions.map((item) => ({ name: item.pair, details: item.note ?? '' }))}
        />
      </FormSection>

      <FormSection id="dosage" step={5} title="Dosage">
        <Field
          label="Main Dosage Title"
          name="dosageTitle"
          defaultValue={research?.dosageTitle ?? undefined}
          placeholder="How it is typically studied."
          hint="Leave blank to use the default heading."
        />
        <TextArea
          label="Dosage Description"
          name="dosageDescription"
          defaultValue={research?.dosageIntro ?? undefined}
          rows={3}
        />
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Field label="Route" name="route" defaultValue={research?.route ?? undefined} placeholder="e.g. Subcutaneous injection" />
          <Field
            label="Example Range"
            name="exampleRange"
            defaultValue={research?.exampleRange ?? undefined}
            placeholder="250–500 mcg"
          />
          <Field label="Frequency" name="frequency" defaultValue={research?.frequency ?? undefined} placeholder="e.g. Once daily" />
        </div>
        <TextArea label="Timing" name="timing" defaultValue={research?.timing ?? undefined} rows={2} />
      </FormSection>

      <div className="sticky bottom-0 -mx-6 border-t border-line bg-surface-raised px-6 py-4 shadow-lift sm:mx-0 sm:rounded-card sm:border sm:px-5">
        {state.errors.length > 0 ? (
          <div role="alert" className="mb-3 rounded-chip border border-danger/30 bg-danger/5 px-4 py-3">
            <p className="text-sm font-bold text-danger">Couldn&rsquo;t save:</p>
            <ul className="mt-1 list-disc space-y-0.5 pl-5 text-sm text-content">
              {state.errors.map((error) => (
                <li key={error}>{error}</li>
              ))}
            </ul>
          </div>
        ) : null}
        <div className="flex items-center justify-between gap-3">
          <Link
            href="/admin/compounds"
            className="rounded-chip border border-line bg-surface px-5 py-2.5 text-sm font-bold text-content transition-colors hover:border-brand hover:bg-brand-soft hover:text-brand-strong"
          >
            Cancel
          </Link>
          <button
            type="submit"
            disabled={pending}
            className="rounded-chip bg-brand px-6 py-2.5 text-sm font-bold text-surface transition-colors hover:bg-brand-strong disabled:opacity-60"
          >
            {pending ? 'Saving…' : submitLabel}
          </button>
        </div>
      </div>
    </form>
  );
}

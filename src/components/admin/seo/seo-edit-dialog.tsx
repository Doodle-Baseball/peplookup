'use client';

import {
  startTransition,
  useActionState,
  useEffect,
  useState,
  useTransition,
  type FormEvent,
  type ReactNode,
} from 'react';
import { createPortal } from 'react-dom';
import type { RenamableKind, SeoEntry } from '@/lib/admin/seo';
import type { SeoTaskStatus } from '@/lib/seo';
import {
  resetSeoPageAction,
  saveSeoPageAction,
  setPageTaskStatusAction,
  type SeoSaveState,
} from '@/app/admin/(dashboard)/seo/actions';
import { TagListInput } from '@/components/admin/tag-list-input';
import { characterCount, DESCRIPTION_LENGTH, TITLE_LENGTH } from '@/lib/seo-status';
import { site } from '@/config/site';
import { cn } from '@/lib/cn';
import { ChevronDownIcon, CloseIcon, WarningIcon } from '@/components/icons/icons';
import { FaqEditor } from '@/components/admin/seo/faq-editor';
import { SupplierContentEditor } from '@/components/admin/seo/supplier-content-editor';

const INITIAL_STATE: SeoSaveState = { error: null, fieldErrors: {}, savedAt: null };

const TASK_STATUS_OPTIONS: readonly { value: SeoTaskStatus; label: string }[] = [
  { value: 'needs-work', label: 'Needs work' },
  { value: 'pending', label: 'Pending' },
  { value: 'done', label: 'Done' },
];

/** Same colour language the dashboard cards use for these three states. */
const TASK_STATUS_STYLE: Record<SeoTaskStatus, { field: string; dot: string }> = {
  'needs-work': { field: 'border-warn/40 bg-warn/5 text-warn', dot: 'bg-warn' },
  pending: { field: 'border-info/40 bg-info/5 text-info', dot: 'bg-info' },
  done: { field: 'border-ok/40 bg-ok/5 text-ok', dot: 'bg-ok' },
};

/**
 * Saved on its own via `setPageTaskStatusAction` rather than through the main
 * form: it's a workflow note for the admin, unrelated to the page's actual
 * SEO fields, so it shouldn't wait for (or be lost by) the rest of the save.
 *
 * No "Not set" option: a page nobody has ever touched here defaults to
 * "Needs work" in the dropdown, since that's the honest starting state for
 * SEO on a page nobody has reviewed yet.
 */
function TaskStatusDropdown({ path, initial }: { path: string; initial: SeoTaskStatus | null }) {
  const [value, setValue] = useState<SeoTaskStatus>(initial ?? 'needs-work');
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function onChange(event: React.ChangeEvent<HTMLSelectElement>) {
    const next = event.target.value as SeoTaskStatus;
    const previous = value;
    setValue(next); // optimistic
    setError(null);
    startTransition(async () => {
      const result = await setPageTaskStatusAction(path, next);
      if (result.error) {
        setValue(previous);
        setError(result.error);
      }
    });
  }

  const style = TASK_STATUS_STYLE[value];

  return (
    <div>
      <label htmlFor="seo-task-status" className="block text-sm font-semibold text-content">
        Status
      </label>

      {/* The select is styled as a status pill that takes its colour from the
          current value, with a custom chevron since `appearance-none` drops
          the native one. The status dot and chevron are decorative overlays,
          so they must not swallow clicks meant for the select underneath. */}
      <div className="relative mt-1.5 max-w-xs">
        <span
          aria-hidden="true"
          className={cn(
            'pointer-events-none absolute left-3.5 top-1/2 h-2 w-2 -translate-y-1/2 rounded-full',
            style.dot,
          )}
        />
        <select
          id="seo-task-status"
          value={value}
          onChange={onChange}
          disabled={pending}
          className={cn(
            'w-full appearance-none rounded-pill border py-2.5 pl-8 pr-10',
            'text-sm font-bold outline-none transition-colors',
            'focus:ring-2 focus:ring-brand/20 disabled:opacity-60',
            style.field,
          )}
        >
          {TASK_STATUS_OPTIONS.map((option) => (
            <option key={option.value} value={option.value} className="bg-surface text-content">
              {option.label}
            </option>
          ))}
        </select>
        <ChevronDownIcon
          aria-hidden="true"
          className={cn(
            'pointer-events-none absolute right-3.5 top-1/2 h-4 w-4 -translate-y-1/2 transition-transform',
            pending && 'animate-pulse',
          )}
        />
      </div>

      {error ? <p role="alert" className="mt-1 text-xs font-semibold text-danger">{error}</p> : null}
    </div>
  );
}

// Duplicated from lib/admin/seo (server-only) so this client component never imports it at runtime.
const SLUG_PREFIX: Record<RenamableKind, string> = {
  compound: '/products/',
  supplier: '/suppliers/',
  guide: '/guides/',
};

const inputClass =
  'mt-1.5 w-full rounded-chip border bg-surface px-3.5 py-2.5 text-sm text-content outline-none transition-colors duration-150 placeholder:text-faint focus:border-brand';

function FieldError({ message }: { message: string | undefined }) {
  return message ? <p className="mt-1 text-xs font-semibold text-danger">{message}</p> : null;
}

function LengthCounter({ value, range }: { value: string; range: { min: number; max: number } }) {
  if (!value.trim()) return <span className="text-xs text-faint">Using default</span>;
  const count = characterCount(value);
  const inRange = count >= range.min && count <= range.max;
  return (
    <span className={cn('text-xs font-semibold', inRange ? 'text-ok' : 'text-warn')}>
      {count} / {range.min}-{range.max}
    </span>
  );
}

function Section({ title, description, children }: { title: string; description?: string; children: ReactNode }) {
  return (
    <section className="space-y-4 border-t border-line pt-5 first:border-0 first:pt-0">
      <div>
        <h3 className="text-sm font-black uppercase tracking-wide text-content">{title}</h3>
        {description ? <p className="mt-0.5 text-xs text-muted">{description}</p> : null}
      </div>
      {children}
    </section>
  );
}

export function SeoEditDialog({ entry, onClose }: { entry: SeoEntry; onClose: () => void }) {
  const [rawState, formAction, saving] = useActionState(saveSeoPageAction, INITIAL_STATE);
  // A submit whose Server Action can't be resolved, a tab left open across a
  // deploy, or a dev rebuild that reassigned action ids, resolves to
  // undefined rather than a state object. Falling back keeps the dialog
  // usable instead of taking the whole page down on `state.savedAt`.
  const state = rawState ?? INITIAL_STATE;
  const [resetting, startReset] = useTransition();
  const [resetError, setResetError] = useState<string | null>(null);

  const override = entry.override;
  const [metaTitle, setMetaTitle] = useState(override?.metaTitle ?? '');
  const [metaDescription, setMetaDescription] = useState(override?.metaDescription ?? '');
  const [slug, setSlug] = useState(entry.slug ?? '');

  const renamableKind: RenamableKind | null =
    entry.slug !== null && (entry.kind === 'compound' || entry.kind === 'supplier' || entry.kind === 'guide')
      ? entry.kind
      : null;
  const slugChanged = renamableKind !== null && slug.trim() !== '' && slug.trim() !== entry.slug;
  const previewPath = renamableKind ? `${SLUG_PREFIX[renamableKind]}${slug.trim() || entry.slug}` : entry.path;

  useEffect(() => {
    if (state.savedAt) onClose();
  }, [state.savedAt, onClose]);

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
    };
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    window.addEventListener('keydown', onKey);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener('keydown', onKey);
    };
  }, [onClose]);

  // Dispatched manually rather than via <form action>: React resets uncontrolled
  // fields after a form action, which would wipe the form on a validation error.
  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    startTransition(() => formAction(formData));
  }

  function resetToDefaults() {
    setResetError(null);
    startReset(async () => {
      const result = await resetSeoPageAction(entry.path);
      if (result.error) setResetError(result.error);
      else onClose();
    });
  }

  const errors = state.fieldErrors;
  const busy = saving || resetting;

  return createPortal(
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <button type="button" aria-label="Close" onClick={onClose} className="fixed inset-0 bg-black/50 backdrop-blur-sm" />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="seo-edit-title"
        className="relative mx-auto my-8 w-full max-w-3xl rounded-card bg-surface-raised shadow-lift"
      >
        <form onSubmit={handleSubmit}>
          <input type="hidden" name="path" value={entry.path} />
          <input type="hidden" name="kind" value={entry.kind} />
          <input type="hidden" name="slug" value={entry.slug ?? ''} />

          <header className="flex items-start justify-between gap-4 border-b border-line px-6 py-5">
            <div className="min-w-0">
              <p className="text-micro font-bold uppercase text-faint">Edit SEO</p>
              <h2 id="seo-edit-title" className="truncate text-xl font-black text-content">
                {entry.name}
              </h2>
              <p className="truncate font-mono text-xs text-muted">{entry.path}</p>
            </div>
            <button
              type="button"
              onClick={onClose}
              aria-label="Close"
              className="shrink-0 rounded-chip p-1.5 text-muted transition-colors duration-150 hover:bg-surface-sunken hover:text-content"
            >
              <CloseIcon className="h-5 w-5" />
            </button>
          </header>

          <div className="space-y-6 px-6 py-6">
            <Section title="Workflow status" description="A note for the admin only. Saved immediately, separate from the fields below.">
              <TaskStatusDropdown path={entry.path} initial={override?.taskStatus ?? null} />
            </Section>

            {renamableKind ? (
              <Section
                title="URL slug"
                description="Changing the slug renames this page everywhere on the site. The old URL redirects to the new one permanently."
              >
                <div>
                  <label htmlFor="seo-slug" className="block text-sm font-semibold text-content">
                    Slug
                  </label>
                  <div
                    className={cn(
                      'mt-1.5 flex items-center overflow-hidden rounded-chip border bg-surface focus-within:border-brand',
                      errors.newSlug ? 'border-danger' : 'border-line',
                    )}
                  >
                    <span className="shrink-0 border-r border-line bg-surface-sunken px-3 py-2.5 font-mono text-xs text-muted">
                      {SLUG_PREFIX[renamableKind]}
                    </span>
                    <input
                      id="seo-slug"
                      name="newSlug"
                      value={slug}
                      onChange={(event) => setSlug(event.target.value)}
                      spellCheck={false}
                      autoCapitalize="off"
                      className="min-w-0 flex-1 bg-transparent px-3 py-2.5 font-mono text-sm text-content outline-none"
                    />
                  </div>
                  <FieldError message={errors.newSlug} />
                </div>
                {slugChanged ? (
                  <p className="flex gap-2 rounded-chip border border-warn/30 bg-warn/5 px-3 py-2 text-xs text-content">
                    <WarningIcon className="h-4 w-4 shrink-0 text-warn" />
                    <span>
                      On save, <span className="font-mono">{entry.path}</span> moves to{' '}
                      <span className="font-mono font-bold">{previewPath}</span>. Internal links update automatically
                      and the old URL redirects.
                    </span>
                  </p>
                ) : null}
              </Section>
            ) : null}

            <Section title="Search appearance" description="Leave a field blank to keep the page's default.">
              <div>
                <div className="flex items-center justify-between gap-3">
                  <label htmlFor="seo-title" className="text-sm font-semibold text-content">
                    Meta title
                  </label>
                  <LengthCounter value={metaTitle} range={TITLE_LENGTH} />
                </div>
                <input
                  id="seo-title"
                  name="metaTitle"
                  value={metaTitle}
                  onChange={(event) => setMetaTitle(event.target.value)}
                  placeholder={entry.defaults.title}
                  className={cn(inputClass, errors.metaTitle ? 'border-danger' : 'border-line')}
                />
                <FieldError message={errors.metaTitle} />
              </div>

              <div>
                <div className="flex items-center justify-between gap-3">
                  <label htmlFor="seo-description" className="text-sm font-semibold text-content">
                    Meta description
                  </label>
                  <LengthCounter value={metaDescription} range={DESCRIPTION_LENGTH} />
                </div>
                <textarea
                  id="seo-description"
                  name="metaDescription"
                  rows={3}
                  value={metaDescription}
                  onChange={(event) => setMetaDescription(event.target.value)}
                  placeholder={entry.defaults.description}
                  className={cn(inputClass, errors.metaDescription ? 'border-danger' : 'border-line')}
                />
                <FieldError message={errors.metaDescription} />
              </div>

              <div aria-label="Search result preview" className="rounded-chip border border-line bg-surface p-4">
                <p className="text-micro font-bold uppercase text-faint">Search preview</p>
                <p className="mt-2 truncate text-xs text-muted">
                  {site.domain}
                  {previewPath === '/' ? '' : previewPath}
                </p>
                <p className="mt-0.5 line-clamp-1 text-lg font-semibold text-info">{metaTitle.trim() || entry.defaults.title}</p>
                <p className="mt-0.5 line-clamp-2 text-sm text-muted">
                  {metaDescription.trim() || entry.defaults.description}
                </p>
              </div>
            </Section>

            <Section title="On-page heading">
              <div>
                <label htmlFor="seo-h1" className="block text-sm font-semibold text-content">
                  H1 heading
                </label>
                <input
                  id="seo-h1"
                  name="h1"
                  defaultValue={override?.h1 ?? ''}
                  placeholder={entry.defaults.h1}
                  className={cn(inputClass, errors.h1 ? 'border-danger' : 'border-line')}
                />
                <FieldError message={errors.h1} />
              </div>
            </Section>

            <Section
              title="Keywords"
              description="The search terms this page should rank for. Press Enter after each one, or paste several separated by commas."
            >
              <TagListInput
                label="Page keywords"
                name="keywords"
                defaultValue={override?.keywords ?? []}
                placeholder="e.g. bpc-157,tb-500,dsip"
              />
              <FieldError message={errors.keywords} />
            </Section>

            <Section title="Indexing & sharing">
              <div className="flex flex-wrap gap-3">
                <label className="flex cursor-pointer items-center gap-2 rounded-chip border border-line bg-surface px-3 py-2 text-sm text-content has-[:checked]:border-brand has-[:checked]:bg-brand-soft">
                  <input type="checkbox" name="robotsIndex" defaultChecked={override?.robotsIndex ?? true} />
                  Allow search engines to index this page
                </label>
                <label className="flex cursor-pointer items-center gap-2 rounded-chip border border-line bg-surface px-3 py-2 text-sm text-content has-[:checked]:border-brand has-[:checked]:bg-brand-soft">
                  <input type="checkbox" name="robotsFollow" defaultChecked={override?.robotsFollow ?? true} />
                  Follow links on this page
                </label>
              </div>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label htmlFor="seo-canonical" className="block text-sm font-semibold text-content">
                    Canonical URL
                  </label>
                  <input
                    id="seo-canonical"
                    name="canonicalUrl"
                    defaultValue={override?.canonicalUrl ?? ''}
                    placeholder={entry.defaults.path}
                    className={cn(inputClass, errors.canonicalUrl ? 'border-danger' : 'border-line')}
                  />
                  <FieldError message={errors.canonicalUrl} />
                </div>
                <div>
                  <label htmlFor="seo-og-image" className="block text-sm font-semibold text-content">
                    Social share image URL
                  </label>
                  <input
                    id="seo-og-image"
                    name="ogImageUrl"
                    defaultValue={override?.ogImageUrl ?? ''}
                    placeholder="https://"
                    className={cn(inputClass, errors.ogImageUrl ? 'border-danger' : 'border-line')}
                  />
                  <FieldError message={errors.ogImageUrl} />
                </div>
              </div>
            </Section>

            <Section
              title="Custom code"
              description="Runs on the live page for every visitor, so only paste code from sources you trust."
            >
              <div>
                <label htmlFor="seo-head-html" className="block text-sm font-semibold text-content">
                  Custom head scripts &amp; tags
                </label>
                <textarea
                  id="seo-head-html"
                  name="headHtml"
                  rows={5}
                  defaultValue={override?.headHtml ?? ''}
                  spellCheck={false}
                  placeholder={'<meta name="google-site-verification" content="..." />\n<script async src="https://..."></script>'}
                  className={cn(inputClass, 'font-mono text-xs', errors.headHtml ? 'border-danger' : 'border-line')}
                />
                <p className="mt-1 text-xs text-muted">
                  <span className="font-mono">&lt;meta name&gt;</span> tags are rendered in the page HTML for crawlers;
                  scripts and other tags are added to the head when the page loads.
                </p>
                <FieldError message={errors.headHtml} />
              </div>
              <div>
                <label htmlFor="seo-body-html" className="block text-sm font-semibold text-content">
                  Custom HTML tags
                </label>
                <textarea
                  id="seo-body-html"
                  name="bodyHtml"
                  rows={5}
                  defaultValue={override?.bodyHtml ?? ''}
                  spellCheck={false}
                  placeholder={'<script type="application/ld+json">{ ... }</script>'}
                  className={cn(inputClass, 'font-mono text-xs', errors.bodyHtml ? 'border-danger' : 'border-line')}
                />
                <p className="mt-1 text-xs text-muted">Added to the end of the page body.</p>
                <FieldError message={errors.bodyHtml} />
              </div>
            </Section>

            <Section
              title="FAQs"
              description="Shown on the page in the site's FAQ design, and published as FAQPage structured data. Saved separately from the fields above."
            >
              <FaqEditor path={entry.path} saved={entry.faqs} effective={entry.defaultFaqs} />
            </Section>

            {entry.supplierContent ? (
              <Section
                title="Supplier page sections"
                description="The About, Why researchers choose and vs other suppliers boxes shown above the FAQs on this supplier's page."
              >
                <SupplierContentEditor
                  saved={entry.supplierContent.saved}
                  defaults={entry.supplierContent.defaults}
                />
              </Section>
            ) : null}
          </div>

          <footer className="sticky bottom-0 rounded-b-card border-t border-line bg-surface-raised px-6 py-4">
            {state.error || resetError ? (
              <p role="alert" className="mb-3 text-sm font-semibold text-danger">
                {state.error ?? resetError}
              </p>
            ) : null}
            <div className="flex flex-wrap items-center justify-between gap-3">
              {override ? (
                <button
                  type="button"
                  onClick={resetToDefaults}
                  disabled={busy}
                  className="text-sm font-semibold text-muted transition-colors duration-150 hover:text-danger disabled:opacity-50"
                >
                  {resetting ? 'Resetting…' : 'Reset to defaults'}
                </button>
              ) : (
                <span />
              )}
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="rounded-chip border border-line bg-surface px-5 py-2.5 text-sm font-bold text-content transition-colors duration-150 hover:border-brand"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={busy}
                  className="rounded-chip bg-brand px-6 py-2.5 text-sm font-bold text-surface transition-colors duration-150 hover:bg-brand-strong disabled:opacity-60"
                >
                  {saving ? 'Saving…' : 'Save changes'}
                </button>
              </div>
            </div>
          </footer>
        </form>
      </div>
    </div>,
    document.body,
  );
}

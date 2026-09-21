'use client';

import { useState, useTransition } from 'react';
import { savePageFaqsAction } from '@/app/admin/(dashboard)/seo/actions';
import type { FaqItem } from '@/data/default-page-faqs';
import { cn } from '@/lib/cn';
import { ChevronDownIcon, GripIcon, TrashIcon } from '@/components/icons/icons';

const inputClass =
  'w-full rounded-chip border bg-surface px-3.5 py-2.5 text-sm text-content outline-none transition-colors duration-150 placeholder:text-faint focus:border-brand';

interface Draft extends FaqItem {
  /** Stable across reorders so an open row stays open and React keeps input state. */
  key: string;
}

let nextKey = 0;
const toDrafts = (faqs: readonly FaqItem[]): Draft[] =>
  faqs.map((faq) => ({ ...faq, key: `faq-${nextKey++}` }));

/**
 * Add, edit, delete and reorder one page's FAQs.
 *
 * The whole list is submitted on save, so ordering is just the array order and
 * there's no separate reorder call. Saving revalidates the FAQ cache tag, which
 * updates both the visible section and its JSON-LD on the live page.
 */
export function FaqEditor({
  path,
  /** Saved FAQs, or null when the page is still showing its built-in defaults. */
  saved,
  /** What the page currently renders, used to seed the editor the first time. */
  effective,
}: {
  path: string;
  saved: FaqItem[] | null;
  effective: readonly FaqItem[];
}) {
  const [drafts, setDrafts] = useState<Draft[]>(() => toDrafts(saved ?? effective));
  const [openKey, setOpenKey] = useState<string | null>(null);
  const [saving, startSaving] = useTransition();
  const [message, setMessage] = useState<{ tone: 'ok' | 'error'; text: string } | null>(null);
  const [dragIndex, setDragIndex] = useState<number | null>(null);

  const usingDefaults = saved === null;

  function update(index: number, patch: Partial<FaqItem>) {
    setDrafts((current) => current.map((item, i) => (i === index ? { ...item, ...patch } : item)));
    setMessage(null);
  }

  function remove(index: number) {
    setDrafts((current) => current.filter((_, i) => i !== index));
    setMessage(null);
  }

  function add() {
    const draft: Draft = { key: `faq-${nextKey++}`, question: '', answer: '' };
    setDrafts((current) => [...current, draft]);
    setOpenKey(draft.key);
    setMessage(null);
  }

  function move(from: number, to: number) {
    if (from === to || to < 0 || to >= drafts.length) return;
    setDrafts((current) => {
      const next = [...current];
      const [moved] = next.splice(from, 1);
      next.splice(to, 0, moved!);
      return next;
    });
    setMessage(null);
  }

  function save() {
    setMessage(null);
    startSaving(async () => {
      const result = await savePageFaqsAction({
        path,
        faqs: drafts.map(({ question, answer }) => ({ question, answer })),
      });
      setMessage(
        result.error
          ? { tone: 'error', text: result.error }
          : { tone: 'ok', text: 'FAQs saved. The page and its schema are updated.' },
      );
    });
  }

  const incomplete = drafts.some((d) => !d.question.trim() || !d.answer.trim());

  return (
    <div className="space-y-3">
      <p className="text-xs text-muted">
        {usingDefaults
          ? 'This page is showing its built-in FAQs. Saving here replaces them with your own set.'
          : `${drafts.length} saved ${drafts.length === 1 ? 'FAQ' : 'FAQs'} on this page.`}
      </p>

      {drafts.length === 0 ? (
        <p className="rounded-chip border border-dashed border-line px-3.5 py-4 text-center text-xs text-muted">
          No FAQs. Saving an empty list removes the FAQ section from this page entirely.
        </p>
      ) : (
        <ul className="space-y-2">
          {drafts.map((draft, index) => {
            const open = openKey === draft.key;
            return (
              <li
                key={draft.key}
                draggable
                onDragStart={() => setDragIndex(index)}
                onDragEnd={() => setDragIndex(null)}
                onDragOver={(event) => event.preventDefault()}
                onDrop={(event) => {
                  event.preventDefault();
                  if (dragIndex !== null) move(dragIndex, index);
                  setDragIndex(null);
                }}
                className={cn(
                  'rounded-chip border border-line bg-surface',
                  dragIndex === index && 'opacity-40',
                )}
              >
                <div className="flex items-center gap-2 px-2.5 py-2">
                  <GripIcon className="h-4 w-4 shrink-0 cursor-grab text-faint" aria-hidden="true" />
                  <button
                    type="button"
                    onClick={() => setOpenKey(open ? null : draft.key)}
                    className="flex min-w-0 flex-1 items-center gap-2 text-left"
                  >
                    <span className="shrink-0 text-micro font-bold text-faint">{index + 1}</span>
                    <span className="min-w-0 flex-1 truncate text-sm font-semibold text-content">
                      {draft.question.trim() || <span className="text-faint">New question…</span>}
                    </span>
                    <ChevronDownIcon
                      className={cn('h-4 w-4 shrink-0 text-faint transition-transform', open && 'rotate-180')}
                    />
                  </button>

                  <div className="flex shrink-0 items-center gap-0.5">
                    <button
                      type="button"
                      onClick={() => move(index, index - 1)}
                      disabled={index === 0}
                      aria-label="Move up"
                      className="rounded-chip px-1.5 py-1 text-xs font-bold text-muted transition-colors hover:text-content disabled:opacity-30"
                    >
                      ↑
                    </button>
                    <button
                      type="button"
                      onClick={() => move(index, index + 1)}
                      disabled={index === drafts.length - 1}
                      aria-label="Move down"
                      className="rounded-chip px-1.5 py-1 text-xs font-bold text-muted transition-colors hover:text-content disabled:opacity-30"
                    >
                      ↓
                    </button>
                    <button
                      type="button"
                      onClick={() => remove(index)}
                      aria-label={`Delete FAQ ${index + 1}`}
                      className="rounded-chip p-1.5 text-muted transition-colors hover:text-danger"
                    >
                      <TrashIcon className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>

                {open ? (
                  <div className="space-y-2 border-t border-line px-2.5 py-2.5">
                    <div>
                      <label className="block text-xs font-semibold text-content" htmlFor={`${draft.key}-q`}>
                        Question
                      </label>
                      <input
                        id={`${draft.key}-q`}
                        value={draft.question}
                        onChange={(event) => update(index, { question: event.target.value })}
                        placeholder="What does this page answer?"
                        className={cn(inputClass, 'mt-1 border-line')}
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-content" htmlFor={`${draft.key}-a`}>
                        Answer
                      </label>
                      <textarea
                        id={`${draft.key}-a`}
                        value={draft.answer}
                        onChange={(event) => update(index, { answer: event.target.value })}
                        rows={4}
                        placeholder="Keep it factual and research-use-only."
                        className={cn(inputClass, 'mt-1 border-line')}
                      />
                    </div>
                  </div>
                ) : null}
              </li>
            );
          })}
        </ul>
      )}

      {message ? (
        <p
          role={message.tone === 'error' ? 'alert' : 'status'}
          className={cn(
            'text-xs font-semibold',
            message.tone === 'error' ? 'text-danger' : 'text-ok',
          )}
        >
          {message.text}
        </p>
      ) : null}

      <div className="flex flex-wrap items-center gap-2">
        <button
          type="button"
          onClick={add}
          className="rounded-chip border border-line px-3 py-1.5 text-xs font-bold text-content transition-colors hover:border-brand"
        >
          Add FAQ
        </button>
        <button
          type="button"
          onClick={save}
          disabled={saving || incomplete}
          title={incomplete ? 'Every FAQ needs a question and an answer.' : undefined}
          className="rounded-chip bg-brand px-4 py-1.5 text-xs font-bold text-white transition-opacity disabled:opacity-40"
        >
          {saving ? 'Saving…' : 'Save FAQs'}
        </button>
        {usingDefaults && drafts.length > 0 ? (
          <span className="text-xs text-faint">Editing a copy of the built-in set</span>
        ) : null}
      </div>
    </div>
  );
}

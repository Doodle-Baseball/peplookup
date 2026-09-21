'use client';

import { useId, useRef, useState, type KeyboardEvent, type ReactNode } from 'react';
import { cn } from '@/lib/cn';
import {
  CheckIcon,
  ChevronDownIcon,
  GripIcon,
  PencilIcon,
  TrashIcon,
} from '@/components/icons/icons';

export interface RepeatableField {
  key: string;
  label: string;
  kind?: 'text' | 'textarea' | 'url';
  required?: boolean;
  placeholder?: string;
}

type ItemValues = Record<string, string>;

interface ListItem {
  id: string;
  values: ItemValues;
}

const INPUT_CLASS =
  'mt-1.5 w-full rounded-chip border border-line bg-surface-raised px-3.5 py-2.5 text-sm text-content outline-none transition-colors';

function IconButton({
  label,
  onClick,
  disabled = false,
  tone = 'default',
  children,
}: {
  label: string;
  onClick: () => void;
  disabled?: boolean;
  tone?: 'default' | 'danger' | 'active';
  children: ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-label={label}
      title={label}
      className={cn(
        'flex h-8 w-8 items-center justify-center rounded-chip transition-colors disabled:pointer-events-none disabled:opacity-30',
        tone === 'danger' && 'text-muted hover:bg-danger/10 hover:text-danger',
        tone === 'active' && 'bg-brand text-surface',
        tone === 'default' && 'text-muted hover:bg-surface-sunken hover:text-content',
      )}
    >
      {children}
    </button>
  );
}

/**
 * An ordered list of structured items (FAQs, benefits, …) with add, inline
 * edit, delete and reordering, drag and drop, up/down buttons, or jumping
 * straight to a position. The list is submitted with its form as one JSON
 * hidden input named `name`, in the order shown.
 */
export function RepeatableList({
  name,
  itemNoun,
  addLabel,
  fields,
  defaultItems = [],
  emptyText,
}: {
  name: string;
  /** Lower-case singular, used in labels: "FAQ", "benefit", "evidence item". */
  itemNoun: string;
  addLabel: string;
  fields: readonly RepeatableField[];
  defaultItems?: readonly ItemValues[];
  emptyText: string;
}) {
  // Item ids feed input ids that are server-rendered on the edit page, so they
  // must come out identical on server and client: useId for the list, and a
  // per-list counter that starts after the existing items.
  const listId = useId();
  const nextItemNumber = useRef(defaultItems.length);
  const [items, setItems] = useState<ListItem[]>(() =>
    defaultItems.map((values, index) => ({ id: String(index), values: { ...values } })),
  );

  function nextItemId(): string {
    const id = String(nextItemNumber.current);
    nextItemNumber.current += 1;
    return id;
  }
  const [editingId, setEditingId] = useState<string | null>(null);
  const [dragFrom, setDragFrom] = useState<number | null>(null);
  const [dropTarget, setDropTarget] = useState<number | null>(null);
  const [announcement, setAnnouncement] = useState('');

  const [primaryField, secondaryField] = fields;

  function addItem() {
    const id = nextItemId();
    setItems((current) => [...current, { id, values: Object.fromEntries(fields.map((field) => [field.key, ''])) }]);
    setEditingId(id);
    setAnnouncement(`${addLabel}: new ${itemNoun} added at position ${items.length + 1}.`);
  }

  function updateValue(id: string, key: string, value: string) {
    setItems((current) =>
      current.map((item) => (item.id === id ? { ...item, values: { ...item.values, [key]: value } } : item)),
    );
  }

  function removeItem(item: ListItem, index: number) {
    const hasContent = Object.values(item.values).some((value) => value.trim());
    if (hasContent && !window.confirm(`Delete ${itemNoun} ${index + 1}? This can't be undone after you save.`)) {
      return;
    }
    setItems((current) => current.filter((candidate) => candidate.id !== item.id));
    if (editingId === item.id) setEditingId(null);
    setAnnouncement(`${itemNoun} ${index + 1} deleted.`);
  }

  function moveItem(from: number, to: number) {
    if (from === to || to < 0 || to >= items.length) return;
    setItems((current) => {
      const next = [...current];
      const [moved] = next.splice(from, 1);
      if (!moved) return current;
      next.splice(to, 0, moved);
      return next;
    });
    setAnnouncement(`Moved ${itemNoun} to position ${to + 1} of ${items.length}.`);
  }

  function finishOnEnter(event: KeyboardEvent<HTMLInputElement>) {
    // Enter in a text input would otherwise submit the whole compound form.
    if (event.key !== 'Enter') return;
    event.preventDefault();
    setEditingId(null);
  }

  return (
    <div>
      {items.length === 0 ? (
        <p className="rounded-card border border-dashed border-line px-4 py-6 text-center text-sm text-muted">{emptyText}</p>
      ) : (
        <ol className="space-y-2">
          {items.map((item, index) => {
            const isEditing = editingId === item.id;
            const title = primaryField ? item.values[primaryField.key]?.trim() : '';
            const subtitle = secondaryField ? item.values[secondaryField.key]?.trim() : '';
            const missing = fields.filter((field) => field.required && !item.values[field.key]?.trim());

            return (
              <li
                key={item.id}
                draggable={!isEditing}
                onDragStart={(event) => {
                  event.dataTransfer.effectAllowed = 'move';
                  // Firefox won't start a drag without data.
                  event.dataTransfer.setData('text/plain', item.id);
                  setDragFrom(index);
                }}
                onDragOver={(event) => {
                  if (dragFrom === null) return;
                  event.preventDefault();
                  event.dataTransfer.dropEffect = 'move';
                  setDropTarget(index);
                }}
                onDrop={(event) => {
                  event.preventDefault();
                  if (dragFrom !== null) moveItem(dragFrom, index);
                  setDragFrom(null);
                  setDropTarget(null);
                }}
                onDragEnd={() => {
                  setDragFrom(null);
                  setDropTarget(null);
                }}
                className={cn(
                  'rounded-card border bg-surface transition-colors',
                  dropTarget === index && dragFrom !== index ? 'border-brand bg-brand-tint' : 'border-line',
                  dragFrom === index && 'opacity-50',
                )}
              >
                <div className="flex flex-wrap items-center gap-2 p-3">
                  <span
                    aria-hidden="true"
                    className={cn(
                      'flex h-8 w-5 shrink-0 items-center justify-center text-faint',
                      isEditing ? 'opacity-30' : 'cursor-grab active:cursor-grabbing',
                    )}
                  >
                    <GripIcon className="h-4 w-4" />
                  </span>
                  <span className="flex h-6 min-w-6 shrink-0 items-center justify-center rounded-pill bg-surface-sunken px-1.5 text-xs font-bold text-muted">
                    {index + 1}
                  </span>

                  <div className="min-w-0 flex-1 basis-40">
                    <p className={cn('truncate text-sm font-bold', title ? 'text-content' : 'text-faint')}>
                      {title || `Untitled ${itemNoun}`}
                    </p>
                    {subtitle && !isEditing ? <p className="truncate text-xs text-muted">{subtitle}</p> : null}
                    {missing.length > 0 && !isEditing ? (
                      <p className="text-xs font-semibold text-warn">
                        Missing {missing.map((field) => field.label.toLowerCase()).join(' and ')}
                      </p>
                    ) : null}
                  </div>

                  <div className="flex shrink-0 items-center gap-0.5">
                    <label htmlFor={`${listId}-${item.id}-position`} className="sr-only">
                      Position of {itemNoun} {index + 1}
                    </label>
                    <select
                      id={`${listId}-${item.id}-position`}
                      value={index}
                      onChange={(event) => moveItem(index, Number(event.target.value))}
                      title="Move to position"
                      className="mr-1 rounded-chip border border-line bg-surface-raised px-2 py-1.5 text-xs font-semibold text-content"
                    >
                      {items.map((candidate, position) => (
                        <option key={candidate.id} value={position}>
                          #{position + 1}
                        </option>
                      ))}
                    </select>
                    <IconButton label={`Move ${itemNoun} ${index + 1} up`} onClick={() => moveItem(index, index - 1)} disabled={index === 0}>
                      <ChevronDownIcon className="h-4 w-4 rotate-180" />
                    </IconButton>
                    <IconButton
                      label={`Move ${itemNoun} ${index + 1} down`}
                      onClick={() => moveItem(index, index + 1)}
                      disabled={index === items.length - 1}
                    >
                      <ChevronDownIcon className="h-4 w-4" />
                    </IconButton>
                    <IconButton
                      label={isEditing ? `Finish editing ${itemNoun} ${index + 1}` : `Edit ${itemNoun} ${index + 1}`}
                      onClick={() => setEditingId(isEditing ? null : item.id)}
                      tone={isEditing ? 'active' : 'default'}
                    >
                      {isEditing ? <CheckIcon className="h-4 w-4" /> : <PencilIcon className="h-4 w-4" />}
                    </IconButton>
                    <IconButton label={`Delete ${itemNoun} ${index + 1}`} onClick={() => removeItem(item, index)} tone="danger">
                      <TrashIcon className="h-4 w-4" />
                    </IconButton>
                  </div>
                </div>

                {isEditing ? (
                  <div className="space-y-4 border-t border-line p-4">
                    {fields.map((field, fieldIndex) => {
                      const inputId = `${listId}-${item.id}-${field.key}`;
                      const value = item.values[field.key] ?? '';
                      return (
                        <div key={field.key}>
                          <label htmlFor={inputId} className="block text-sm font-semibold text-content">
                            {field.label}
                            {field.required ? ' *' : ''}
                          </label>
                          {field.kind === 'textarea' ? (
                            <textarea
                              id={inputId}
                              rows={3}
                              value={value}
                              autoFocus={fieldIndex === 0}
                              placeholder={field.placeholder}
                              onChange={(event) => updateValue(item.id, field.key, event.target.value)}
                              className={INPUT_CLASS}
                            />
                          ) : (
                            <input
                              id={inputId}
                              type="text"
                              inputMode={field.kind === 'url' ? 'url' : undefined}
                              value={value}
                              autoFocus={fieldIndex === 0}
                              placeholder={field.placeholder}
                              onChange={(event) => updateValue(item.id, field.key, event.target.value)}
                              onKeyDown={finishOnEnter}
                              className={INPUT_CLASS}
                            />
                          )}
                        </div>
                      );
                    })}
                    <div className="flex justify-end">
                      <button
                        type="button"
                        onClick={() => setEditingId(null)}
                        className="rounded-chip border border-line bg-surface-raised px-4 py-2 text-sm font-bold text-content transition-colors hover:border-brand"
                      >
                        Done
                      </button>
                    </div>
                  </div>
                ) : null}
              </li>
            );
          })}
        </ol>
      )}

      <button
        type="button"
        onClick={addItem}
        className="mt-3 inline-flex items-center gap-2 rounded-chip border border-dashed border-line px-4 py-2.5 text-sm font-bold text-content transition-colors hover:border-brand hover:bg-brand-tint"
      >
        <span aria-hidden="true" className="text-base leading-none">
          +
        </span>
        {addLabel}
      </button>

      <p aria-live="polite" className="sr-only">
        {announcement}
      </p>
      <input type="hidden" name={name} value={JSON.stringify(items.map((item) => item.values))} />
    </div>
  );
}

'use client';

import { Children, cloneElement, isValidElement, useEffect, useRef, useState, type ReactElement } from 'react';
import { GripIcon } from '@/components/icons/icons';

/** How long a "Saved" confirmation stays up before fading back to the idle hint. */
const CONFIRMATION_MS = 2000;

/**
 * Drag-and-drop ordering for an admin table body. Dropping a row saves the new
 * order immediately, no separate save step.
 *
 * The rows are rendered on the server and handed over as children; this only
 * permutes them and posts the resulting slug order. `slugs` must be in the same
 * order as `children`, which is how a row maps back to the record it shows.
 *
 * Uses the native HTML5 drag events rather than a drag library, which keeps the
 * dependency list as it is for what is a single sortable list.
 */
export function ReorderRows({
  slugs,
  children,
  saveOrder,
  disabledReason,
}: {
  slugs: string[];
  children: React.ReactNode;
  saveOrder: (slugs: string[]) => Promise<{ error?: string }>;
  /**
   * Set when the list on screen isn't the whole table (e.g. a search is
   * active). Saving then would number only the visible rows and vault them
   * above everything filtered out, so dragging is switched off instead.
   */
  disabledReason?: string;
}) {
  const rows = Children.toArray(children).filter(isValidElement) as ReactElement[];
  const [order, setOrder] = useState<number[]>(() => slugs.map((_, index) => index));
  const [dragIndex, setDragIndex] = useState<number | null>(null);
  const [overIndex, setOverIndex] = useState<number | null>(null);
  const [status, setStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');
  const [error, setError] = useState<string | null>(null);
  const savedTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => () => {
    if (savedTimer.current) clearTimeout(savedTimer.current);
  }, []);

  async function moveAndSave(from: number, to: number) {
    if (from === to) return;
    const next = [...order];
    const [moved] = next.splice(from, 1);
    next.splice(to, 0, moved!);
    const previous = order;
    setOrder(next);

    setStatus('saving');
    setError(null);
    const result = await saveOrder(next.map((index) => slugs[index]!));
    if (result.error) {
      // The DB write didn't happen, so the visible order shouldn't claim otherwise.
      setOrder(previous);
      setStatus('error');
      setError(result.error);
      return;
    }
    setStatus('saved');
    if (savedTimer.current) clearTimeout(savedTimer.current);
    savedTimer.current = setTimeout(() => setStatus('idle'), CONFIRMATION_MS);
  }

  function onDrop(position: number) {
    if (dragIndex !== null) void moveAndSave(dragIndex, position);
    setDragIndex(null);
    setOverIndex(null);
  }

  return (
    <>
      {rows.length > 0 && (disabledReason || status !== 'idle') ? (
        <tr>
          <td colSpan={99} className="border-b border-line bg-surface-sunken/60 px-5 py-2.5">
            <div className="flex flex-wrap items-center justify-end gap-3">
              {disabledReason ? <p className="mr-auto text-xs text-muted">{disabledReason}</p> : null}
              {status === 'saving' ? (
                <span className="text-xs font-bold text-muted">Saving…</span>
              ) : status === 'saved' ? (
                <span role="status" className="text-xs font-bold text-ok">
                  Order saved.
                </span>
              ) : status === 'error' ? (
                <span role="alert" className="text-xs font-bold text-danger">
                  {error}
                </span>
              ) : null}
            </div>
          </td>
        </tr>
      ) : null}

      {order.map((rowIndex, position) => {
        const row = rows[rowIndex];
        if (!row) return null;
        const isDragging = dragIndex === position;
        const isOver = overIndex === position && dragIndex !== position;

        const dragProps = disabledReason
          ? {}
          : {
              draggable: true,
              onDragStart: () => setDragIndex(position),
              onDragEnd: () => {
                setDragIndex(null);
                setOverIndex(null);
              },
              onDragOver: (event: React.DragEvent) => {
                event.preventDefault();
                setOverIndex(position);
              },
              onDrop: (event: React.DragEvent) => {
                event.preventDefault();
                onDrop(position);
              },
            };

        return cloneElement(row, {
          key: slugs[rowIndex],
          ...dragProps,
          className: [
            (row.props as { className?: string }).className ?? '',
            disabledReason ? '' : 'cursor-grab',
            isDragging ? 'opacity-40' : '',
            isOver ? 'outline outline-2 -outline-offset-2 outline-brand' : '',
          ]
            .filter(Boolean)
            .join(' '),
          children: (
            <>
              <td className={`w-8 pl-3 ${disabledReason ? 'text-line' : 'text-faint'}`}>
                <GripIcon className="h-4 w-4" aria-hidden="true" />
                {disabledReason ? null : <span className="sr-only">Drag to reorder</span>}
              </td>
              {(row.props as { children?: React.ReactNode }).children}
            </>
          ),
        } as Partial<unknown> as never);
      })}
    </>
  );
}

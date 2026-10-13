import { cn } from '@/lib/cn';

/**
 * A worked-example table in the tool pages' style: a visible caption, a tinted
 * header, a row header in the first column and an optional totals row. It
 * scrolls inside its own frame on narrow screens rather than widening the page.
 */
export function ExampleTable({
  caption,
  columns,
  rows,
  footer,
  highlightRow,
}: {
  caption: string;
  columns: readonly string[];
  rows: readonly (readonly string[])[];
  footer?: readonly string[];
  /** Index of a row to emphasise, such as the main peak. */
  highlightRow?: number;
}) {
  return (
    <div className="overflow-x-auto rounded-card border border-line bg-surface shadow-card">
      <table className="w-full border-collapse text-left text-sm">
        <caption className="caption-top border-b border-line px-3 py-3 text-left font-mono text-micro font-bold uppercase tracking-wide text-muted sm:px-4">
          {caption}
        </caption>
        <thead className="bg-accent-tint">
          <tr className="border-b border-accent/25">
            {columns.map((column) => (
              <th
                key={column}
                scope="col"
                className="whitespace-nowrap px-3 py-3 text-micro font-bold uppercase tracking-wide text-accent-strong sm:px-4"
              >
                {column}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, rowIndex) => (
            <tr
              key={row.join('|')}
              className={cn(
                'border-b border-line transition-colors last:border-0 hover:bg-accent-tint',
                rowIndex === highlightRow ? 'bg-accent-tint' : 'even:bg-surface-raised',
              )}
            >
              {row.map((cell, cellIndex) =>
                cellIndex === 0 ? (
                  <th key={cellIndex} scope="row" className="whitespace-nowrap px-3 py-3 font-black text-content sm:px-4">
                    {cell}
                  </th>
                ) : (
                  <td
                    key={cellIndex}
                    className={cn(
                      'px-3 py-3 tabular-nums sm:px-4',
                      rowIndex === highlightRow ? 'font-bold text-accent-strong' : 'text-muted',
                      cellIndex < row.length - 1 && 'whitespace-nowrap',
                    )}
                  >
                    {cell}
                  </td>
                ),
              )}
            </tr>
          ))}
        </tbody>
        {footer ? (
          <tfoot className="border-t-2 border-line bg-surface-raised">
            <tr>
              {footer.map((cell, cellIndex) =>
                cellIndex === 0 ? (
                  <th key={cellIndex} scope="row" className="px-3 py-3 font-black text-content sm:px-4">
                    {cell}
                  </th>
                ) : (
                  <td key={cellIndex} className="px-3 py-3 font-black tabular-nums text-content sm:px-4">
                    {cell}
                  </td>
                ),
              )}
            </tr>
          </tfoot>
        ) : null}
      </table>
    </div>
  );
}

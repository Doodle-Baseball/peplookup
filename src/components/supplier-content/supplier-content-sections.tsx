import type { ReactNode } from 'react';
import { cn } from '@/lib/cn';
import { accentedTitle } from '@/components/supplier-content/accented-title';
import type { SupplierContent, SupplierContentKey } from '@/lib/supplier-content';

/** Same panel as the compound page's Overview / Dosage boxes. */
const PANEL_CLASS = 'rounded-panel border border-line bg-surface-raised shadow-card';

function ContentBox({
  id,
  title,
  body,
  className,
}: {
  id: string;
  title: ReactNode;
  body: string;
  className?: string;
}) {
  return (
    <section
      id={id}
      aria-labelledby={`${id}-heading`}
      className={cn(PANEL_CLASS, 'reveal min-w-0 scroll-mt-24 p-5 sm:p-8 lg:p-10', className)}
    >
      {/* break-words: a long vendor name must wrap on a 320px phone rather than overflow the card. */}
      <h2
        id={`${id}-heading`}
        className="mt-3 text-2xl font-black leading-tight text-content break-words sm:text-3xl lg:text-4xl"
      >
        {title}
      </h2>
      <p className="mt-4 max-w-6xl whitespace-pre-line text-sm leading-7 text-muted break-words sm:text-base">
        {body}
      </p>
    </section>
  );
}

/** The About, Why researchers choose and vs other suppliers boxes, each in its own panel. */
export function SupplierContentSections({
  vendorName,
  content,
  keys = ['about', 'why', 'compare'],
  className,
}: {
  vendorName: string;
  content: SupplierContent;
  /** Which boxes to render, in order; all three unless a page asks for fewer. */
  keys?: readonly SupplierContentKey[];
  className?: string;
}) {
  return (
    <div className={cn('space-y-4 sm:space-y-6', className)}>
      {keys.map((key) => (
        <ContentBox
          key={key}
          id={`vendor-${key}`}
          title={accentedTitle(content[key].title, vendorName)}
          body={content[key].body}
        />
      ))}
    </div>
  );
}

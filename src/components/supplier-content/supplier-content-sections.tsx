import type { ReactNode } from 'react';
import { cn } from '@/lib/cn';
import type { SupplierContent, SupplierContentKey } from '@/lib/supplier-content';

/** Same panel as the compound page's Overview / Dosage boxes. */
const PANEL_CLASS = 'rounded-panel border border-line bg-surface-raised shadow-card';

/**
 * Accents the vendor's name inside a heading, the way "What is BPC-157?"
 * accents the compound. A title edited in the admin that doesn't mention the
 * vendor accents its last word instead, so every box keeps the same rhythm.
 */
function accentedTitle(title: string, vendorName: string): ReactNode {
  const at = title.indexOf(vendorName);
  if (at !== -1) {
    return (
      <>
        {title.slice(0, at)}
        <span className="text-accent">{vendorName}</span>
        {title.slice(at + vendorName.length)}
      </>
    );
  }
  const splitAt = title.lastIndexOf(' ');
  if (splitAt === -1) return <span className="text-accent">{title}</span>;
  return (
    <>
      {title.slice(0, splitAt)} <span className="text-accent">{title.slice(splitAt + 1)}</span>
    </>
  );
}

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

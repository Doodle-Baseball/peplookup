import type { ReactNode } from 'react';
import { cn } from '@/lib/cn';
import { CheckBadgeIcon } from '@/components/icons/icons';

/** "Is {Name} legit?": a short factual summary from the supplier's own record, or the text saved in /admin/seo. */
export function SupplierLegitSection({
  title,
  summary,
  className,
}: {
  title: ReactNode;
  summary: string;
  className?: string;
}) {
  if (!summary) return null;

  return (
    <section
      id="vendor-legit"
      aria-labelledby="vendor-legit-heading"
      className={cn(
        'reveal min-w-0 scroll-mt-24 rounded-panel border border-line bg-surface-raised p-5 shadow-card transition-shadow duration-300 hover:shadow-lift sm:p-8',
        className,
      )}
    >
      <div className="flex items-start gap-4">
        <span className="hidden h-11 w-11 shrink-0 items-center justify-center rounded-chip bg-accent-tint text-accent-strong shadow-sm sm:flex">
          <CheckBadgeIcon className="h-5 w-5" />
        </span>
        <div className="min-w-0">
          <h2 id="vendor-legit-heading" className="text-2xl font-black leading-tight text-content break-words sm:text-3xl">
            {title}
          </h2>
          <p className="mt-2 whitespace-pre-line text-sm leading-7 text-muted break-words sm:text-base">{summary}</p>
        </div>
      </div>
    </section>
  );
}

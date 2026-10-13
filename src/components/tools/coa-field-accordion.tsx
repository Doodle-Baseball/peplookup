import { CheckIcon, ChevronDownIcon } from '@/components/icons/icons';

export interface CoaField {
  icon: React.ReactNode;
  title: string;
  subtitle: string;
  bullets: string[];
}

/**
 * Native <details> rather than click-to-render state, so every field's full
 * text ships in the server HTML (search engines read it) and expanding a row
 * needs no JavaScript.
 */
function FieldRow({ field, index }: { field: CoaField; index: number }) {
  return (
    <details className="group overflow-hidden rounded-card border border-line bg-surface shadow-card transition-colors open:border-accent/40 open:bg-surface-raised">
      <summary className="flex cursor-pointer list-none items-center gap-4 px-4 py-4 text-left transition-colors hover:bg-surface-sunken sm:px-5">
        <span className="hidden w-6 shrink-0 font-mono text-xs font-bold text-faint transition-colors group-open:text-accent-strong sm:block">
          {String(index + 1).padStart(2, '0')}
        </span>
        <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-chip border border-accent/25 bg-accent-tint text-accent-strong shadow-sm transition-colors group-hover:border-accent/50 group-open:border-accent group-open:bg-accent group-open:text-surface-raised">
          {field.icon}
        </span>
        <span className="min-w-0 flex-1">
          <span className="block font-black text-content">{field.title}</span>
          <span className="block text-sm text-muted sm:truncate">{field.subtitle}</span>
        </span>
        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-pill border border-line bg-surface-raised text-muted transition-all group-open:rotate-180 group-open:border-accent group-open:bg-accent group-open:text-surface-raised">
          <ChevronDownIcon className="h-4 w-4" />
        </span>
      </summary>

      <div className="border-t border-line px-4 pb-5 pt-4 sm:px-5 sm:pl-28">
        <ul className="space-y-2.5">
          {field.bullets.map((bullet) => (
            <li key={bullet} className="flex items-start gap-2.5 text-sm leading-6 text-content">
              <CheckIcon className="mt-1 h-4 w-4 shrink-0 text-accent" />
              {bullet}
            </li>
          ))}
        </ul>
      </div>
    </details>
  );
}

export function CoaFieldAccordion({ fields }: { fields: CoaField[] }) {
  return (
    <div className="space-y-3">
      {fields.map((field, index) => (
        <FieldRow key={field.title} field={field} index={index} />
      ))}
    </div>
  );
}

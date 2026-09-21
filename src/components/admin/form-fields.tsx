import { ChevronDownIcon } from '@/components/icons/icons';

export function Field({
  label,
  name,
  defaultValue,
  value,
  type = 'text',
  required = false,
  placeholder,
  hint,
  error,
  onChange,
  step,
  min,
  max,
}: {
  label: string;
  name: string;
  defaultValue?: string;
  value?: string;
  type?: string;
  required?: boolean;
  placeholder?: string;
  hint?: string;
  error?: string;
  onChange?: (event: React.ChangeEvent<HTMLInputElement>) => void;
  step?: string;
  min?: string;
  max?: string;
}) {
  return (
    <div>
      <label htmlFor={name} className="block text-sm font-semibold text-content">
        {label}
        {required ? ' *' : ''}
      </label>
      <input
        id={name}
        name={name}
        type={type}
        required={required}
        {...(value !== undefined ? { value } : { defaultValue })}
        onChange={onChange}
        placeholder={placeholder}
        step={step}
        min={min}
        max={max}
        aria-invalid={Boolean(error)}
        className={`mt-1.5 w-full rounded-chip border bg-surface px-3.5 py-2.5 text-sm text-content outline-none transition-colors ${
          error ? 'border-danger' : 'border-line'
        }`}
      />
      {hint ? <p className="mt-1 text-xs text-muted">{hint}</p> : null}
      {error ? <p className="mt-1 text-xs font-semibold text-danger">{error}</p> : null}
    </div>
  );
}

export function TextArea({
  label,
  name,
  defaultValue,
  value,
  rows = 3,
  placeholder,
  hint,
  onChange,
}: {
  label: string;
  name: string;
  defaultValue?: string;
  value?: string;
  rows?: number;
  placeholder?: string;
  hint?: string;
  onChange?: (event: React.ChangeEvent<HTMLTextAreaElement>) => void;
}) {
  return (
    <div>
      <label htmlFor={name} className="block text-sm font-semibold text-content">
        {label}
      </label>
      <textarea
        id={name}
        name={name}
        rows={rows}
        {...(value !== undefined ? { value } : { defaultValue })}
        onChange={onChange}
        placeholder={placeholder}
        className="mt-1.5 w-full rounded-chip border border-line bg-surface px-3.5 py-2.5 text-sm text-content outline-none transition-colors"
      />
      {hint ? <p className="mt-1 text-xs text-muted">{hint}</p> : null}
    </div>
  );
}

export function Select({
  label,
  name,
  defaultValue,
  value,
  children,
  onChange,
}: {
  label: string;
  name: string;
  defaultValue?: string;
  value?: string;
  children: React.ReactNode;
  onChange?: (event: React.ChangeEvent<HTMLSelectElement>) => void;
}) {
  return (
    <div>
      <label htmlFor={name} className="block text-sm font-semibold text-content">
        {label}
      </label>
      <div className="relative mt-1.5">
        <select
          id={name}
          name={name}
          // A field is controlled or uncontrolled, never both: passing `value`
          // and `defaultValue` together is a React warning and makes which one
          // wins ambiguous. The caller picks by which prop it supplies.
          {...(value !== undefined ? { value } : { defaultValue: defaultValue ?? '' })}
          onChange={onChange}
          className="w-full appearance-none rounded-chip border border-line bg-surface px-3.5 py-2.5 pr-10 text-sm text-content outline-none transition-colors hover:border-brand/50"
        >
          {children}
        </select>
        <ChevronDownIcon className="pointer-events-none absolute right-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-faint" />
      </div>
    </div>
  );
}

export function MultiSelect({
  label,
  name,
  defaultValue,
  options,
  hint,
}: {
  label: string;
  name: string;
  defaultValue?: readonly string[];
  options: readonly string[];
  hint?: string;
}) {
  return (
    <div>
      <label htmlFor={name} className="block text-sm font-semibold text-content">
        {label}
      </label>
      <select
        id={name}
        name={name}
        multiple
        defaultValue={defaultValue ? [...defaultValue] : []}
        className="mt-1.5 h-32 w-full rounded-chip border border-line bg-surface px-3.5 py-2.5 text-sm text-content outline-none transition-colors [&>option]:rounded [&>option]:px-2 [&>option]:py-1.5 [&>option:checked]:bg-brand-soft [&>option:checked]:text-brand-strong"
      >
        {options.map((o) => (
          <option key={o} value={o}>
            {o}
          </option>
        ))}
      </select>
      <p className="mt-1 text-xs text-muted">{hint ?? 'Ctrl/Cmd-click to select multiple.'}</p>
    </div>
  );
}

/** A row of toggle-style checkboxes, for short, fixed option sets (Forms, Intake types). */
export function CheckboxGroup({
  label,
  name,
  defaultValue,
  options,
}: {
  label: string;
  name: string;
  defaultValue?: readonly string[];
  options: readonly { value: string; label: string }[];
}) {
  return (
    <div>
      <p className="text-sm font-semibold text-content">{label}</p>
      <div className="mt-1.5 flex flex-wrap gap-2">
        {options.map((option) => (
          <label
            key={option.value}
            className="flex cursor-pointer items-center gap-2 rounded-chip border border-line bg-surface px-3 py-2 text-sm text-content transition-colors hover:border-brand has-[:checked]:border-brand has-[:checked]:bg-brand-soft has-[:checked]:text-brand-strong"
          >
            <input
              type="checkbox"
              name={name}
              value={option.value}
              defaultChecked={defaultValue?.includes(option.value)}
              className="h-3.5 w-3.5 rounded border-line text-brand focus:ring-brand"
            />
            {option.label}
          </label>
        ))}
      </div>
    </div>
  );
}

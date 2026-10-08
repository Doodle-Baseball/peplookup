/** Forms a visitor can narrow a supplier catalogue to. */
export const CATALOG_FORM_OPTIONS = [
  { value: 'vial', label: 'Vial' },
  { value: 'capsule', label: 'Capsule' },
  { value: 'spray', label: 'Spray' },
] as const;

export type CatalogFormValue = (typeof CATALOG_FORM_OPTIONS)[number]['value'];

export function isCatalogFormValue(value: string | undefined): value is CatalogFormValue {
  return CATALOG_FORM_OPTIONS.some((option) => option.value === value);
}

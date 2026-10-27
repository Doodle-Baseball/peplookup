/**
 * Anchor ids for a guide's H2s, in order. Two sections with the same heading
 * get "-2", "-3"… so every table-of-contents link lands on its own section.
 */
export function sectionAnchorIds(headings: readonly string[]): string[] {
  const seen = new Map<string, number>();
  return headings.map((heading) => {
    const base =
      heading
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '') || 'section';
    const count = (seen.get(base) ?? 0) + 1;
    seen.set(base, count);
    return count === 1 ? base : `${base}-${count}`;
  });
}

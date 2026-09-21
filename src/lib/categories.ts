/** A compound's `category` holds one or more research areas, comma-separated ("Anti-Aging, Skin and Hair"). */
export function splitCategories(category: string | null | undefined): string[] {
  if (!category) return [];
  return [...new Set(category.split(',').map((part) => part.trim()).filter(Boolean))];
}

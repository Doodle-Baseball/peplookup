/**
 * Helpers for admin-authored custom head HTML. Pure (no server-only or DOM
 * imports) so the server metadata builder and the client injector agree on
 * which tags each of them is responsible for.
 */

const META_TAG = /<meta\b[^>]*>/gi;

function attribute(tag: string, name: string): string | null {
  const match = new RegExp(`\\s${name}\\s*=\\s*(?:"([^"]*)"|'([^']*)')`, 'i').exec(tag);
  if (!match) return null;
  return match[1] ?? match[2] ?? null;
}

/**
 * `<meta name="..." content="...">` tags from custom head HTML. These are
 * rendered server-side through the Metadata API, so crawlers that never run
 * JavaScript (site-verification checks, most link previewers) still see them.
 * Everything else in the snippet is injected client-side.
 */
export function parseNamedMetaTags(html: string): Record<string, string> {
  const tags: Record<string, string> = {};
  const pattern = new RegExp(META_TAG.source, META_TAG.flags);
  let match: RegExpExecArray | null;
  while ((match = pattern.exec(html)) !== null) {
    const name = attribute(match[0], 'name');
    const content = attribute(match[0], 'content');
    if (name && content !== null) tags[name] = content;
  }
  return tags;
}

const JSON_LD_SCRIPT = /<script\b[^>]*type\s*=\s*["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi;

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function nodeTypes(node: unknown): string[] {
  if (!isRecord(node)) return [];
  const type = node['@type'];
  if (typeof type === 'string') return [type];
  if (Array.isArray(type)) return type.filter((entry): entry is string => typeof entry === 'string');
  return [];
}

function isOwned(node: unknown, owned: ReadonlySet<string>): boolean {
  return nodeTypes(node).some((type) => owned.has(type));
}

/**
 * The pasted document with every node of an owned type removed, or null when
 * nothing is left. Handles a single node, an array of nodes and an @graph.
 */
function withoutOwnedNodes(document: unknown, owned: ReadonlySet<string>): unknown {
  if (Array.isArray(document)) {
    const kept = document.filter((node) => !isOwned(node, owned));
    return kept.length > 0 ? kept : null;
  }
  if (isRecord(document) && Array.isArray(document['@graph'])) {
    const kept = document['@graph'].filter((node) => !isOwned(node, owned));
    return kept.length > 0 ? { ...document, '@graph': kept } : null;
  }
  return isOwned(document, owned) ? null : document;
}

/**
 * Removes hand-pasted JSON-LD that repeats a type the site already outputs on
 * this page, so custom head code from /admin/seo can never produce a second
 * WebApplication or FAQPage. Other markup, and JSON-LD of types the site does
 * not output, passes through untouched. A script that isn't valid JSON is
 * left as it is: it is not ours to rewrite.
 */
export function stripOwnedJsonLd(html: string, owned: ReadonlySet<string>): string {
  return html.replace(JSON_LD_SCRIPT, (script, body: string) => {
    let document: unknown;
    try {
      document = JSON.parse(body);
    } catch {
      return script;
    }
    const kept = withoutOwnedNodes(document, owned);
    if (kept === null) return '';
    if (kept === document) return script;
    const openingTag = script.slice(0, script.indexOf('>') + 1);
    return `${openingTag}${JSON.stringify(kept)}</script>`;
  });
}

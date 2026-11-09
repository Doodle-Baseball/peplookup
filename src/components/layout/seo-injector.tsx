'use client';

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';
import type { SeoInjection } from '@/lib/seo';

/** Appends an HTML snippet to `target` and returns the nodes it added, for cleanup. */
function appendHtml(html: string, target: HTMLElement, skipNamedMeta: boolean): Node[] {
  const template = document.createElement('template');
  template.innerHTML = html;
  const added: Node[] = [];

  for (const node of Array.from(template.content.childNodes)) {
    if (node.nodeType === Node.TEXT_NODE && !node.textContent?.trim()) continue;
    // Already rendered server-side through the page's metadata (see withSeo).
    if (skipNamedMeta && node instanceof HTMLMetaElement && node.hasAttribute('name')) continue;

    let element = node;
    // A <script> created by parsing innerHTML never runs; a freshly created one does.
    if (node instanceof HTMLScriptElement) {
      const script = document.createElement('script');
      for (const attribute of Array.from(node.attributes)) script.setAttribute(attribute.name, attribute.value);
      script.text = node.text;
      element = script;
    }
    target.appendChild(element);
    added.push(element);
  }
  return added;
}

/**
 * Adds a page's custom head scripts and HTML tags from /admin/seo. Mounted
 * once in the marketing layout; it swaps the injected code whenever the route
 * changes, so client-side navigation gets the right page's code too.
 */
export function SeoInjector({ injections }: { injections: Record<string, SeoInjection> }) {
  const pathname = usePathname();
  const injection = injections[pathname];

  useEffect(() => {
    if (!injection) return;
    const added = [
      ...(injection.headHtml ? appendHtml(injection.headHtml, document.head, true) : []),
      ...(injection.bodyHtml ? appendHtml(injection.bodyHtml, document.body, false) : []),
    ];
    return () => {
      for (const node of added) node.parentNode?.removeChild(node);
    };
  }, [injection]);

  return null;
}

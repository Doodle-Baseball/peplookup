'use client';

import { useEffect } from 'react';
import { outboundTargetOf } from '@/lib/traffic/outbound';

const ENDPOINT = '/api/track/outbound';

function reportOutboundClick(url: string) {
  // text/plain keeps this a "simple" request, so it is sent immediately even as the page unloads.
  const body = JSON.stringify({ url, path: window.location.pathname });
  if (navigator.sendBeacon?.(ENDPOINT, new Blob([body], { type: 'text/plain' }))) return;
  void fetch(ENDPOINT, { method: 'POST', body, keepalive: true }).catch(() => {});
}

/**
 * Renders nothing. Reports every click on a link that leaves the site, in
 * any component, so /admin/traffic can show where visitors go. Vendor links
 * go through the same-site /go redirect and are reported as the vendor URL
 * they lead to. One
 * document-level listener covers all of them, including links added later,
 * rather than wiring each outbound link by hand.
 *
 * Listens in the capture phase so a handler that stops propagation on a link
 * can't hide the click, and covers middle-click (`auxclick`), which opens the
 * destination in a new tab just as a plain click does. Admin pages are
 * skipped so the team's own clicks don't pollute the numbers.
 */
export function OutboundLinkTracker() {
  useEffect(() => {
    function handleClick(event: MouseEvent) {
      const isPrimary = event.type === 'click' && event.button === 0;
      const isMiddle = event.type === 'auxclick' && event.button === 1;
      if (!isPrimary && !isMiddle) return;
      if (window.location.pathname.startsWith('/admin')) return;

      const target = event.target;
      if (!(target instanceof Element)) return;
      const link = target.closest('a[href]');
      if (!(link instanceof HTMLAnchorElement)) return;
      const outbound = outboundTargetOf(link.href, window.location.hostname);
      if (!outbound) return;

      reportOutboundClick(outbound.url);
    }

    document.addEventListener('click', handleClick, true);
    document.addEventListener('auxclick', handleClick, true);
    return () => {
      document.removeEventListener('click', handleClick, true);
      document.removeEventListener('auxclick', handleClick, true);
    };
  }, []);

  return null;
}

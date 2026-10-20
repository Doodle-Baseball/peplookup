import { chromeExtension } from '@/config/extension';
import { ExternalIcon } from '@/components/icons/icons';

/** Links to the Chrome Web Store once the listing exists; until then says it is on its way. */
export function AddToChromeButton() {
  const url = chromeExtension.chromeWebStoreUrl;
  if (!url) {
    return (
      <span
        aria-disabled="true"
        className="inline-flex cursor-not-allowed items-center gap-2 rounded-chip border border-line bg-surface-sunken px-7 py-3.5 text-sm font-bold text-muted"
      >
        Add to Chrome: coming soon
      </span>
    );
  }
  return (
    <a
      href={url}
      target="_blank"
      rel="noopener"
      className="btn-3d inline-flex items-center gap-2 rounded-chip bg-brand px-7 py-3.5 text-sm font-bold text-white"
    >
      Add to Chrome, it&rsquo;s free
      <ExternalIcon className="h-4 w-4" />
    </a>
  );
}

'use client';

import { useEffect, useState, type KeyboardEvent } from 'react';
import Link from 'next/link';
import { CloseIcon } from '@/components/icons/icons';
import { parseStoreDomain, storeDomainFromUrl } from '@/lib/extension/domains';
import { EXTENSION_FIELDS_MARKER, type VendorExtensionFields } from '@/lib/extension/vendor-fields';

export interface DomainConflict {
  slug: string;
  name: string;
  domains: string[];
}

/** Shown in place of the fields until 0029 has run, so the rest of the form still saves. */
function MigrationNotice() {
  return (
    <div className="mt-5 rounded-card border border-warn/30 bg-warn/10 p-4 text-sm text-content">
      <p className="font-black">Chrome extension settings</p>
      <p className="mt-1 text-muted">
        Run <code className="font-mono text-xs">supabase/migrations/0029_chrome_extension.sql</code> in the Supabase SQL
        editor to edit store domains and the extension toggle here.
      </p>
    </div>
  );
}

/**
 * Step 1's "Chrome extension" box: the store domains the extension matches
 * and the switch that hides this supplier from the extension feed. With no
 * domain saved, the first one follows the affiliate link until it is edited.
 */
export function VendorExtensionFieldsBox({
  fields,
  affiliateUrl,
  couponCode,
  domainConflicts = [],
}: {
  /** Null when 0029 hasn't run. */
  fields: VendorExtensionFields | null;
  affiliateUrl: string;
  couponCode: string;
  domainConflicts?: readonly DomainConflict[];
}) {
  const savedDomains = fields?.storeDomains ?? [];
  const [domains, setDomains] = useState<string[]>(() => {
    if (savedDomains.length > 0) return [...savedDomains];
    const fromUrl = storeDomainFromUrl(affiliateUrl);
    return fromUrl ? [fromUrl] : [];
  });
  const [domainsEdited, setDomainsEdited] = useState(savedDomains.length > 0);
  const [draft, setDraft] = useState('');
  const [draftError, setDraftError] = useState<string | null>(null);
  const [showInExtension, setShowInExtension] = useState(fields?.showInExtension ?? true);

  useEffect(() => {
    if (domainsEdited) return;
    const fromUrl = storeDomainFromUrl(affiliateUrl);
    setDomains(fromUrl ? [fromUrl] : []);
  }, [affiliateUrl, domainsEdited]);

  if (!fields) return <MigrationNotice />;

  function addDraft() {
    if (!draft.trim()) return;
    const result = parseStoreDomain(draft);
    if (!result.ok) {
      setDraftError(result.error);
      return;
    }
    setDomains((current) => (current.includes(result.domain) ? current : [...current, result.domain]));
    setDomainsEdited(true);
    setDraft('');
    setDraftError(null);
  }

  function onDraftKeyDown(event: KeyboardEvent<HTMLInputElement>) {
    if (event.key !== 'Enter') return;
    event.preventDefault();
    addDraft();
  }

  function removeDomain(domain: string) {
    setDomains((current) => current.filter((value) => value !== domain));
    setDomainsEdited(true);
  }

  const missingCode = showInExtension && !couponCode.trim();

  return (
    <div className="mt-5 rounded-card border border-line bg-surface p-4">
      <input type="hidden" name={EXTENSION_FIELDS_MARKER} value="1" />
      <p className="text-sm font-black text-content">Chrome extension</p>
      <p className="mt-1 text-xs text-muted">
        The extension shows this supplier&rsquo;s code on these store domains. See the{' '}
        <Link href="/admin/extension" className="font-bold text-brand hover:underline">
          extension overview
        </Link>
        .
      </p>

      <div className="mt-4 grid grid-cols-1 gap-5 md:grid-cols-2">
        <div className="md:col-span-2">
          <label htmlFor="storeDomainDraft" className="block text-sm font-semibold text-content">
            Store domains
          </label>
          <div className="mt-1.5 flex gap-2">
            <input
              id="storeDomainDraft"
              type="text"
              value={draft}
              onChange={(event) => {
                setDraft(event.target.value);
                setDraftError(null);
              }}
              onKeyDown={onDraftKeyDown}
              placeholder="example.com"
              aria-invalid={Boolean(draftError)}
              aria-describedby="storeDomainHint"
              className={`w-full flex-1 rounded-chip border bg-surface px-3.5 py-2.5 text-sm text-content outline-none transition-colors ${
                draftError ? 'border-danger' : 'border-line'
              }`}
            />
            <button
              type="button"
              onClick={addDraft}
              className="shrink-0 rounded-chip border border-line px-4 py-2.5 text-sm font-bold text-content transition-colors hover:border-brand hover:text-brand"
            >
              Add
            </button>
          </div>
          <p id="storeDomainHint" className="mt-1 text-xs text-muted">
            Every domain the store uses, without https:// or www. The first one is filled in from the affiliate link.
          </p>
          {draftError ? <p className="mt-1 text-xs font-semibold text-danger">{draftError}</p> : null}

          {domains.length > 0 ? (
            <ul className="mt-2.5 flex flex-wrap gap-1.5">
              {domains.map((domain) => (
                <li
                  key={domain}
                  className="inline-flex items-center gap-1 rounded-pill bg-brand-soft px-2.5 py-1 text-xs font-bold text-brand-strong"
                >
                  {domain}
                  <button
                    type="button"
                    onClick={() => removeDomain(domain)}
                    aria-label={`Remove ${domain}`}
                    className="rounded-pill hover:text-danger"
                  >
                    <CloseIcon className="h-3 w-3" />
                  </button>
                  <input type="hidden" name="storeDomains" value={domain} />
                </li>
              ))}
            </ul>
          ) : (
            <p className="mt-2 text-xs font-semibold text-warn">
              No store domains: the extension can&rsquo;t show this supplier until one is added.
            </p>
          )}

          {domainConflicts.length > 0 ? (
            <div role="status" className="mt-3 rounded-chip border border-warn/30 bg-warn/10 p-3 text-xs text-content">
              <p className="font-bold">Domain used by another supplier</p>
              <ul className="mt-1 space-y-0.5">
                {domainConflicts.map((conflict) => (
                  <li key={conflict.slug}>
                    {conflict.domains.join(', ')} is also saved on{' '}
                    <Link href={`/admin/vendors/${conflict.slug}/edit`} className="font-bold text-brand hover:underline">
                      {conflict.name}
                    </Link>
                    .
                  </li>
                ))}
              </ul>
            </div>
          ) : null}
        </div>

        <div className="md:col-span-2">
          <label className="flex cursor-pointer items-start gap-3">
            <input
              type="checkbox"
              name="showInExtension"
              checked={showInExtension}
              onChange={(event) => setShowInExtension(event.target.checked)}
              className="mt-0.5 h-5 w-5 shrink-0 accent-brand"
            />
            <span>
              <span className="block text-sm font-semibold text-content">Show in extension</span>
              <span className="block text-xs text-muted">
                Off hides this supplier from the extension without removing its coupon from the site.
              </span>
            </span>
          </label>
          {missingCode ? (
            <p className="mt-2 text-xs font-semibold text-warn">
              No coupon code yet, so this supplier stays out of the extension until one is added.
            </p>
          ) : null}
        </div>
      </div>
    </div>
  );
}

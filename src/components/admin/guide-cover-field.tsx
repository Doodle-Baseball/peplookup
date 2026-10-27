'use client';

import { useId, useState, useTransition } from 'react';
import { uploadGuideCoverAction } from '@/app/admin/(dashboard)/guides/actions';
import type { GuideAccent, GuideIcon } from '@/data/guides';
import { GuideCover } from '@/components/guides/guide-cover';
import { cn } from '@/lib/cn';

const MAX_UPLOAD_BYTES = 2 * 1024 * 1024;

const INPUT_CLASS =
  'mt-1.5 w-full rounded-chip border border-line bg-surface px-3.5 py-2.5 text-sm text-content outline-none transition-colors';

/** Hosts whose images this site controls: the upload bucket and the site itself. */
function ownImageHosts(): Set<string> {
  const hosts = new Set(['www.peplookup.com', 'peplookup.com']);
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  if (supabaseUrl) {
    try {
      hosts.add(new URL(supabaseUrl).host);
    } catch {
      // A malformed env value just means uploads aren't recognised as our own; the note is advisory.
    }
  }
  return hosts;
}

function isExternalImage(url: string): boolean {
  try {
    return !ownImageHosts().has(new URL(url).host);
  } catch {
    return false;
  }
}

export function GuideCoverField({
  initialUrl,
  initialAlt,
  icon,
  accent,
  slugHint,
}: {
  initialUrl: string;
  initialAlt: string;
  icon: GuideIcon;
  accent: GuideAccent;
  /** Prefixes the uploaded file's name, so the bucket stays browsable. */
  slugHint: string;
}) {
  const fileInputId = useId();
  const [coverImageUrl, setCoverImageUrl] = useState(initialUrl);
  const [coverImageAlt, setCoverImageAlt] = useState(initialAlt);
  const [mode, setMode] = useState<'upload' | 'url'>(initialUrl && isExternalImage(initialUrl) ? 'url' : 'upload');
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [warnings, setWarnings] = useState<string[]>([]);
  const [isUploading, startUpload] = useTransition();
  const trimmedCover = coverImageUrl.trim();
  const showExternalNote = /^https?:\/\//i.test(trimmedCover) && isExternalImage(trimmedCover);

  const upload = (file: File) => {
    setUploadError(null);
    setWarnings([]);
    if (file.size > MAX_UPLOAD_BYTES) {
      setUploadError(`The image is ${(file.size / 1024 / 1024).toFixed(1)} MB. The limit is 2 MB.`);
      return;
    }
    const formData = new FormData();
    formData.set('file', file);
    formData.set('slugHint', slugHint);
    startUpload(async () => {
      const result = await uploadGuideCoverAction(formData);
      if (result.error || !result.url) {
        setUploadError(result.error ?? 'The image could not be uploaded.');
        return;
      }
      setCoverImageUrl(result.url);
      setWarnings(result.warnings);
    });
  };

  return (
    <div className="mt-5 grid grid-cols-1 gap-6 lg:grid-cols-[1fr_20rem]">
      <div className="space-y-5">
        <div role="tablist" aria-label="Cover image source" className="inline-flex rounded-chip border border-line bg-surface p-1">
          {(['upload', 'url'] as const).map((option) => (
            <button
              key={option}
              type="button"
              role="tab"
              aria-selected={mode === option}
              onClick={() => setMode(option)}
              className={cn(
                'rounded-chip px-3.5 py-1.5 text-sm font-bold transition-colors',
                mode === option ? 'bg-brand text-surface' : 'text-muted hover:text-content',
              )}
            >
              {option === 'upload' ? 'Upload image' : 'Paste image URL'}
            </button>
          ))}
        </div>

        {mode === 'upload' ? (
          <div>
            <label htmlFor={fileInputId} className="block text-sm font-semibold text-content">
              Image file
            </label>
            <input
              id={fileInputId}
              type="file"
              accept="image/jpeg,image/png,image/webp"
              disabled={isUploading}
              onChange={(event) => {
                const file = event.target.files?.[0];
                if (file) upload(file);
                // Lets the same file be picked again after an error.
                event.target.value = '';
              }}
              className="mt-1.5 block w-full text-sm text-muted file:mr-3 file:rounded-chip file:border-0 file:bg-brand file:px-4 file:py-2 file:text-sm file:font-bold file:text-surface hover:file:bg-brand-strong disabled:opacity-60"
            />
            {isUploading ? (
              <p role="status" className="mt-1.5 text-xs font-semibold text-content">
                Uploading and converting to WebP…
              </p>
            ) : null}
          </div>
        ) : null}

        <div>
          <label htmlFor="coverImageUrl" className="block text-sm font-semibold text-content">
            Image URL
          </label>
          <input
            id="coverImageUrl"
            name="coverImageUrl"
            type="url"
            value={coverImageUrl}
            onChange={(e) => setCoverImageUrl(e.target.value)}
            readOnly={mode === 'upload'}
            placeholder={mode === 'upload' ? 'Filled in after the upload' : 'https://example.com/cover.jpg'}
            className={cn(INPUT_CLASS, mode === 'upload' && 'bg-surface-sunken text-muted')}
          />
          {trimmedCover ? (
            <button
              type="button"
              onClick={() => {
                setCoverImageUrl('');
                setWarnings([]);
              }}
              className="mt-1.5 text-xs font-bold text-danger transition-colors hover:text-danger/80"
            >
              Remove image
            </button>
          ) : null}
        </div>

        <p className="text-xs leading-relaxed text-muted">
          Required size: 1600 × 900 px (16:9). Minimum 1200 × 675. JPG, PNG or WebP, max 2 MB. It is converted to
          WebP automatically and shown at 16:9 on the guide and its card.
        </p>

        {uploadError ? (
          <p role="alert" className="rounded-chip border border-danger/30 bg-danger/10 px-3 py-2 text-xs font-semibold text-danger">
            {uploadError}
          </p>
        ) : null}

        {warnings.length > 0 ? (
          <ul role="status" className="space-y-1 rounded-chip border border-warn/30 bg-warn/10 px-3 py-2 text-xs font-semibold text-content">
            {warnings.map((warning) => (
              <li key={warning}>Warning: {warning}</li>
            ))}
          </ul>
        ) : null}

        {showExternalNote ? (
          <p className="rounded-chip border border-warn/30 bg-warn/10 px-3 py-2 text-xs font-semibold text-content">
            External images can break or change. Upload a copy you have permission to use instead.
          </p>
        ) : null}

        <div>
          <label htmlFor="coverImageAlt" className="block text-sm font-semibold text-content">
            Alt text{trimmedCover ? ' *' : ''}
          </label>
          <input
            id="coverImageAlt"
            name="coverImageAlt"
            type="text"
            value={coverImageAlt}
            onChange={(e) => setCoverImageAlt(e.target.value)}
            required={Boolean(trimmedCover)}
            placeholder="Hospira bacteriostatic water 30 mL multiple-dose vials"
            className={INPUT_CLASS}
          />
          <p className="mt-1 text-xs text-muted">
            Describe what the image shows. Required when an image is set; read by screen readers and search engines.
          </p>
        </div>
      </div>

      <div>
        <span className="block text-sm font-semibold text-content">Live preview</span>
        <GuideCover
          imageUrl={trimmedCover || null}
          icon={icon}
          accent={accent}
          alt={coverImageAlt || 'Guide cover image preview'}
          className="mt-1.5 aspect-[16/9] w-full rounded-card border border-line"
        />
        <p className="mt-1.5 text-xs text-muted">
          {trimmedCover ? 'Cover image' : 'Generated cover'} · shown at 16:9 on the guide and its card
        </p>
      </div>
    </div>
  );
}

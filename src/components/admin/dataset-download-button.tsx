'use client';

import { useState } from 'react';
import { exportDatasetFiles, type DatasetFile } from '@/app/admin/(dashboard)/dataset/actions';

function saveFile(file: DatasetFile) {
  const blob = new Blob([file.csv], { type: 'text/csv;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = file.name;
  link.click();
  URL.revokeObjectURL(url);
}

export function DatasetDownloadButton() {
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function download() {
    setIsGenerating(true);
    setError(null);
    try {
      const result = await exportDatasetFiles();
      if (!result.ok) {
        setError(result.error);
        return;
      }
      result.files.forEach(saveFile);
    } catch {
      setError('Could not reach the server. Check your connection and try again.');
    } finally {
      setIsGenerating(false);
    }
  }

  return (
    <div>
      <button
        type="button"
        onClick={download}
        disabled={isGenerating}
        className="inline-flex items-center gap-1.5 rounded-chip bg-brand px-4 py-2.5 text-sm font-bold text-surface transition-colors hover:bg-brand-strong disabled:opacity-60"
      >
        {isGenerating ? 'Generating…' : 'Download dataset CSV'}
      </button>
      {error ? (
        <p role="alert" className="mt-2 text-sm font-semibold text-danger">
          {error}
        </p>
      ) : null}
    </div>
  );
}

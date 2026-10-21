'use server';

import { cookies } from 'next/headers';
import { ADMIN_SESSION_COOKIE, verifyAdminSessionToken } from '@/lib/admin-auth';
import { loadPriceDataset } from '@/lib/admin/dataset';
import { datasetFileNames, datasetToCsv, outliersToCsv } from '@/lib/dataset-export';

export interface DatasetFile {
  name: string;
  csv: string;
}

export type DatasetExportResult = { ok: true; files: DatasetFile[] } | { ok: false; error: string };

/** Both files come from one read, so the outliers always match the dataset they were taken from. */
export async function exportDatasetFiles(): Promise<DatasetExportResult> {
  // The middleware already guards /admin; an action is callable directly, so it checks too.
  const token = (await cookies()).get(ADMIN_SESSION_COOKIE)?.value;
  if (!(await verifyAdminSessionToken(token))) return { ok: false, error: 'Not signed in.' };

  try {
    const now = new Date();
    const dataset = await loadPriceDataset(now);
    const names = datasetFileNames(now);
    return {
      ok: true,
      files: [
        { name: names.prices, csv: datasetToCsv(dataset) },
        { name: names.outliers, csv: outliersToCsv(dataset) },
      ],
    };
  } catch (error) {
    console.error('Dataset export failed', error);
    return { ok: false, error: 'Could not build the dataset. Try again in a minute.' };
  }
}

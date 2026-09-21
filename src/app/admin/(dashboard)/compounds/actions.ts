'use server';

import { revalidatePath, revalidateTag } from 'next/cache';
import { redirect } from 'next/navigation';
import {
  createCompound,
  updateCompound,
  deleteCompound,
  setCompoundFlag,
  importCompounds,
  type CompoundImportOutcome,
} from '@/lib/admin/compounds';
import {
  buildCompoundInput,
  isRecord,
  type CompoundInputResult,
  type RepeatableItem,
} from '@/lib/compound-content';
import { isRowImportable, parseCompoundCsv, rowProblems } from '@/lib/compound-import';
import { saveDisplayOrder } from '@/lib/admin/display-order';
import { AdminDbError } from '@/lib/admin/vendors';

export interface CompoundFormState {
  errors: string[];
}

export interface CompoundImportState {
  error: string | null;
  outcomes: CompoundImportOutcome[];
}

function revalidatePublicProductPages(slugs: readonly string[] = []) {
  // The product list behind the homepage is cached under this tag (src/lib/repository.ts).
  revalidateTag('products');
  revalidatePath('/admin/compounds');
  revalidatePath('/admin');
  revalidatePath('/');
  for (const slug of slugs) revalidatePath(`/products/${slug}`);
}

function textOf(formData: FormData, name: string): string {
  const value = formData.get(name);
  return typeof value === 'string' ? value : '';
}

function valuesOf(formData: FormData, name: string): string[] {
  return formData.getAll(name).filter((value): value is string => typeof value === 'string');
}

function readCompoundInput(formData: FormData): CompoundInputResult {
  const readErrors: string[] = [];

  // Repeatable sections arrive as one JSON-encoded hidden input each (see RepeatableList).
  const itemsOf = (name: string, label: string): RepeatableItem[] => {
    const raw = textOf(formData, name);
    if (!raw.trim()) return [];
    try {
      const parsed: unknown = JSON.parse(raw);
      if (Array.isArray(parsed)) return parsed.filter(isRecord);
    } catch {
      readErrors.push(`The ${label} section couldn't be read. Reload the page and try again.`);
      return [];
    }
    readErrors.push(`The ${label} section couldn't be read. Reload the page and try again.`);
    return [];
  };

  const result = buildCompoundInput({
    name: textOf(formData, 'name'),
    category: textOf(formData, 'category'),
    description: textOf(formData, 'description'),
    aliases: valuesOf(formData, 'aliases'),
    forms: valuesOf(formData, 'forms'),
    intakeTypes: valuesOf(formData, 'intakeTypes'),
    purposePills: valuesOf(formData, 'purposePills'),
    faqs: itemsOf('faqs', 'FAQs'),
    benefitsTitle: textOf(formData, 'benefitsTitle'),
    benefitsDescription: textOf(formData, 'benefitsDescription'),
    benefits: itemsOf('benefits', 'Benefits'),
    evidenceTitle: textOf(formData, 'evidenceTitle'),
    evidenceDescription: textOf(formData, 'evidenceDescription'),
    evidence: itemsOf('evidence', 'Evidence'),
    interactionsTitle: textOf(formData, 'interactionsTitle'),
    interactions: itemsOf('interactions', 'Interactions'),
    dosageTitle: textOf(formData, 'dosageTitle'),
    dosageDescription: textOf(formData, 'dosageDescription'),
    route: textOf(formData, 'route'),
    exampleRange: textOf(formData, 'exampleRange'),
    frequency: textOf(formData, 'frequency'),
    timing: textOf(formData, 'timing'),
  });

  // A section that failed to parse would otherwise save as empty and wipe its rows.
  if (readErrors.length > 0) return { ok: false, errors: [...readErrors, ...(result.ok ? [] : result.errors)] };
  return result;
}

function messageOf(error: unknown, fallback: string): string {
  return error instanceof Error ? error.message : fallback;
}

export async function createCompoundAction(
  _prevState: CompoundFormState,
  formData: FormData,
): Promise<CompoundFormState> {
  const result = readCompoundInput(formData);
  if (!result.ok) return { errors: result.errors };

  let slug: string;
  try {
    slug = await createCompound(result.input);
  } catch (error) {
    return { errors: [messageOf(error, 'Failed to create compound.')] };
  }
  revalidatePublicProductPages([slug]);
  redirect('/admin/compounds');
}

export async function updateCompoundAction(
  slug: string,
  _prevState: CompoundFormState,
  formData: FormData,
): Promise<CompoundFormState> {
  const result = readCompoundInput(formData);
  if (!result.ok) return { errors: result.errors };

  try {
    await updateCompound(slug, result.input);
  } catch (error) {
    return { errors: [messageOf(error, 'Failed to update compound.')] };
  }
  revalidatePublicProductPages([slug]);
  redirect('/admin/compounds');
}

export async function toggleCompoundFlagAction(
  slug: string,
  nextIsCompound: boolean,
): Promise<{ error: string | null }> {
  try {
    await setCompoundFlag(slug, nextIsCompound);
  } catch (error) {
    return { error: messageOf(error, 'Failed to update.') };
  }
  revalidatePublicProductPages([slug]);
  return { error: null };
}

export async function deleteCompoundAction(slug: string): Promise<{ error: string | null }> {
  try {
    await deleteCompound(slug);
  } catch (error) {
    return { error: messageOf(error, 'Failed to delete compound.') };
  }
  revalidatePublicProductPages([slug]);
  return { error: null };
}

/**
 * The file is re-parsed and re-validated here, the browser preview is a
 * convenience, not a trust boundary. Only rows that pass validation are
 * written; every other row comes back as failed with its reasons.
 */
export async function importCompoundsCsvAction(
  _prevState: CompoundImportState,
  formData: FormData,
): Promise<CompoundImportState> {
  const csvText = textOf(formData, 'csvText');
  const onExisting = textOf(formData, 'onExisting') === 'update' ? 'update' : 'skip';
  const enforceLengths = textOf(formData, 'enforceLengths') !== 'off';
  if (!csvText.trim()) return { error: 'Choose a CSV file to import.', outcomes: [] };

  const parsed = parseCompoundCsv(csvText);
  if (parsed.errors.length > 0) return { error: parsed.errors.join(' '), outcomes: [] };

  const invalidOutcomes: CompoundImportOutcome[] = parsed.rows
    .filter((row) => !isRowImportable(row, enforceLengths))
    .map((row) => ({
      rowNumber: row.rowNumber,
      name: row.name,
      status: 'failed',
      slug: null,
      messages: rowProblems(row, enforceLengths),
    }));
  const validRows = parsed.rows
    .filter((row) => isRowImportable(row, enforceLengths))
    .map((row) => ({ rowNumber: row.rowNumber, input: row.input }));

  if (validRows.length === 0) {
    return { error: 'Nothing was imported, every row has errors.', outcomes: invalidOutcomes };
  }

  try {
    const saved = await importCompounds(validRows, onExisting);
    const changedSlugs = saved
      .filter((outcome) => outcome.status === 'created' || outcome.status === 'updated')
      .flatMap((outcome) => (outcome.slug ? [outcome.slug] : []));
    if (changedSlugs.length > 0) revalidatePublicProductPages(changedSlugs);
    const outcomes = [...saved, ...invalidOutcomes].sort((a, b) => a.rowNumber - b.rowNumber);
    return { error: null, outcomes };
  } catch (error) {
    return { error: messageOf(error, 'Failed to import compounds.'), outcomes: invalidOutcomes };
  }
}

/** Persists the drag-and-drop order of the compound directory. */
export async function saveCompoundOrderAction(slugs: string[]): Promise<{ error?: string }> {
  try {
    await saveDisplayOrder('products', slugs);
  } catch (error) {
    return { error: error instanceof AdminDbError ? error.message : 'Could not save the new order.' };
  }
  revalidateTag('products');
  revalidatePath('/admin/compounds');
  revalidatePath('/products');
  revalidatePath('/');
  return {};
}

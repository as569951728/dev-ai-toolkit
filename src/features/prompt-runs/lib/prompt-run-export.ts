import { isPromptRunNote } from '@/features/prompt-run-notes/lib/prompt-run-note-schema';
import { isPromptRunRecord } from '@/features/prompt-runs/lib/prompt-run-schema';
import { isPromptTemplateRevision } from '@/features/prompt-templates/lib/prompt-template-schema';
import type { PromptRunNote } from '@/types/prompt-run-note';
import type { PromptRunRecord } from '@/types/prompt-run';
import type { PromptTemplateRevision } from '@/types/prompt-template';

export interface PromptRunExportPayload {
  schemaVersion: 1;
  exportedAt: string;
  run: PromptRunRecord;
  note: PromptRunNote | null;
  sourceTemplateRevision: PromptTemplateRevision | null;
}

export function createPromptRunExportPayload({
  run,
  note,
  sourceTemplateRevision,
  exportedAt = new Date().toISOString(),
}: {
  run: PromptRunRecord;
  note?: PromptRunNote | null;
  sourceTemplateRevision?: PromptTemplateRevision | null;
  exportedAt?: string;
}): PromptRunExportPayload {
  return {
    schemaVersion: 1,
    exportedAt,
    run,
    note: note ?? null,
    sourceTemplateRevision: sourceTemplateRevision ?? null,
  };
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

function isNonEmptyString(value: unknown): value is string {
  return typeof value === 'string' && value.trim().length > 0;
}

function isValidDateString(value: unknown): value is string {
  return isNonEmptyString(value) && !Number.isNaN(new Date(value).getTime());
}

export function parsePromptRunExportImport(
  rawValue: string,
): PromptRunExportPayload {
  let parsedValue: unknown;

  try {
    parsedValue = JSON.parse(rawValue) as unknown;
  } catch {
    throw new Error('Invalid prompt run export format.');
  }

  if (
    !isRecord(parsedValue) ||
    parsedValue.schemaVersion !== 1 ||
    !isValidDateString(parsedValue.exportedAt) ||
    !isPromptRunRecord(parsedValue.run)
  ) {
    throw new Error('Invalid prompt run export format.');
  }

  const rawNote = parsedValue.note ?? null;
  const sourceTemplateRevision = parsedValue.sourceTemplateRevision ?? null;

  if (rawNote !== null && !isPromptRunNote(rawNote)) {
    throw new Error('Invalid prompt run export format.');
  }

  const run: PromptRunRecord = {
    ...parsedValue.run,
    id: parsedValue.run.id.trim(),
    templateId: parsedValue.run.templateId.trim(),
    templateName: parsedValue.run.templateName.trim(),
  };
  const note: PromptRunNote | null = rawNote
    ? {
        ...rawNote,
        id: rawNote.id.trim(),
        runId: rawNote.runId.trim(),
      }
    : null;

  if (note !== null && note.runId !== run.id) {
    throw new Error('Prompt run note does not match the exported run.');
  }

  if (
    sourceTemplateRevision !== null &&
    !isPromptTemplateRevision(sourceTemplateRevision)
  ) {
    throw new Error('Invalid prompt run export format.');
  }

  if (
    sourceTemplateRevision !== null &&
    sourceTemplateRevision.version !== run.templateVersion
  ) {
    throw new Error('Source template revision does not match the exported run.');
  }

  return {
    schemaVersion: 1,
    exportedAt: parsedValue.exportedAt,
    run,
    note,
    sourceTemplateRevision,
  };
}

export function createPromptRunExportFilename(run: PromptRunRecord) {
  const parsedCreatedAt = new Date(run.createdAt);
  const createdDate = Number.isNaN(parsedCreatedAt.getTime())
    ? 'undated'
    : parsedCreatedAt.toISOString().slice(0, 10);
  const templateName = run.templateName
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
  const nameSegment = templateName || 'prompt-run';
  const runId = run.id
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
  const runIdSegment = runId || 'run';

  return `${createdDate}-${nameSegment}-${runIdSegment}.json`;
}

export function exportPromptRunAsJson({
  run,
  note,
  sourceTemplateRevision,
}: {
  run: PromptRunRecord;
  note?: PromptRunNote | null;
  sourceTemplateRevision?: PromptTemplateRevision | null;
}) {
  const payload = createPromptRunExportPayload({
    run,
    note,
    sourceTemplateRevision,
  });
  const blob = new Blob([JSON.stringify(payload, null, 2)], {
    type: 'application/json',
  });
  const url = URL.createObjectURL(blob);
  let link: HTMLAnchorElement | null = null;

  try {
    link = document.createElement('a');
    link.href = url;
    link.download = createPromptRunExportFilename(run);
    document.body.append(link);
    link.click();
  } finally {
    link?.remove();
    URL.revokeObjectURL(url);
  }
}

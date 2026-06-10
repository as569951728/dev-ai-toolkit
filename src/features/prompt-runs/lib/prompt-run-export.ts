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

export function createPromptRunExportFilename(run: PromptRunRecord) {
  const createdDate = run.createdAt.slice(0, 10) || 'undated';
  const templateName = run.templateName
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
  const nameSegment = templateName || 'prompt-run';

  return `${createdDate}-${nameSegment}-${run.id}.json`;
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
  const link = document.createElement('a');

  link.href = url;
  link.download = createPromptRunExportFilename(run);
  document.body.append(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}

import type { PromptRunNote } from '@/types/prompt-run-note';
import type { PromptRunRecord } from '@/types/prompt-run';
import type { PromptTemplate } from '@/types/prompt-template';
import { isPromptRunNote } from '@/features/prompt-run-notes/lib/prompt-run-note-schema';
import { isPromptRunRecord } from '@/features/prompt-runs/lib/prompt-run-schema';
import { isPromptTemplate } from '@/features/prompt-templates/lib/prompt-template-schema';

const WORKSPACE_BACKUP_VERSION = 1;

export interface WorkspaceBackupData {
  templates: PromptTemplate[];
  runs: PromptRunRecord[];
  notes: PromptRunNote[];
  recentTemplateIds?: string[];
}

export interface WorkspaceBackupPayload {
  version: number;
  exportedAt: string;
  data: WorkspaceBackupData;
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

function isStringArray(value: unknown): value is string[] {
  return Array.isArray(value) && value.every((item) => typeof item === 'string');
}

function hasUniqueKeys<T>(items: T[], getKey: (item: T) => string) {
  return new Set(items.map(getKey)).size === items.length;
}

function normalizeRecentTemplateIds(value: unknown) {
  if (value === undefined) {
    return undefined;
  }

  if (!isStringArray(value)) {
    return null;
  }

  return [
    ...new Set(
      value.map((templateId) => templateId.trim()).filter(Boolean),
    ),
  ];
}

export function filterNotesForWorkspaceBackup(
  notes: PromptRunNote[],
  runs: PromptRunRecord[],
) {
  const runIds = new Set(runs.map((run) => run.id));

  return notes.filter((note) => runIds.has(note.runId));
}

function doNotesReferenceExportedRuns(
  notes: PromptRunNote[],
  runs: PromptRunRecord[],
) {
  return filterNotesForWorkspaceBackup(notes, runs).length === notes.length;
}

function normalizeWorkspaceBackupData(
  value: unknown,
): WorkspaceBackupData | null {
  if (
    !isRecord(value) ||
    !Array.isArray(value.templates) ||
    !Array.isArray(value.runs) ||
    !Array.isArray(value.notes)
  ) {
    return null;
  }

  if (
    !value.templates.every(isPromptTemplate) ||
    !value.runs.every(isPromptRunRecord) ||
    !value.notes.every(isPromptRunNote)
  ) {
    return null;
  }

  if (
    !hasUniqueKeys(value.templates, (template) => template.id) ||
    !hasUniqueKeys(value.runs, (run) => run.id) ||
    !hasUniqueKeys(value.notes, (note) => note.runId)
  ) {
    return null;
  }

  if (!doNotesReferenceExportedRuns(value.notes, value.runs)) {
    return null;
  }

  const recentTemplateIds = normalizeRecentTemplateIds(
    value.recentTemplateIds,
  );

  if (recentTemplateIds === null) {
    return null;
  }

  return {
    templates: value.templates,
    runs: value.runs,
    notes: value.notes,
    ...(recentTemplateIds !== undefined ? { recentTemplateIds } : {}),
  };
}

export function buildWorkspaceBackup(
  data: WorkspaceBackupData,
): WorkspaceBackupPayload {
  return {
    version: WORKSPACE_BACKUP_VERSION,
    exportedAt: new Date().toISOString(),
    data,
  };
}

export function stringifyWorkspaceBackup(data: WorkspaceBackupData) {
  return JSON.stringify(buildWorkspaceBackup(data), null, 2);
}

export function parseWorkspaceBackupImport(
  rawValue: string,
): WorkspaceBackupPayload {
  let parsedValue: unknown;

  try {
    parsedValue = JSON.parse(rawValue) as unknown;
  } catch {
    throw new Error('Invalid workspace backup format.');
  }

  if (!isRecord(parsedValue)) {
    throw new Error('Invalid workspace backup format.');
  }

  if (parsedValue.version !== WORKSPACE_BACKUP_VERSION) {
    throw new Error('Unsupported workspace backup version.');
  }

  const data = normalizeWorkspaceBackupData(parsedValue.data);

  if (
    !isValidDateString(parsedValue.exportedAt) ||
    data === null
  ) {
    throw new Error('Invalid workspace backup format.');
  }

  return {
    version: WORKSPACE_BACKUP_VERSION,
    exportedAt: parsedValue.exportedAt,
    data,
  };
}

export { WORKSPACE_BACKUP_VERSION };

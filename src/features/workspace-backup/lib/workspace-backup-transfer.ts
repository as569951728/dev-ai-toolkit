import type { PromptRunNote } from '@/types/prompt-run-note';
import type { PromptRunRecord } from '@/types/prompt-run';
import type { PromptTemplate } from '@/types/prompt-template';

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

function isPositiveInteger(value: unknown): value is number {
  return typeof value === 'number' && Number.isInteger(value) && value > 0;
}

function isStringRecord(value: unknown): value is Record<string, string> {
  return (
    isRecord(value) &&
    Object.values(value).every((item) => typeof item === 'string')
  );
}

function isStringArray(value: unknown): value is string[] {
  return Array.isArray(value) && value.every((item) => typeof item === 'string');
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

function isValidPromptTemplateRevision(value: unknown) {
  return (
    isRecord(value) &&
    isPositiveInteger(value.version) &&
    isValidDateString(value.updatedAt) &&
    isNonEmptyString(value.name) &&
    isNonEmptyString(value.description) &&
    isNonEmptyString(value.systemPrompt) &&
    isNonEmptyString(value.userPrompt) &&
    isStringArray(value.tags)
  );
}

function isValidPromptTemplate(value: unknown): value is PromptTemplate {
  return (
    isRecord(value) &&
    isNonEmptyString(value.id) &&
    isNonEmptyString(value.name) &&
    isNonEmptyString(value.description) &&
    isNonEmptyString(value.systemPrompt) &&
    isNonEmptyString(value.userPrompt) &&
    isStringArray(value.tags) &&
    isPositiveInteger(value.version) &&
    Array.isArray(value.revisions) &&
    value.revisions.every(isValidPromptTemplateRevision) &&
    (isValidDateString(value.archivedAt) || value.archivedAt === null) &&
    isValidDateString(value.updatedAt)
  );
}

function isValidPromptRun(value: unknown): value is PromptRunRecord {
  return (
    isRecord(value) &&
    isNonEmptyString(value.id) &&
    isNonEmptyString(value.templateId) &&
    isNonEmptyString(value.templateName) &&
    isPositiveInteger(value.templateVersion) &&
    isStringRecord(value.variables) &&
    isNonEmptyString(value.systemPrompt) &&
    isNonEmptyString(value.userPrompt) &&
    isValidDateString(value.createdAt)
  );
}

function isValidPromptRunNote(value: unknown): value is PromptRunNote {
  return (
    isRecord(value) &&
    isNonEmptyString(value.id) &&
    isNonEmptyString(value.runId) &&
    isNonEmptyString(value.body) &&
    isValidDateString(value.createdAt) &&
    isValidDateString(value.updatedAt)
  );
}

function doNotesReferenceExportedRuns(
  notes: PromptRunNote[],
  runs: PromptRunRecord[],
) {
  const runIds = new Set(runs.map((run) => run.id));

  return notes.every((note) => runIds.has(note.runId));
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
    !value.templates.every(isValidPromptTemplate) ||
    !value.runs.every(isValidPromptRun) ||
    !value.notes.every(isValidPromptRunNote)
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
    typeof parsedValue.exportedAt !== 'string' ||
    Number.isNaN(new Date(parsedValue.exportedAt).getTime()) ||
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

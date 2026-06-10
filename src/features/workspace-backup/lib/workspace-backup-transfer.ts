import type { PromptRunNote } from '@/types/prompt-run-note';
import type { PromptRunRecord } from '@/types/prompt-run';
import type { PromptTemplate } from '@/types/prompt-template';

const WORKSPACE_BACKUP_VERSION = 1;

export interface WorkspaceBackupData {
  templates: PromptTemplate[];
  runs: PromptRunRecord[];
  notes: PromptRunNote[];
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

function isStringRecord(value: unknown): value is Record<string, string> {
  return (
    isRecord(value) &&
    Object.values(value).every((item) => typeof item === 'string')
  );
}

function isStringArray(value: unknown): value is string[] {
  return Array.isArray(value) && value.every((item) => typeof item === 'string');
}

function isValidPromptTemplateRevision(value: unknown) {
  return (
    isRecord(value) &&
    typeof value.version === 'number' &&
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
    typeof value.version === 'number' &&
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
    typeof value.templateVersion === 'number' &&
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

function isWorkspaceBackupData(value: unknown): value is WorkspaceBackupData {
  return (
    isRecord(value) &&
    Array.isArray(value.templates) &&
    Array.isArray(value.runs) &&
    Array.isArray(value.notes) &&
    value.templates.every(isValidPromptTemplate) &&
    value.runs.every(isValidPromptRun) &&
    value.notes.every(isValidPromptRunNote)
  );
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

  if (
    typeof parsedValue.exportedAt !== 'string' ||
    Number.isNaN(new Date(parsedValue.exportedAt).getTime()) ||
    !isWorkspaceBackupData(parsedValue.data)
  ) {
    throw new Error('Invalid workspace backup format.');
  }

  return {
    version: WORKSPACE_BACKUP_VERSION,
    exportedAt: parsedValue.exportedAt,
    data: parsedValue.data,
  };
}

export { WORKSPACE_BACKUP_VERSION };

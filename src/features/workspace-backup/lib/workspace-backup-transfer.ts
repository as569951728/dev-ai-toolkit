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

function isStringRecord(value: unknown): value is Record<string, string> {
  return (
    isRecord(value) &&
    Object.values(value).every((item) => typeof item === 'string')
  );
}

function isStringArray(value: unknown): value is string[] {
  return Array.isArray(value) && value.every((item) => typeof item === 'string');
}

function isValidPromptTemplate(value: unknown): value is PromptTemplate {
  return (
    isRecord(value) &&
    typeof value.id === 'string' &&
    typeof value.name === 'string' &&
    typeof value.description === 'string' &&
    typeof value.systemPrompt === 'string' &&
    typeof value.userPrompt === 'string' &&
    isStringArray(value.tags) &&
    typeof value.version === 'number' &&
    Array.isArray(value.revisions) &&
    (typeof value.archivedAt === 'string' || value.archivedAt === null) &&
    typeof value.updatedAt === 'string'
  );
}

function isValidPromptRun(value: unknown): value is PromptRunRecord {
  return (
    isRecord(value) &&
    typeof value.id === 'string' &&
    typeof value.templateId === 'string' &&
    typeof value.templateName === 'string' &&
    typeof value.templateVersion === 'number' &&
    isStringRecord(value.variables) &&
    typeof value.systemPrompt === 'string' &&
    typeof value.userPrompt === 'string' &&
    typeof value.createdAt === 'string'
  );
}

function isValidPromptRunNote(value: unknown): value is PromptRunNote {
  return (
    isRecord(value) &&
    typeof value.id === 'string' &&
    typeof value.runId === 'string' &&
    typeof value.body === 'string' &&
    typeof value.createdAt === 'string' &&
    typeof value.updatedAt === 'string'
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
  const parsedValue = JSON.parse(rawValue) as unknown;

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

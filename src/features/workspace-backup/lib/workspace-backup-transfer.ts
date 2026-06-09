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

function isWorkspaceBackupData(value: unknown): value is WorkspaceBackupData {
  return (
    isRecord(value) &&
    Array.isArray(value.templates) &&
    Array.isArray(value.runs) &&
    Array.isArray(value.notes)
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

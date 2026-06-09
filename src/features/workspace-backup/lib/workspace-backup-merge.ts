import type { WorkspaceBackupData } from '@/features/workspace-backup/lib/workspace-backup-transfer';

export interface WorkspaceBackupCollectionImportSummary {
  created: number;
  updated: number;
  total: number;
}

export interface WorkspaceBackupImportSummary {
  templates: WorkspaceBackupCollectionImportSummary;
  runs: WorkspaceBackupCollectionImportSummary;
  notes: WorkspaceBackupCollectionImportSummary;
}

export interface WorkspaceBackupMergeResult {
  data: WorkspaceBackupData;
  summary: WorkspaceBackupImportSummary;
}

function mergeById<T extends { id: string }>(
  currentItems: T[],
  incomingItems: T[],
) {
  const currentIds = new Set(currentItems.map((item) => item.id));
  const mergedItemsById = new Map(currentItems.map((item) => [item.id, item]));
  let created = 0;
  let updated = 0;

  for (const item of incomingItems) {
    if (currentIds.has(item.id)) {
      updated += 1;
    } else {
      created += 1;
    }

    mergedItemsById.set(item.id, item);
  }

  return {
    items: [...mergedItemsById.values()],
    summary: {
      created,
      updated,
      total: incomingItems.length,
    },
  };
}

export function mergeWorkspaceBackupData(
  currentData: WorkspaceBackupData,
  incomingData: WorkspaceBackupData,
): WorkspaceBackupMergeResult {
  const templates = mergeById(currentData.templates, incomingData.templates);
  const runs = mergeById(currentData.runs, incomingData.runs);
  const notes = mergeById(currentData.notes, incomingData.notes);

  return {
    data: {
      templates: templates.items,
      runs: runs.items,
      notes: notes.items,
    },
    summary: {
      templates: templates.summary,
      runs: runs.summary,
      notes: notes.summary,
    },
  };
}

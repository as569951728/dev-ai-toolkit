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

function mergeByKey<T>(
  currentItems: T[],
  incomingItems: T[],
  getKey: (item: T) => string,
) {
  const currentKeys = new Set(currentItems.map(getKey));
  const mergedItemsByKey = new Map(
    currentItems.map((item) => [getKey(item), item]),
  );
  let created = 0;
  let updated = 0;

  for (const item of incomingItems) {
    const key = getKey(item);

    if (currentKeys.has(key)) {
      updated += 1;
    } else {
      created += 1;
    }

    mergedItemsByKey.set(key, item);
  }

  return {
    items: [...mergedItemsByKey.values()],
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
  const templates = mergeByKey(
    currentData.templates,
    incomingData.templates,
    (template) => template.id,
  );
  const runs = mergeByKey(
    currentData.runs,
    incomingData.runs,
    (run) => run.id,
  );
  const notes = mergeByKey(
    currentData.notes,
    incomingData.notes,
    (note) => note.runId,
  );

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

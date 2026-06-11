import type { WorkspaceBackupData } from '@/features/workspace-backup/lib/workspace-backup-transfer';

export interface WorkspaceBackupCollectionImportSummary {
  created: number;
  updated: number;
  total: number;
}

export interface WorkspaceBackupRecentTemplateImportSummary {
  imported: number;
  skipped: number;
  total: number;
}

export interface WorkspaceBackupImportSummary {
  templates: WorkspaceBackupCollectionImportSummary;
  runs: WorkspaceBackupCollectionImportSummary;
  notes: WorkspaceBackupCollectionImportSummary;
  recentTemplates: WorkspaceBackupRecentTemplateImportSummary;
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
  const incomingItemsByKey = new Map(
    incomingItems.map((item) => [getKey(item), item]),
  );
  let created = 0;
  let updated = 0;

  for (const [key, item] of incomingItemsByKey) {
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
      total: incomingItemsByKey.size,
    },
  };
}

function summarizeRecentTemplateIds(
  incomingTemplateIds: string[] | undefined,
  availableTemplateIds: string[],
) {
  const emptySummary = {
    imported: 0,
    skipped: 0,
    total: 0,
  };

  if (!incomingTemplateIds) {
    return {
      recentTemplateIds: undefined,
      summary: emptySummary,
    };
  }

  const availableTemplateIdSet = new Set(availableTemplateIds);
  const uniqueIncomingTemplateIds = [...new Set(incomingTemplateIds)];
  const importedTemplateIds = uniqueIncomingTemplateIds.filter((templateId) =>
    availableTemplateIdSet.has(templateId),
  );

  return {
    recentTemplateIds: importedTemplateIds,
    summary: {
      imported: importedTemplateIds.length,
      skipped: uniqueIncomingTemplateIds.length - importedTemplateIds.length,
      total: uniqueIncomingTemplateIds.length,
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
  const recentTemplates = summarizeRecentTemplateIds(
    incomingData.recentTemplateIds,
    templates.items.map((template) => template.id),
  );

  return {
    data: {
      templates: templates.items,
      runs: runs.items,
      notes: notes.items,
      ...(recentTemplates.recentTemplateIds
        ? { recentTemplateIds: recentTemplates.recentTemplateIds }
        : {}),
    },
    summary: {
      templates: templates.summary,
      runs: runs.summary,
      notes: notes.summary,
      recentTemplates: recentTemplates.summary,
    },
  };
}

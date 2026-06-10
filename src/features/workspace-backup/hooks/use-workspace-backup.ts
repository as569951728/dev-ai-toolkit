import { useCallback, useMemo } from 'react';

import { usePromptRunNotes } from '@/features/prompt-run-notes/hooks/use-prompt-run-notes';
import { usePromptRuns } from '@/features/prompt-runs/hooks/use-prompt-runs';
import { usePromptTemplates } from '@/features/prompt-templates/hooks/use-prompt-templates';
import {
  loadRecentTemplateIds,
  saveRecentTemplateIds,
} from '@/features/prompt-playground/repositories/local-storage-recent-template-repository';
import { mergeWorkspaceBackupData } from '@/features/workspace-backup/lib/workspace-backup-merge';
import {
  parseWorkspaceBackupImport,
  stringifyWorkspaceBackup,
} from '@/features/workspace-backup/lib/workspace-backup-transfer';

function filterExistingTemplateIds(
  templateIds: string[],
  templateIdsToKeep: string[],
) {
  const availableTemplateIds = new Set(templateIdsToKeep);

  return templateIds.filter((templateId) => availableTemplateIds.has(templateId));
}

export function useWorkspaceBackup() {
  const { importNotes, notes } = usePromptRunNotes();
  const { importRuns, runs } = usePromptRuns();
  const { importTemplates, templates } = usePromptTemplates();

  const createWorkspaceBackupJson = useCallback(
    () =>
      stringifyWorkspaceBackup({
        templates,
        runs,
        notes,
        recentTemplateIds: filterExistingTemplateIds(
          loadRecentTemplateIds(),
          templates.map((template) => template.id),
        ),
      }),
    [notes, runs, templates],
  );

  const importWorkspaceBackupJson = useCallback(
    (rawValue: string) => {
      const backup = parseWorkspaceBackupImport(rawValue);
      const result = mergeWorkspaceBackupData(
        {
          templates,
          runs,
          notes,
        },
        backup.data,
      );

      importTemplates(backup.data.templates, result.summary.templates);
      importRuns(backup.data.runs);
      importNotes(backup.data.notes);

      if (backup.data.recentTemplateIds) {
        saveRecentTemplateIds(
          filterExistingTemplateIds(
            backup.data.recentTemplateIds,
            result.data.templates.map((template) => template.id),
          ),
        );
      }

      return result.summary;
    },
    [importNotes, importRuns, importTemplates, notes, runs, templates],
  );

  return useMemo(
    () => ({
      createWorkspaceBackupJson,
      importWorkspaceBackupJson,
    }),
    [createWorkspaceBackupJson, importWorkspaceBackupJson],
  );
}

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
  filterNotesForWorkspaceBackup,
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
  const { importNotes, notes, replaceNotes } = usePromptRunNotes();
  const { importRuns, replaceRuns, runs } = usePromptRuns();
  const { importTemplates, replaceTemplates, templates } = usePromptTemplates();

  const createWorkspaceBackupJson = useCallback(
    () => {
      return stringifyWorkspaceBackup({
        templates,
        runs,
        notes: filterNotesForWorkspaceBackup(notes, runs),
        recentTemplateIds: filterExistingTemplateIds(
          loadRecentTemplateIds(),
          templates.map((template) => template.id),
        ),
      });
    },
    [notes, runs, templates],
  );

  const importWorkspaceBackupJson = useCallback(
    (rawValue: string) => {
      const backup = parseWorkspaceBackupImport(rawValue);
      const previousRecentTemplateIds = loadRecentTemplateIds();
      const result = mergeWorkspaceBackupData(
        {
          templates,
          runs,
          notes,
        },
        backup.data,
      );
      let templatesImported = false;
      let runsImported = false;
      let notesImported = false;
      let recentTemplateIdsImportAttempted = false;

      try {
        importTemplates(backup.data.templates, result.summary.templates);
        templatesImported = true;
        importRuns(backup.data.runs);
        runsImported = true;
        importNotes(backup.data.notes);
        notesImported = true;

        if (result.data.recentTemplateIds) {
          recentTemplateIdsImportAttempted = true;
          saveRecentTemplateIds(result.data.recentTemplateIds);
        }
      } catch (error) {
        let rollbackFailed = false;
        const tryRollback = (rollback: () => void) => {
          try {
            rollback();
          } catch {
            rollbackFailed = true;
          }
        };

        if (recentTemplateIdsImportAttempted) {
          tryRollback(() => saveRecentTemplateIds(previousRecentTemplateIds));
        }

        if (notesImported) {
          tryRollback(() => replaceNotes(notes));
        }

        if (runsImported) {
          tryRollback(() => replaceRuns(runs));
        }

        if (templatesImported) {
          tryRollback(() => replaceTemplates(templates));
        }

        if (rollbackFailed) {
          throw new Error(
            'Workspace backup import failed and previous local data could not be fully restored.',
            { cause: error },
          );
        }

        throw error;
      }

      return result.summary;
    },
    [
      importNotes,
      importRuns,
      importTemplates,
      notes,
      replaceNotes,
      replaceRuns,
      replaceTemplates,
      runs,
      templates,
    ],
  );

  return useMemo(
    () => ({
      createWorkspaceBackupJson,
      importWorkspaceBackupJson,
    }),
    [createWorkspaceBackupJson, importWorkspaceBackupJson],
  );
}

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
    () => {
      const runIds = new Set(runs.map((run) => run.id));

      return stringifyWorkspaceBackup({
        templates,
        runs,
        notes: notes.filter((note) => runIds.has(note.runId)),
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
          tryRollback(() => importNotes(notes));
        }

        if (runsImported) {
          tryRollback(() => importRuns(runs));
        }

        if (templatesImported) {
          tryRollback(() =>
            importTemplates(templates, {
              created: 0,
              updated: templates.length,
              total: templates.length,
            }),
          );
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

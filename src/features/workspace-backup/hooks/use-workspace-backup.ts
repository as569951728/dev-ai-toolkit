import { useCallback, useMemo } from 'react';

import { usePromptRunNotes } from '@/features/prompt-run-notes/hooks/use-prompt-run-notes';
import { usePromptRuns } from '@/features/prompt-runs/hooks/use-prompt-runs';
import { usePromptTemplates } from '@/features/prompt-templates/hooks/use-prompt-templates';
import { stringifyWorkspaceBackup } from '@/features/workspace-backup/lib/workspace-backup-transfer';

export function useWorkspaceBackup() {
  const { notes } = usePromptRunNotes();
  const { runs } = usePromptRuns();
  const { templates } = usePromptTemplates();

  const createWorkspaceBackupJson = useCallback(
    () =>
      stringifyWorkspaceBackup({
        templates,
        runs,
        notes,
      }),
    [notes, runs, templates],
  );

  return useMemo(
    () => ({
      createWorkspaceBackupJson,
    }),
    [createWorkspaceBackupJson],
  );
}

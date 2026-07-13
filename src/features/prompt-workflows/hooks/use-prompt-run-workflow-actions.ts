import { useCallback, useMemo } from 'react';

import { usePromptRunNotes } from '@/features/prompt-run-notes/hooks/use-prompt-run-notes';
import { usePromptRuns } from '@/features/prompt-runs/hooks/use-prompt-runs';

export function usePromptRunWorkflowActions() {
  const { deleteNoteByRunId, getNoteByRunId, importNotes } = usePromptRunNotes();
  const { deleteRun } = usePromptRuns();

  const deleteRunWithRelatedData = useCallback(
    (runId: string) => {
      const note = getNoteByRunId(runId);

      deleteNoteByRunId(runId);

      try {
        deleteRun(runId);
      } catch (error) {
        if (note) {
          importNotes([note]);
        }

        throw error;
      }
    },
    [deleteNoteByRunId, deleteRun, getNoteByRunId, importNotes],
  );

  return useMemo(
    () => ({
      deleteRunWithRelatedData,
    }),
    [deleteRunWithRelatedData],
  );
}

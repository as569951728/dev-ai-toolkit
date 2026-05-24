import { useCallback, useMemo } from 'react';

import { usePromptRunNotes } from '@/features/prompt-run-notes/hooks/use-prompt-run-notes';
import { usePromptRuns } from '@/features/prompt-runs/hooks/use-prompt-runs';

export function usePromptRunWorkflowActions() {
  const { deleteNoteByRunId } = usePromptRunNotes();
  const { deleteRun } = usePromptRuns();

  const deleteRunWithRelatedData = useCallback(
    (runId: string) => {
      deleteNoteByRunId(runId);
      deleteRun(runId);
    },
    [deleteNoteByRunId, deleteRun],
  );

  return useMemo(
    () => ({
      deleteRunWithRelatedData,
    }),
    [deleteRunWithRelatedData],
  );
}

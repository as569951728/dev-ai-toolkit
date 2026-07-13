import { useCallback, useMemo } from 'react';

import { usePromptRunNotes } from '@/features/prompt-run-notes/hooks/use-prompt-run-notes';
import { usePromptRuns } from '@/features/prompt-runs/hooks/use-prompt-runs';

export class PromptRunNoteRollbackError extends Error {
  readonly rollbackCause: unknown;

  constructor(runDeletionCause: unknown, rollbackCause: unknown) {
    super(
      'The prompt snapshot could not be deleted, and its note could not be restored. The snapshot remains in Run History, but the note may be missing.',
      { cause: runDeletionCause },
    );
    this.name = 'PromptRunNoteRollbackError';
    this.rollbackCause = rollbackCause;
  }
}

export function usePromptRunWorkflowActions() {
  const { deleteNoteByRunId, getNoteByRunId, importNotes } = usePromptRunNotes();
  const { deleteRun } = usePromptRuns();

  const deleteRunWithRelatedData = useCallback(
    (runId: string) => {
      const note = getNoteByRunId(runId);

      if (note) {
        deleteNoteByRunId(runId);
      }

      try {
        deleteRun(runId);
      } catch (error) {
        if (note) {
          try {
            importNotes([note]);
          } catch (rollbackError) {
            throw new PromptRunNoteRollbackError(error, rollbackError);
          }
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

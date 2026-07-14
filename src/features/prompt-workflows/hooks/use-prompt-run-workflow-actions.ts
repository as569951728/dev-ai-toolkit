import { useCallback, useMemo } from 'react';

import { usePromptRunNotes } from '@/features/prompt-run-notes/hooks/use-prompt-run-notes';
import { usePromptRuns } from '@/features/prompt-runs/hooks/use-prompt-runs';
import type { PromptRunRecord } from '@/types/prompt-run';

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

export class PromptRunRestoreRollbackError extends Error {
  readonly rollbackCause: unknown;

  constructor(noteSaveCause: unknown, rollbackCause: unknown) {
    super(
      'A replacement snapshot was created, but its note could not be saved and the snapshot could not be removed. Review Run History for a partial restore.',
      { cause: noteSaveCause },
    );
    this.name = 'PromptRunRestoreRollbackError';
    this.rollbackCause = rollbackCause;
  }
}

export function usePromptRunWorkflowActions() {
  const { deleteNoteByRunId, getNoteByRunId, importNotes, saveNote } =
    usePromptRunNotes();
  const { createRun, deleteRun } = usePromptRuns();

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

  const restoreRunWithNoteDraft = useCallback(
    (sourceRun: PromptRunRecord, noteBody: string) => {
      const restoredRun = createRun({
        templateId: sourceRun.templateId,
        templateName: sourceRun.templateName,
        templateVersion: sourceRun.templateVersion,
        variables: sourceRun.variables,
        systemPrompt: sourceRun.systemPrompt,
        userPrompt: sourceRun.userPrompt,
      });

      try {
        saveNote(restoredRun.id, noteBody);
      } catch (error) {
        try {
          deleteRun(restoredRun.id);
        } catch (rollbackError) {
          throw new PromptRunRestoreRollbackError(error, rollbackError);
        }

        throw error;
      }

      return restoredRun;
    },
    [createRun, deleteRun, saveNote],
  );

  return useMemo(
    () => ({
      deleteRunWithRelatedData,
      restoreRunWithNoteDraft,
    }),
    [deleteRunWithRelatedData, restoreRunWithNoteDraft],
  );
}

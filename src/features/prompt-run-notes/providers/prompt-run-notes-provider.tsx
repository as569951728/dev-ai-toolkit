import { useCallback, useMemo, useState } from 'react';
import type { PropsWithChildren } from 'react';

import { PromptRunNotesContext, type PromptRunNotesContextValue } from '@/features/prompt-run-notes/providers/prompt-run-notes-context';
import { createLocalStoragePromptRunNoteRepository } from '@/features/prompt-run-notes/repositories/local-storage-prompt-run-note-repository';
import type { PromptRunNoteRepository } from '@/features/prompt-run-notes/repositories/prompt-run-note-repository';
import {
  getNoteForRun,
  saveNoteForRun,
} from '@/features/prompt-run-notes/services/prompt-run-note-service';
import type { PromptRunNote } from '@/types/prompt-run-note';

type PromptRunNotesProviderProps = PropsWithChildren<{
  repository?: PromptRunNoteRepository;
}>;

export function PromptRunNotesProvider({
  children,
  repository: repositoryProp,
}: PromptRunNotesProviderProps) {
  const repository = useMemo(
    () => repositoryProp ?? createLocalStoragePromptRunNoteRepository(),
    [repositoryProp],
  );
  const [notes, setNotes] = useState<PromptRunNote[]>(() =>
    repository.loadAll(),
  );

  const getNoteByRunId = useCallback(
    (runId: string) => getNoteForRun(notes, runId),
    [notes],
  );

  const saveNote = useCallback(
    (runId: string, body: string) => {
      const result = saveNoteForRun(repository, notes, runId, body);
      setNotes(result.notes);
      return result.note;
    },
    [repository, notes],
  );

  const value = useMemo<PromptRunNotesContextValue>(
    () => ({
      notes,
      getNoteByRunId,
      saveNote,
    }),
    [notes, getNoteByRunId, saveNote],
  );

  return (
    <PromptRunNotesContext.Provider value={value}>
      {children}
    </PromptRunNotesContext.Provider>
  );
}

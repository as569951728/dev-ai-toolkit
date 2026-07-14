import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import type { PropsWithChildren } from 'react';

import { PromptRunNotesContext, type PromptRunNotesContextValue } from '@/features/prompt-run-notes/providers/prompt-run-notes-context';
import {
  createLocalStoragePromptRunNoteRepository,
  PROMPT_RUN_NOTE_STORAGE_KEY,
} from '@/features/prompt-run-notes/repositories/local-storage-prompt-run-note-repository';
import type { PromptRunNoteRepository } from '@/features/prompt-run-notes/repositories/prompt-run-note-repository';
import {
  deleteNoteForRun,
  getNoteForRun,
  importPromptRunNotes,
  saveNoteForRun,
} from '@/features/prompt-run-notes/services/prompt-run-note-service';
import type { PromptRunNote } from '@/types/prompt-run-note';
import { subscribeToStorageKey } from '@/lib/storage-sync';

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
  const notesRef = useRef(notes);

  const commitNotes = useCallback((nextNotes: PromptRunNote[]) => {
    notesRef.current = nextNotes;
    setNotes(nextNotes);
  }, []);

  useEffect(() => {
    if (repositoryProp) {
      return;
    }

    return subscribeToStorageKey(PROMPT_RUN_NOTE_STORAGE_KEY, () => {
      commitNotes(repository.loadAll());
    });
  }, [commitNotes, repository, repositoryProp]);

  const getNoteByRunId = useCallback(
    (runId: string) => getNoteForRun(notes, runId),
    [notes],
  );

  const saveNote = useCallback(
    (runId: string, body: string) => {
      const result = saveNoteForRun(
        repository,
        notesRef.current,
        runId,
        body,
      );
      commitNotes(result.notes);
      return result.note;
    },
    [commitNotes, repository],
  );

  const deleteNoteByRunId = useCallback(
    (runId: string) => {
      commitNotes(deleteNoteForRun(repository, notesRef.current, runId));
    },
    [commitNotes, repository],
  );

  const importNotes = useCallback(
    (importedNotes: PromptRunNote[]) => {
      commitNotes(
        importPromptRunNotes(repository, notesRef.current, importedNotes),
      );
    },
    [commitNotes, repository],
  );

  const replaceNotes = useCallback(
    (nextNotes: PromptRunNote[]) => {
      const notesToPersist = [...nextNotes];
      repository.saveAll(notesToPersist);
      commitNotes(notesToPersist);
    },
    [commitNotes, repository],
  );

  const value = useMemo<PromptRunNotesContextValue>(
    () => ({
      notes,
      getNoteByRunId,
      saveNote,
      deleteNoteByRunId,
      importNotes,
      replaceNotes,
    }),
    [
      notes,
      getNoteByRunId,
      saveNote,
      deleteNoteByRunId,
      importNotes,
      replaceNotes,
    ],
  );

  return (
    <PromptRunNotesContext.Provider value={value}>
      {children}
    </PromptRunNotesContext.Provider>
  );
}

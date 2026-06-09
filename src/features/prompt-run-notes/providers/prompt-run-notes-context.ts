import { createContext } from 'react';

import type { PromptRunNote } from '@/types/prompt-run-note';

export interface PromptRunNotesContextValue {
  notes: PromptRunNote[];
  getNoteByRunId: (runId: string) => PromptRunNote | undefined;
  saveNote: (runId: string, body: string) => PromptRunNote;
  deleteNoteByRunId: (runId: string) => void;
  importNotes: (importedNotes: PromptRunNote[]) => void;
}

export const PromptRunNotesContext =
  createContext<PromptRunNotesContextValue | null>(null);

import { useContext } from 'react';

import { PromptRunNotesContext } from '@/features/prompt-run-notes/providers/prompt-run-notes-context';

export function usePromptRunNotes() {
  const context = useContext(PromptRunNotesContext);

  if (!context) {
    throw new Error(
      'usePromptRunNotes must be used within a PromptRunNotesProvider.',
    );
  }

  return context;
}

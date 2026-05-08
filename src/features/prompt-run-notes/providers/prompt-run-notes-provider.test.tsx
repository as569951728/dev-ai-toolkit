import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { usePromptRunNotes } from '@/features/prompt-run-notes/hooks/use-prompt-run-notes';
import { PromptRunNotesProvider } from '@/features/prompt-run-notes/providers/prompt-run-notes-provider';
import type { PromptRunNoteRepository } from '@/features/prompt-run-notes/repositories/prompt-run-note-repository';
import type { PromptRunNote } from '@/types/prompt-run-note';

function createMemoryRepository(
  initialNotes: PromptRunNote[] = [],
): PromptRunNoteRepository & { snapshot: () => PromptRunNote[] } {
  let notes = [...initialNotes];

  return {
    loadAll: () => [...notes],
    saveAll: (nextNotes) => {
      notes = [...nextNotes];
    },
    snapshot: () => [...notes],
  };
}

function TestConsumer() {
  const { getNoteByRunId, saveNote } = usePromptRunNotes();
  const note = getNoteByRunId('run-1');

  return (
    <div>
      <span data-testid="note-body">{note?.body ?? 'missing'}</span>
      <button
        type="button"
        onClick={() => saveNote('run-1', 'Needs a clearer variable value.')}
      >
        Save note
      </button>
    </div>
  );
}

describe('PromptRunNotesProvider', () => {
  it('creates and updates notes through the injected repository', () => {
    const repository = createMemoryRepository();

    render(
      <PromptRunNotesProvider repository={repository}>
        <TestConsumer />
      </PromptRunNotesProvider>,
    );

    expect(screen.getByTestId('note-body')).toHaveTextContent('missing');

    fireEvent.click(screen.getByRole('button', { name: 'Save note' }));

    expect(screen.getByTestId('note-body')).toHaveTextContent(
      'Needs a clearer variable value.',
    );
    expect(repository.snapshot()).toHaveLength(1);
  });
});

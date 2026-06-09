import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';

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
  const { getNoteByRunId, importNotes, saveNote } = usePromptRunNotes();
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
      <button
        type="button"
        onClick={() =>
          importNotes([
            {
              id: 'imported-note',
              runId: 'run-1',
              body: 'Imported note body.',
              createdAt: '2026-05-08T09:00:00.000Z',
              updatedAt: '2026-05-08T09:00:00.000Z',
            },
          ])
        }
      >
        Import notes
      </button>
    </div>
  );
}

afterEach(() => {
  cleanup();
});

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

  it('imports prompt run notes through the injected repository', () => {
    const repository = createMemoryRepository();

    render(
      <PromptRunNotesProvider repository={repository}>
        <TestConsumer />
      </PromptRunNotesProvider>,
    );

    fireEvent.click(screen.getByRole('button', { name: 'Import notes' }));

    expect(screen.getByTestId('note-body')).toHaveTextContent(
      'Imported note body.',
    );
    expect(repository.snapshot()[0]).toMatchObject({
      id: 'imported-note',
      body: 'Imported note body.',
    });
  });
});

import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';

import { PromptRunNotePanel } from '@/features/prompt-run-notes/components/prompt-run-note-panel';
import { PromptRunNotesProvider } from '@/features/prompt-run-notes/providers/prompt-run-notes-provider';
import type { PromptRunNoteRepository } from '@/features/prompt-run-notes/repositories/prompt-run-note-repository';
import type { PromptRunNote } from '@/types/prompt-run-note';

function createNoteRepository(
  initialNotes: PromptRunNote[] = [],
): PromptRunNoteRepository {
  let notes = [...initialNotes];

  return {
    loadAll: () => [...notes],
    saveAll: (nextNotes) => {
      notes = [...nextNotes];
    },
  };
}

function renderNotePanel(runId: string, notes: PromptRunNote[]) {
  const repository = createNoteRepository(notes);
  const result = render(
    <PromptRunNotesProvider repository={repository}>
      <PromptRunNotePanel runId={runId} />
    </PromptRunNotesProvider>,
  );

  return {
    ...result,
    repository,
  };
}

afterEach(() => {
  cleanup();
});

describe('PromptRunNotePanel', () => {
  it('resets the editor when the active run changes', () => {
    const notes: PromptRunNote[] = [
      {
        id: 'note-1',
        runId: 'run-1',
        body: 'First run note',
        createdAt: '2026-05-08T09:00:00.000Z',
        updatedAt: '2026-05-08T09:00:00.000Z',
      },
      {
        id: 'note-2',
        runId: 'run-2',
        body: 'Second run note',
        createdAt: '2026-05-08T10:00:00.000Z',
        updatedAt: '2026-05-08T10:00:00.000Z',
      },
    ];
    const { rerender } = renderNotePanel('run-1', notes);

    expect(screen.getByLabelText('Note')).toHaveValue('First run note');

    rerender(
      <PromptRunNotesProvider repository={createNoteRepository(notes)}>
        <PromptRunNotePanel runId="run-2" />
      </PromptRunNotesProvider>,
    );

    expect(screen.getByLabelText('Note')).toHaveValue('Second run note');
  });

  it('clears an existing note when the editor is saved empty', () => {
    const { repository } = renderNotePanel('run-1', [
      {
        id: 'note-1',
        runId: 'run-1',
        body: 'Clear this note',
        createdAt: '2026-05-08T09:00:00.000Z',
        updatedAt: '2026-05-08T09:00:00.000Z',
      },
    ]);

    fireEvent.change(screen.getByLabelText('Note'), {
      target: { value: '   ' },
    });
    fireEvent.click(screen.getByRole('button', { name: 'Save note' }));

    expect(screen.getByText('Note cleared.')).toBeInTheDocument();
    expect(screen.getByRole('status')).toHaveTextContent('Note cleared.');
    expect(repository.loadAll()).toEqual([]);
  });
});

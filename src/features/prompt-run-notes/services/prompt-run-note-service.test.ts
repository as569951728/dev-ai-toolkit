import { describe, expect, it } from 'vitest';

import type { PromptRunNoteRepository } from '@/features/prompt-run-notes/repositories/prompt-run-note-repository';
import { deleteNoteForRun } from '@/features/prompt-run-notes/services/prompt-run-note-service';
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

describe('prompt-run-note-service', () => {
  it('deletes the note attached to a saved run', () => {
    const repository = createMemoryRepository([
      {
        id: 'note-1',
        runId: 'run-1',
        body: 'Remove me',
        createdAt: '2026-05-08T09:00:00.000Z',
        updatedAt: '2026-05-08T09:00:00.000Z',
      },
      {
        id: 'note-2',
        runId: 'run-2',
        body: 'Keep me',
        createdAt: '2026-05-08T10:00:00.000Z',
        updatedAt: '2026-05-08T10:00:00.000Z',
      },
    ]);

    const nextNotes = deleteNoteForRun(
      repository,
      repository.loadAll(),
      'run-1',
    );

    expect(nextNotes).toHaveLength(1);
    expect(nextNotes[0]?.runId).toBe('run-2');
    expect(repository.snapshot()).toEqual(nextNotes);
  });
});

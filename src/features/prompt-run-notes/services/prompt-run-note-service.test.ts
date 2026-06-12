import { describe, expect, it } from 'vitest';

import type { PromptRunNoteRepository } from '@/features/prompt-run-notes/repositories/prompt-run-note-repository';
import {
  deleteNoteForRun,
  importPromptRunNotes,
  saveNoteForRun,
} from '@/features/prompt-run-notes/services/prompt-run-note-service';
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
  it('removes an existing note when saving a blank body', () => {
    const repository = createMemoryRepository([
      {
        id: 'note-1',
        runId: 'run-1',
        body: 'Clear me',
        createdAt: '2026-05-08T09:00:00.000Z',
        updatedAt: '2026-05-08T09:00:00.000Z',
      },
    ]);

    const result = saveNoteForRun(
      repository,
      repository.loadAll(),
      'run-1',
      '   ',
    );

    expect(result.note).toBeNull();
    expect(result.notes).toEqual([]);
    expect(repository.snapshot()).toEqual([]);
  });

  it('does not create a new note for a blank body', () => {
    const repository = createMemoryRepository();

    const result = saveNoteForRun(
      repository,
      repository.loadAll(),
      'run-1',
      '',
    );

    expect(result.note).toBeNull();
    expect(result.notes).toEqual([]);
    expect(repository.snapshot()).toEqual([]);
  });

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

  it('imports prompt run notes while keeping one note per run', () => {
    const repository = createMemoryRepository([
      {
        id: 'note-1',
        runId: 'run-1',
        body: 'Current note',
        createdAt: '2026-05-08T09:00:00.000Z',
        updatedAt: '2026-05-08T09:00:00.000Z',
      },
    ]);

    const nextNotes = importPromptRunNotes(repository, repository.loadAll(), [
      {
        id: 'note-1',
        runId: 'run-1',
        body: 'Imported note',
        createdAt: '2026-05-08T09:00:00.000Z',
        updatedAt: '2026-05-09T09:00:00.000Z',
      },
      {
        id: 'note-2',
        runId: 'run-2',
        body: 'New note',
        createdAt: '2026-05-10T09:00:00.000Z',
        updatedAt: '2026-05-10T09:00:00.000Z',
      },
    ]);

    expect(nextNotes.map((note) => note.id)).toEqual(['note-1', 'note-2']);
    expect(nextNotes[0]?.body).toBe('Imported note');
    expect(repository.snapshot()).toEqual(nextNotes);
  });

  it('replaces the existing note for the same run when importing notes', () => {
    const repository = createMemoryRepository([
      {
        id: 'note-1',
        runId: 'run-1',
        body: 'Current note',
        createdAt: '2026-05-08T09:00:00.000Z',
        updatedAt: '2026-05-08T09:00:00.000Z',
      },
    ]);

    const nextNotes = importPromptRunNotes(repository, repository.loadAll(), [
      {
        id: 'imported-note',
        runId: 'run-1',
        body: 'Imported note for the same run',
        createdAt: '2026-05-09T09:00:00.000Z',
        updatedAt: '2026-05-09T09:00:00.000Z',
      },
    ]);

    expect(nextNotes).toHaveLength(1);
    expect(nextNotes[0]).toMatchObject({
      id: 'imported-note',
      runId: 'run-1',
      body: 'Imported note for the same run',
    });
    expect(repository.snapshot()).toEqual(nextNotes);
  });
});

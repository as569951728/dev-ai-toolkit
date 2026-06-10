import { describe, expect, it } from 'vitest';

import { createLocalStoragePromptRunNoteRepository } from '@/features/prompt-run-notes/repositories/local-storage-prompt-run-note-repository';
import type { PromptRunNote } from '@/types/prompt-run-note';

function createMemoryStorage(initialState: Record<string, string> = {}) {
  const state = new Map(Object.entries(initialState));

  return {
    getItem(key: string) {
      return state.get(key) ?? null;
    },
    setItem(key: string, value: string) {
      state.set(key, value);
    },
  };
}

const sampleNotes: PromptRunNote[] = [
  {
    id: 'note-1',
    runId: 'run-1',
    body: 'Good output for API review.',
    createdAt: '2026-05-08T02:00:00.000Z',
    updatedAt: '2026-05-08T02:00:00.000Z',
  },
];

describe('local-storage-prompt-run-note-repository', () => {
  it('reads legacy array payloads and versioned payloads', () => {
    const legacyStorage = createMemoryStorage({
      legacy: JSON.stringify(sampleNotes),
    });
    const versionedStorage = createMemoryStorage({
      versioned: JSON.stringify({
        version: 1,
        data: sampleNotes,
      }),
    });

    expect(
      createLocalStoragePromptRunNoteRepository(
        'legacy',
        legacyStorage,
      ).loadAll(),
    ).toEqual(sampleNotes);
    expect(
      createLocalStoragePromptRunNoteRepository(
        'versioned',
        versionedStorage,
      ).loadAll(),
    ).toEqual(sampleNotes);
  });

  it('writes notes using the versioned payload shape', () => {
    const storage = createMemoryStorage();
    const repository = createLocalStoragePromptRunNoteRepository('notes', storage);

    repository.saveAll(sampleNotes);

    expect(JSON.parse(storage.getItem('notes') ?? 'null')).toEqual({
      version: 1,
      data: sampleNotes,
    });
  });

  it('ignores malformed note records from stored payloads', () => {
    const storage = createMemoryStorage({
      notes: JSON.stringify({
        version: 1,
        data: [
          sampleNotes[0],
          {
            id: '',
            runId: 'run-1',
            body: 'Missing note id',
            createdAt: '2026-05-08T02:00:00.000Z',
            updatedAt: '2026-05-08T02:00:00.000Z',
          },
          {
            id: 'note-missing-run',
            runId: '',
            body: 'Missing run id',
            createdAt: '2026-05-08T02:00:00.000Z',
            updatedAt: '2026-05-08T02:00:00.000Z',
          },
          {
            id: 'note-empty-body',
            runId: 'run-1',
            body: '   ',
            createdAt: '2026-05-08T02:00:00.000Z',
            updatedAt: '2026-05-08T02:00:00.000Z',
          },
          {
            id: 'note-invalid-date',
            runId: 'run-1',
            body: 'Invalid date',
            createdAt: 'not-a-date',
            updatedAt: '2026-05-08T02:00:00.000Z',
          },
        ],
      }),
    });
    const repository = createLocalStoragePromptRunNoteRepository(
      'notes',
      storage,
    );

    expect(repository.loadAll()).toEqual(sampleNotes);
  });
});

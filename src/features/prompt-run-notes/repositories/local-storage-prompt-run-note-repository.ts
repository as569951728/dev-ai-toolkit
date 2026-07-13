import {
  readVersionedCollection,
  writeVersionedCollection,
} from '@/lib/local-storage-schema';
import { keepLastByKey } from '@/lib/collection-utils';
import { isPromptRunNote } from '@/features/prompt-run-notes/lib/prompt-run-note-schema';
import type { PromptRunNoteRepository } from '@/features/prompt-run-notes/repositories/prompt-run-note-repository';

const STORAGE_KEY = 'dev-ai-toolkit.prompt-run-notes';

type StorageLike = Pick<Storage, 'getItem' | 'setItem'>;

function normalizeNotes(value: unknown) {
  const notes =
    readVersionedCollection<unknown>(value)
      ?.filter(isPromptRunNote) ?? [];

  return keepLastByKey(notes, (note) => note.runId);
}

export function createLocalStoragePromptRunNoteRepository(
  storageKey = STORAGE_KEY,
  storage: StorageLike | null =
    typeof window !== 'undefined' ? window.localStorage : null,
): PromptRunNoteRepository {
  return {
    loadAll() {
      if (!storage) {
        return [];
      }

      try {
        const storedValue = storage.getItem(storageKey);

        if (!storedValue) {
          return [];
        }

        return normalizeNotes(JSON.parse(storedValue));
      } catch {
        return [];
      }
    },
    saveAll(notes) {
      if (!storage) {
        return;
      }

      storage.setItem(storageKey, JSON.stringify(writeVersionedCollection(notes)));
    },
  };
}

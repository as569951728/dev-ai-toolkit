import {
  readVersionedCollection,
  writeVersionedCollection,
} from '@/lib/local-storage-schema';
import type { PromptRunNoteRepository } from '@/features/prompt-run-notes/repositories/prompt-run-note-repository';
import type { PromptRunNote } from '@/types/prompt-run-note';

const STORAGE_KEY = 'dev-ai-toolkit.prompt-run-notes';

type StorageLike = Pick<Storage, 'getItem' | 'setItem'>;

function normalizeNotes(value: unknown) {
  return readVersionedCollection<PromptRunNote>(value) ?? [];
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

      const storedValue = storage.getItem(storageKey);

      if (!storedValue) {
        return [];
      }

      try {
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

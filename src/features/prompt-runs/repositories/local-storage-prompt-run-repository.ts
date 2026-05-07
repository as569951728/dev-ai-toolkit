import type { PromptRunRepository } from '@/features/prompt-runs/repositories/prompt-run-repository';
import type { PromptRunRecord } from '@/types/prompt-run';
import {
  readVersionedCollection,
  writeVersionedCollection,
} from '@/lib/local-storage-schema';

const STORAGE_KEY = 'dev-ai-toolkit.prompt-runs';

type StorageLike = Pick<Storage, 'getItem' | 'setItem'>;

function normalizeRuns(value: unknown) {
  return readVersionedCollection<PromptRunRecord>(value) ?? [];
}

export function createLocalStoragePromptRunRepository(
  storageKey = STORAGE_KEY,
  storage: StorageLike | null =
    typeof window !== 'undefined' ? window.localStorage : null,
): PromptRunRepository {
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
        return normalizeRuns(JSON.parse(storedValue));
      } catch {
        return [];
      }
    },
    saveAll(runs) {
      if (!storage) {
        return;
      }

      storage.setItem(storageKey, JSON.stringify(writeVersionedCollection(runs)));
    },
  };
}

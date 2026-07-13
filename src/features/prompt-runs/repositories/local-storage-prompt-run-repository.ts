import type { PromptRunRepository } from '@/features/prompt-runs/repositories/prompt-run-repository';
import { isPromptRunRecord } from '@/features/prompt-runs/lib/prompt-run-schema';
import {
  readVersionedCollection,
  writeVersionedCollection,
} from '@/lib/local-storage-schema';
import { keepLastByKey } from '@/lib/collection-utils';

const STORAGE_KEY = 'dev-ai-toolkit.prompt-runs';

type StorageLike = Pick<Storage, 'getItem' | 'setItem'>;

function normalizeRuns(value: unknown) {
  const runs =
    readVersionedCollection<unknown>(value)
      ?.filter(isPromptRunRecord) ?? [];

  return keepLastByKey(runs, (run) => run.id);
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

      try {
        const storedValue = storage.getItem(storageKey);

        if (!storedValue) {
          return [];
        }

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

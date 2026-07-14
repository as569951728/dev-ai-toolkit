import type { PromptRunRepository } from '@/features/prompt-runs/repositories/prompt-run-repository';
import { isPromptRunRecord } from '@/features/prompt-runs/lib/prompt-run-schema';
import {
  resolveBrowserStorage,
  type StorageLike,
} from '@/lib/browser-storage';
import {
  readVersionedCollection,
  writeVersionedCollection,
} from '@/lib/local-storage-schema';
import { keepLastByKey } from '@/lib/collection-utils';

export const PROMPT_RUN_STORAGE_KEY = 'dev-ai-toolkit.prompt-runs';

function normalizeRuns(value: unknown) {
  const runs =
    readVersionedCollection<unknown>(value)
      ?.filter(isPromptRunRecord)
      .map((run) => ({
        ...run,
        id: run.id.trim(),
        templateId: run.templateId.trim(),
        templateName: run.templateName.trim(),
      })) ?? [];

  return keepLastByKey(runs, (run) => run.id);
}

export function createLocalStoragePromptRunRepository(
  storageKey = PROMPT_RUN_STORAGE_KEY,
  storage: StorageLike | null = resolveBrowserStorage(),
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

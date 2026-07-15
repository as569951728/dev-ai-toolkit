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
import {
  assertLocalStorageKeyWritable,
  clearLocalStorageReadIssue,
  decodeLocalStorageValue,
  type LocalStorageDecodeResult,
} from '@/lib/local-storage-recovery';
import type { PromptRunRecord } from '@/types/prompt-run';

export const PROMPT_RUN_STORAGE_KEY = 'dev-ai-toolkit.prompt-runs';

function normalizeRuns(
  value: unknown,
): LocalStorageDecodeResult<PromptRunRecord[]> | null {
  const storedRuns = readVersionedCollection<unknown>(value);

  if (!storedRuns) {
    return null;
  }

  const runs = storedRuns.filter(isPromptRunRecord).map((run) => ({
    ...run,
    id: run.id.trim(),
    templateId: run.templateId.trim(),
    templateName: run.templateName.trim(),
  }));

  return {
    recovered: runs.length !== storedRuns.length,
    value: keepLastByKey(runs, (run) => run.id),
  };
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

      let storedValue: string | null;

      try {
        storedValue = storage.getItem(storageKey);
      } catch {
        return [];
      }

      if (storedValue === null) {
        clearLocalStorageReadIssue(storageKey);
        return [];
      }

      return (
        decodeLocalStorageValue({
          decode: normalizeRuns,
          label: 'Prompt runs',
          rawValue: storedValue,
          storageKey,
        }) ?? []
      );
    },
    saveAll(runs) {
      if (!storage) {
        return;
      }

      assertLocalStorageKeyWritable(storageKey);
      storage.setItem(
        storageKey,
        JSON.stringify(writeVersionedCollection(runs)),
      );
    },
  };
}

import type { PromptRunRepository } from '@/features/prompt-runs/repositories/prompt-run-repository';
import type { PromptRunRecord } from '@/types/prompt-run';

const STORAGE_KEY = 'dev-ai-toolkit.prompt-runs';

function normalizeRuns(value: unknown) {
  return Array.isArray(value) ? (value as PromptRunRecord[]) : [];
}

export function createLocalStoragePromptRunRepository(
  storageKey = STORAGE_KEY,
  storage = typeof window !== 'undefined' ? window.localStorage : null,
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

      storage.setItem(storageKey, JSON.stringify(runs));
    },
  };
}

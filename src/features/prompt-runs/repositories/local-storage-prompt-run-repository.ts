import type { PromptRunRepository } from '@/features/prompt-runs/repositories/prompt-run-repository';
import type { PromptRunRecord } from '@/types/prompt-run';
import {
  readVersionedCollection,
  writeVersionedCollection,
} from '@/lib/local-storage-schema';

const STORAGE_KEY = 'dev-ai-toolkit.prompt-runs';

type StorageLike = Pick<Storage, 'getItem' | 'setItem'>;

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

function isNonEmptyString(value: unknown): value is string {
  return typeof value === 'string' && value.trim().length > 0;
}

function isValidDateString(value: unknown): value is string {
  return typeof value === 'string' && !Number.isNaN(new Date(value).getTime());
}

function isVariablesRecord(value: unknown): value is Record<string, string> {
  return (
    isRecord(value) &&
    Object.values(value).every((variableValue) => typeof variableValue === 'string')
  );
}

function normalizePromptRunRecord(value: unknown): PromptRunRecord | null {
  if (!isRecord(value)) {
    return null;
  }

  if (
    !isNonEmptyString(value.id) ||
    !isNonEmptyString(value.templateId) ||
    !isNonEmptyString(value.templateName) ||
    typeof value.templateVersion !== 'number' ||
    !Number.isInteger(value.templateVersion) ||
    value.templateVersion < 1 ||
    !isVariablesRecord(value.variables) ||
    !isNonEmptyString(value.systemPrompt) ||
    !isNonEmptyString(value.userPrompt) ||
    !isValidDateString(value.createdAt)
  ) {
    return null;
  }

  return {
    id: value.id,
    templateId: value.templateId,
    templateName: value.templateName,
    templateVersion: value.templateVersion,
    variables: value.variables,
    systemPrompt: value.systemPrompt,
    userPrompt: value.userPrompt,
    createdAt: value.createdAt,
  };
}

function normalizeRuns(value: unknown) {
  return (
    readVersionedCollection<unknown>(value)
      ?.map((run) => normalizePromptRunRecord(run))
      .filter((run): run is PromptRunRecord => run !== null) ?? []
  );
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

import {
  readVersionedCollection,
  writeVersionedCollection,
} from '@/lib/local-storage-schema';
import { keepLastByKey } from '@/lib/collection-utils';
import type { PromptRunNoteRepository } from '@/features/prompt-run-notes/repositories/prompt-run-note-repository';
import type { PromptRunNote } from '@/types/prompt-run-note';

const STORAGE_KEY = 'dev-ai-toolkit.prompt-run-notes';

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

function normalizePromptRunNote(value: unknown): PromptRunNote | null {
  if (!isRecord(value)) {
    return null;
  }

  if (
    !isNonEmptyString(value.id) ||
    !isNonEmptyString(value.runId) ||
    !isNonEmptyString(value.body) ||
    !isValidDateString(value.createdAt) ||
    !isValidDateString(value.updatedAt)
  ) {
    return null;
  }

  return {
    id: value.id,
    runId: value.runId,
    body: value.body,
    createdAt: value.createdAt,
    updatedAt: value.updatedAt,
  };
}

function normalizeNotes(value: unknown) {
  const notes =
    readVersionedCollection<unknown>(value)
      ?.map((note) => normalizePromptRunNote(note))
      .filter((note): note is PromptRunNote => note !== null) ?? [];

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

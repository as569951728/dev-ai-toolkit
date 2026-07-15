import {
  readVersionedCollection,
  writeVersionedCollection,
} from '@/lib/local-storage-schema';
import { keepLastByKey } from '@/lib/collection-utils';
import { isPromptRunNote } from '@/features/prompt-run-notes/lib/prompt-run-note-schema';
import type { PromptRunNoteRepository } from '@/features/prompt-run-notes/repositories/prompt-run-note-repository';
import {
  resolveBrowserStorage,
  type StorageLike,
} from '@/lib/browser-storage';
import {
  assertLocalStorageKeyWritable,
  clearLocalStorageReadIssue,
  decodeLocalStorageValue,
  type LocalStorageDecodeResult,
} from '@/lib/local-storage-recovery';
import type { PromptRunNote } from '@/types/prompt-run-note';

export const PROMPT_RUN_NOTE_STORAGE_KEY =
  'dev-ai-toolkit.prompt-run-notes';

function normalizeNotes(
  value: unknown,
): LocalStorageDecodeResult<PromptRunNote[]> | null {
  const storedNotes = readVersionedCollection<unknown>(value);

  if (!storedNotes) {
    return null;
  }

  const notes = storedNotes.filter(isPromptRunNote).map((note) => ({
    ...note,
    id: note.id.trim(),
    runId: note.runId.trim(),
  }));

  return {
    recovered: notes.length !== storedNotes.length,
    value: keepLastByKey(notes, (note) => note.runId),
  };
}

export function createLocalStoragePromptRunNoteRepository(
  storageKey = PROMPT_RUN_NOTE_STORAGE_KEY,
  storage: StorageLike | null = resolveBrowserStorage(),
): PromptRunNoteRepository {
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
          decode: normalizeNotes,
          label: 'Run notes',
          rawValue: storedValue,
          storageKey,
        }) ?? []
      );
    },
    saveAll(notes) {
      if (!storage) {
        return;
      }

      assertLocalStorageKeyWritable(storageKey);
      storage.setItem(
        storageKey,
        JSON.stringify(writeVersionedCollection(notes)),
      );
    },
  };
}

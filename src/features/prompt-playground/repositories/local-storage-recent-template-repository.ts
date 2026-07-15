import {
  readVersionedCollection,
  writeVersionedCollection,
} from '@/lib/local-storage-schema';
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

export const RECENT_TEMPLATE_STORAGE_KEY =
  'dev-ai-toolkit.playground-recent-template-ids';

function normalizeRecentTemplateIds(
  value: unknown,
): LocalStorageDecodeResult<string[]> | null {
  const templateIds = readVersionedCollection<string>(value);

  if (!templateIds) {
    return null;
  }

  const validTemplateIds = templateIds
    .map((templateId) =>
      typeof templateId === 'string' ? templateId.trim() : '',
    )
    .filter(Boolean);

  return {
    recovered: validTemplateIds.length !== templateIds.length,
    value: [...new Set(validTemplateIds)],
  };
}

export function loadRecentTemplateIds(
  storageKey = RECENT_TEMPLATE_STORAGE_KEY,
  storage: StorageLike | null = resolveBrowserStorage(),
) {
  if (!storage) {
    return [] as string[];
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
      decode: normalizeRecentTemplateIds,
      label: 'Recent template shortcuts',
      rawValue: storedValue,
      storageKey,
    }) ?? []
  );
}

export function saveRecentTemplateIds(
  templateIds: string[],
  storageKey = RECENT_TEMPLATE_STORAGE_KEY,
  storage: StorageLike | null = resolveBrowserStorage(),
) {
  if (!storage) {
    return;
  }

  assertLocalStorageKeyWritable(storageKey);
  const normalizedTemplateIds = normalizeRecentTemplateIds(templateIds);

  storage.setItem(
    storageKey,
    JSON.stringify(
      writeVersionedCollection(normalizedTemplateIds?.value ?? []),
    ),
  );
}

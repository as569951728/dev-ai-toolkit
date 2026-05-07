import {
  readVersionedCollection,
  writeVersionedCollection,
} from '@/lib/local-storage-schema';

const STORAGE_KEY = 'dev-ai-toolkit.playground-recent-template-ids';

type StorageLike = Pick<Storage, 'getItem' | 'setItem'>;

function normalizeRecentTemplateIds(value: unknown) {
  const templateIds = readVersionedCollection<string>(value);

  return templateIds
    ? templateIds.filter((templateId) => typeof templateId === 'string')
    : [];
}

export function loadRecentTemplateIds(
  storageKey = STORAGE_KEY,
  storage: StorageLike | null =
    typeof window !== 'undefined' ? window.localStorage : null,
) {
  if (!storage) {
    return [] as string[];
  }

  try {
    const storedValue = storage.getItem(storageKey);

    if (!storedValue) {
      return [];
    }

    return normalizeRecentTemplateIds(JSON.parse(storedValue));
  } catch {
    return [];
  }
}

export function saveRecentTemplateIds(
  templateIds: string[],
  storageKey = STORAGE_KEY,
  storage: StorageLike | null =
    typeof window !== 'undefined' ? window.localStorage : null,
) {
  if (!storage) {
    return;
  }

  storage.setItem(
    storageKey,
    JSON.stringify(writeVersionedCollection(templateIds)),
  );
}

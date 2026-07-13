export type StorageLike = Pick<Storage, 'getItem' | 'setItem'>;

type StorageProbeLike = StorageLike & Partial<Pick<Storage, 'removeItem'>>;

type BrowserStorageHost = {
  readonly localStorage: StorageLike;
};

const unavailableBrowserStorage: StorageLike = {
  getItem() {
    throw new Error('Browser storage is unavailable.');
  },
  setItem() {
    throw new Error('Browser storage is unavailable.');
  },
};

export function resolveBrowserStorage(
  host: BrowserStorageHost | null =
    typeof window !== 'undefined' ? window : null,
): StorageLike | null {
  if (!host) {
    return null;
  }

  try {
    return host.localStorage;
  } catch {
    return unavailableBrowserStorage;
  }
}

export function canUseBrowserStorage(
  storage: StorageProbeLike | null = resolveBrowserStorage(),
) {
  if (!storage) {
    return false;
  }

  try {
    const storageKey = 'dev-ai-toolkit.storage-health-check';
    const previousValue = storage.getItem(storageKey);

    storage.setItem(storageKey, previousValue ?? 'available');

    if (previousValue === null) {
      storage.removeItem?.(storageKey);
    }

    return true;
  } catch {
    return false;
  }
}

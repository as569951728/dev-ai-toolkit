export type StorageLike = Pick<Storage, 'getItem' | 'setItem'>;

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

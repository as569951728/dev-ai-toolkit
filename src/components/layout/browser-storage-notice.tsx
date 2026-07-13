import {
  canUseBrowserStorage,
  type StorageLike,
} from '@/lib/browser-storage';

interface BrowserStorageNoticeProps {
  storage?: StorageLike | null;
}

export function BrowserStorageNotice({
  storage,
}: BrowserStorageNoticeProps) {
  const canUseStorage =
    storage === undefined
      ? canUseBrowserStorage()
      : canUseBrowserStorage(storage);

  if (canUseStorage) {
    return null;
  }

  return (
    <p className="status-banner status-banner--error" role="alert">
      Browser storage is unavailable. Templates, prompt snapshots, and notes
      cannot be saved in this browser context.
    </p>
  );
}

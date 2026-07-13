import {
  canReadBrowserStorage,
  type StorageLike,
} from '@/lib/browser-storage';

interface BrowserStorageNoticeProps {
  storage?: StorageLike | null;
}

export function BrowserStorageNotice({
  storage,
}: BrowserStorageNoticeProps) {
  const canReadStorage =
    storage === undefined
      ? canReadBrowserStorage()
      : canReadBrowserStorage(storage);

  if (canReadStorage) {
    return null;
  }

  return (
    <p className="status-banner status-banner--error" role="alert">
      Browser storage is unavailable. Templates, prompt snapshots, and notes
      cannot be saved in this browser context.
    </p>
  );
}

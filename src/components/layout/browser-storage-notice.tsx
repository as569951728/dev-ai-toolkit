import { useState, useSyncExternalStore } from 'react';

import {
  canUseBrowserStorage,
  resolveBrowserStorage,
  type StorageLike,
} from '@/lib/browser-storage';
import {
  downloadLocalStorageRecovery,
  getLocalStorageReadIssues,
  resetLocalStorageReadIssues,
  subscribeToLocalStorageReadIssues,
} from '@/lib/local-storage-recovery';

interface BrowserStorageNoticeProps {
  reloadPage?: () => void;
  storage?: StorageLike | null;
}

export function BrowserStorageNotice({
  reloadPage = () => window.location.reload(),
  storage,
}: BrowserStorageNoticeProps) {
  const issues = useSyncExternalStore(
    subscribeToLocalStorageReadIssues,
    getLocalStorageReadIssues,
    getLocalStorageReadIssues,
  );
  const [isResetConfirmationOpen, setIsResetConfirmationOpen] =
    useState(false);
  const [actionError, setActionError] = useState('');
  const activeStorage =
    storage === undefined ? resolveBrowserStorage() : storage;
  const canUseStorage =
    storage === undefined
      ? canUseBrowserStorage(activeStorage)
      : canUseBrowserStorage(storage);

  if (canUseStorage) {
    if (issues.length === 0) {
      return null;
    }

    const handleDownload = () => {
      try {
        downloadLocalStorageRecovery(issues);
        setActionError('');
      } catch {
        setActionError(
          'The unreadable browser data could not be downloaded. It has not been removed.',
        );
      }
    };

    const handleReset = () => {
      try {
        resetLocalStorageReadIssues(issues, activeStorage);
        setActionError('');
        reloadPage();
      } catch {
        setActionError(
          'The unreadable browser data could not be fully reset. It remains available for download in this session.',
        );
        setIsResetConfirmationOpen(false);
      }
    };

    return (
      <section
        aria-labelledby="local-storage-recovery-title"
        className="status-banner status-banner--error"
        role="alert"
      >
        <div>
          <strong id="local-storage-recovery-title">
            Some local workspace data could not be read.
          </strong>
          <p>
            The original browser values are unchanged, and writes to the
            affected data are blocked. Download them before resetting if you
            may need to inspect or repair them later.
          </p>
          <ul>
            {issues.map((issue) => (
              <li key={issue.storageKey}>{issue.label}</li>
            ))}
          </ul>
        </div>

        <div className="detail-actions detail-actions--inline">
          <button
            className="secondary-button"
            type="button"
            onClick={handleDownload}
          >
            Download unreadable data
          </button>
          <button
            className="danger-button"
            type="button"
            onClick={() => setIsResetConfirmationOpen(true)}
          >
            Reset affected data
          </button>
        </div>

        {actionError ? <p>{actionError}</p> : null}

        {isResetConfirmationOpen ? (
          <div
            aria-describedby="local-storage-reset-description"
            aria-labelledby="local-storage-reset-title"
            className="empty-state empty-state--compact"
            role="dialog"
          >
            <h2 id="local-storage-reset-title">
              Reset unreadable local data?
            </h2>
            <p id="local-storage-reset-description">
              This permanently removes only the affected browser values and
              reloads the app. Download them first if you may need the original
              content.
            </p>
            <div className="detail-actions detail-actions--inline">
              <button
                autoFocus
                className="secondary-button"
                type="button"
                onClick={() => setIsResetConfirmationOpen(false)}
              >
                Keep current data
              </button>
              <button
                className="danger-button"
                type="button"
                onClick={handleReset}
              >
                Reset and reload
              </button>
            </div>
          </div>
        ) : null}
      </section>
    );
  }

  return (
    <p className="status-banner status-banner--error" role="alert">
      Browser storage is unavailable. Templates, prompt snapshots, and notes
      cannot be saved in this browser context.
    </p>
  );
}

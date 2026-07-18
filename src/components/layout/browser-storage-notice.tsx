import { useState, useSyncExternalStore } from 'react';

import { useLocalization } from '@/features/localization/localization-context';
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
  const { t } = useLocalization();
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
          t('storage.recovery.downloadError'),
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
          t('storage.recovery.resetError'),
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
            {t('storage.recovery.title')}
          </strong>
          <p>{t('storage.recovery.description')}</p>
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
            {t('storage.recovery.download')}
          </button>
          <button
            className="danger-button"
            type="button"
            onClick={() => setIsResetConfirmationOpen(true)}
          >
            {t('storage.recovery.reset')}
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
              {t('storage.recovery.dialogTitle')}
            </h2>
            <p id="local-storage-reset-description">
              {t('storage.recovery.dialogDescription')}
            </p>
            <div className="detail-actions detail-actions--inline">
              <button
                autoFocus
                className="secondary-button"
                type="button"
                onClick={() => setIsResetConfirmationOpen(false)}
              >
                {t('storage.recovery.keep')}
              </button>
              <button
                className="danger-button"
                type="button"
                onClick={handleReset}
              >
                {t('storage.recovery.confirm')}
              </button>
            </div>
          </div>
        ) : null}
      </section>
    );
  }

  return (
    <p className="status-banner status-banner--error" role="alert">
      {t('storage.unavailable')}
    </p>
  );
}

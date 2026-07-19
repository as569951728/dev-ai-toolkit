import { useState } from 'react';

import { useLocalization } from '@/features/localization/localization-context';
export interface PromptRunActionFeedback {
  message: string;
  tone: 'success' | 'error';
}

interface PromptRunSnapshotManagementProps {
  deleteErrorMessage: string;
  exportFeedback: PromptRunActionFeedback | null;
  isNoteDirty: boolean;
  onCancelDelete: () => void;
  onConfirmDelete: () => void;
  onExport: () => void;
}

export function PromptRunSnapshotManagement({
  deleteErrorMessage,
  exportFeedback,
  isNoteDirty,
  onCancelDelete,
  onConfirmDelete,
  onExport,
}: PromptRunSnapshotManagementProps) {
  const { t } = useLocalization();
  const [isConfirmingDelete, setIsConfirmingDelete] = useState(false);

  const handleCancelDelete = () => {
    setIsConfirmingDelete(false);
    onCancelDelete();
  };

  return (
    <section className="panel">
      <div className="panel__header">
        <div>
          <p className="eyebrow">{t('run.snapshot.eyebrow')}</p>
          <h2>{t('run.snapshot.title')}</h2>
          <p className="panel__summary">{t('run.snapshot.summary')}</p>
        </div>
      </div>

      {exportFeedback ? (
        <p
          className={`status-banner${
            exportFeedback.tone === 'error' ? ' status-banner--error' : ''
          }`}
          role={exportFeedback.tone === 'error' ? 'alert' : 'status'}
        >
          {exportFeedback.message}
        </p>
      ) : null}

      {deleteErrorMessage ? (
        <p className="status-banner status-banner--error" role="alert">
          {deleteErrorMessage}
        </p>
      ) : null}

      {isConfirmingDelete && isNoteDirty ? (
        <p className="status-banner" role="status">
          {t('run.snapshot.unsavedNote')}
        </p>
      ) : null}

      <div className="detail-actions detail-actions--inline">
        <button className="ghost-button" type="button" onClick={onExport}>
          {t('run.snapshot.export')}
        </button>
        {isConfirmingDelete ? (
          <>
            <button
              className="danger-button"
              type="button"
              onClick={onConfirmDelete}
            >
              {t('run.snapshot.confirmDelete')}
            </button>
            <button
              autoFocus
              className="ghost-button"
              type="button"
              onClick={handleCancelDelete}
            >
              {t('run.snapshot.cancel')}
            </button>
          </>
        ) : (
          <button
            className="danger-button"
            type="button"
            onClick={() => setIsConfirmingDelete(true)}
          >
            {t('run.snapshot.delete')}
          </button>
        )}
      </div>
    </section>
  );
}

import { useState } from 'react';

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
  const [isConfirmingDelete, setIsConfirmingDelete] = useState(false);

  const handleCancelDelete = () => {
    setIsConfirmingDelete(false);
    onCancelDelete();
  };

  return (
    <section className="panel">
      <div className="panel__header">
        <div>
          <p className="eyebrow">Local snapshot</p>
          <h2>Snapshot management</h2>
          <p className="panel__summary">
            Export a portable JSON copy or remove this snapshot and its note
            from the current browser.
          </p>
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
          The unsaved note draft will also be discarded.
        </p>
      ) : null}

      <div className="detail-actions detail-actions--inline">
        <button className="ghost-button" type="button" onClick={onExport}>
          Export run JSON
        </button>
        {isConfirmingDelete ? (
          <>
            <button
              className="danger-button"
              type="button"
              onClick={onConfirmDelete}
            >
              Confirm delete
            </button>
            <button
              autoFocus
              className="ghost-button"
              type="button"
              onClick={handleCancelDelete}
            >
              Cancel
            </button>
          </>
        ) : (
          <button
            className="danger-button"
            type="button"
            onClick={() => setIsConfirmingDelete(true)}
          >
            Delete run
          </button>
        )}
      </div>
    </section>
  );
}

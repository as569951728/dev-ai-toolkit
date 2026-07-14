import { useState } from 'react';

import type {
  PromptTemplate,
  PromptTemplateRevision,
} from '@/types/prompt-template';
import type { PromptRunRecord } from '@/types/prompt-run';
import { formatCapturedVariableCount } from '@/features/prompt-runs/lib/prompt-run-display';

interface PromptTemplateDetailProps {
  actionErrorMessage: string | null;
  template: PromptTemplate;
  onBack: () => void;
  onEdit: (id: string) => void;
  onDuplicate: (id: string) => void;
  onArchive: (id: string) => void;
  onRestoreArchive: (id: string) => void;
  onDelete: (id: string) => void;
  onOpenInPlayground: (id: string) => void;
  onOpenRunHistory: (id: string) => void;
  onOpenRunDetail: (id: string) => void;
  onCompareRevision: (revision: PromptTemplateRevision) => void;
  onRestoreRevision: (
    templateId: string,
    revisionVersion: PromptTemplateRevision['version'],
  ) => boolean;
  recentRuns: PromptRunRecord[];
}

function formatUpdatedAt(updatedAt: string) {
  return new Intl.DateTimeFormat('en', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  }).format(new Date(updatedAt));
}

export function PromptTemplateDetail({
  actionErrorMessage,
  template,
  onBack,
  onEdit,
  onDuplicate,
  onArchive,
  onRestoreArchive,
  onDelete,
  onOpenInPlayground,
  onOpenRunHistory,
  onOpenRunDetail,
  onCompareRevision,
  onRestoreRevision,
  recentRuns,
}: PromptTemplateDetailProps) {
  const [isConfirmingDelete, setIsConfirmingDelete] = useState(false);
  const [pendingRestoreVersion, setPendingRestoreVersion] = useState<
    PromptTemplateRevision['version'] | null
  >(null);
  const revisionHistory = [...template.revisions].sort(
    (left, right) => right.version - left.version,
  );

  return (
    <section className="panel">
      <div className="panel__header">
        <div>
          <p className="eyebrow">Prompt Template</p>
          <h1>{template.name}</h1>
          <p className="panel__summary">{template.description}</p>
        </div>

        <div className="detail-actions">
          <button className="ghost-button" type="button" onClick={onBack}>
            Back to list
          </button>
          {!template.archivedAt ? (
            <button
              className="secondary-button"
              type="button"
              onClick={() => onOpenInPlayground(template.id)}
            >
              Open in Playground
            </button>
          ) : null}
          <button
            className="secondary-button"
            type="button"
            onClick={() => onOpenRunHistory(template.id)}
          >
            View run history
          </button>
          <button
            className="secondary-button"
            type="button"
            onClick={() => onEdit(template.id)}
          >
            Edit
          </button>
          <button
            className="secondary-button"
            type="button"
            onClick={() => onDuplicate(template.id)}
          >
            Duplicate
          </button>
          {template.archivedAt ? (
            <button
              className="secondary-button"
              type="button"
              onClick={() => onRestoreArchive(template.id)}
            >
              Restore
            </button>
          ) : (
            <button
              className="secondary-button"
              type="button"
              onClick={() => onArchive(template.id)}
            >
              Archive
            </button>
          )}
          {isConfirmingDelete ? (
            <>
              <span className="run-history-note">
                Deleting this template will not remove its saved run snapshots
                from Run History.
              </span>
              <button
                className="danger-button"
                type="button"
                onClick={() => onDelete(template.id)}
              >
                Confirm delete
              </button>
              <button
                autoFocus
                className="ghost-button"
                type="button"
                onClick={() => setIsConfirmingDelete(false)}
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
              Delete
            </button>
          )}
        </div>
      </div>

      {actionErrorMessage ? (
        <p className="status-banner status-banner--error" role="alert">
          {actionErrorMessage}
        </p>
      ) : null}

      <div className="detail-grid">
        <article className="detail-card">
          <div className="detail-card__header">
            <h2>Template metadata</h2>
            <span>Updated {formatUpdatedAt(template.updatedAt)}</span>
          </div>

          <p className="detail-card__version">Current version v{template.version}</p>
          {template.archivedAt ? (
            <p className="detail-card__version">
              Archived {formatUpdatedAt(template.archivedAt)}
            </p>
          ) : null}

          <div className="tag-list" aria-label="Prompt tags">
            {template.tags.map((tag) => (
              <span className="tag" key={tag}>
                {tag}
              </span>
            ))}
          </div>
        </article>

        <article className="detail-card">
          <div className="detail-card__header">
            <h2>System prompt</h2>
          </div>
          <pre className="prompt-preview">{template.systemPrompt}</pre>
        </article>

        <article className="detail-card detail-card--full">
          <div className="detail-card__header">
            <h2>User prompt</h2>
          </div>
          <pre className="prompt-preview">{template.userPrompt}</pre>
        </article>

        <article className="detail-card detail-card--full">
          <div className="detail-card__header">
            <h2>Version history</h2>
            <span>{revisionHistory.length} stored revisions</span>
          </div>

          <div className="revision-list">
            {revisionHistory.map((revision) => {
              const isCurrent = revision.version === template.version;
              const isConfirmingRestore =
                revision.version === pendingRestoreVersion;
              const confirmationTitleId = `restore-revision-${revision.version}-title`;
              const confirmationDescriptionId = `restore-revision-${revision.version}-description`;

              return (
                <article className="revision-card" key={revision.version}>
                  <div className="revision-card__header">
                    <div>
                      <h3>Version v{revision.version}</h3>
                      <p>{formatUpdatedAt(revision.updatedAt)}</p>
                    </div>

                    {isCurrent ? (
                      <span className="revision-badge">Current</span>
                    ) : (
                      <div className="detail-actions detail-actions--inline">
                        <button
                          aria-label={`Compare version v${revision.version} with current`}
                          className="ghost-button"
                          type="button"
                          onClick={() => onCompareRevision(revision)}
                        >
                          Compare with current
                        </button>
                        {!isConfirmingRestore ? (
                          <button
                            className="ghost-button"
                            type="button"
                            onClick={() =>
                              setPendingRestoreVersion(revision.version)
                            }
                          >
                            Restore as current
                          </button>
                        ) : null}
                      </div>
                    )}
                  </div>

                  {isConfirmingRestore ? (
                    <div
                      aria-describedby={confirmationDescriptionId}
                      aria-labelledby={confirmationTitleId}
                      className="status-banner"
                      role="dialog"
                    >
                      <span id={confirmationTitleId}>
                        Restore version v{revision.version}?
                      </span>
                      <p
                        className="run-history-note"
                        id={confirmationDescriptionId}
                      >
                        Its content will be saved as the new current version v
                        {template.version + 1}.
                      </p>
                      <div className="status-banner__actions">
                        <button
                          autoFocus
                          className="secondary-button"
                          type="button"
                          onClick={() => setPendingRestoreVersion(null)}
                        >
                          Cancel
                        </button>
                        <button
                          className="primary-button"
                          type="button"
                          onClick={() => {
                            const restored = onRestoreRevision(
                              template.id,
                              revision.version,
                            );

                            if (restored) {
                              setPendingRestoreVersion(null);
                            }
                          }}
                        >
                          Restore version v{revision.version}
                        </button>
                      </div>
                    </div>
                  ) : null}

                  <p className="revision-card__description">
                    {revision.description}
                  </p>
                </article>
              );
            })}
          </div>
        </article>

        <article className="detail-card detail-card--full">
          <div className="detail-card__header">
            <h2>Recent run history</h2>
            <span>{recentRuns.length} recent runs</span>
          </div>

          {recentRuns.length > 0 ? (
            <div className="revision-list">
              {recentRuns.map((run) => (
                <article className="revision-card" key={run.id}>
                  <div className="revision-card__header">
                    <div>
                      <h3>Run from v{run.templateVersion}</h3>
                      <p>{formatUpdatedAt(run.createdAt)}</p>
                    </div>
                    <span className="revision-badge">Prompt snapshot</span>
                  </div>

                  <p className="revision-card__description">
                    {formatCapturedVariableCount(
                      Object.keys(run.variables).length,
                    )}
                  </p>

                  <div className="detail-actions detail-actions--inline">
                    <button
                      className="ghost-button"
                      type="button"
                      onClick={() => onOpenRunDetail(run.id)}
                    >
                      View run details
                    </button>
                  </div>
                </article>
              ))}
            </div>
          ) : (
            <div className="empty-state empty-state--compact">
              <h2>No saved runs yet</h2>
              <p>Save a prompt run from the playground to build a reusable activity trail.</p>
            </div>
          )}
        </article>
      </div>
    </section>
  );
}

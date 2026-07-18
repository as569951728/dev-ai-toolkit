import { useState } from 'react';

import { useLocalization } from '@/features/localization/localization-context';
import type {
  PromptTemplate,
  PromptTemplateRevision,
} from '@/types/prompt-template';

interface PromptTemplateRevisionHistoryProps {
  formatUpdatedAt: (updatedAt: string) => string;
  onCompareRevision: (revision: PromptTemplateRevision) => void;
  onRestoreRevision: (
    templateId: string,
    revisionVersion: PromptTemplateRevision['version'],
  ) => boolean;
  template: PromptTemplate;
}

export function PromptTemplateRevisionHistory({
  formatUpdatedAt,
  onCompareRevision,
  onRestoreRevision,
  template,
}: PromptTemplateRevisionHistoryProps) {
  const { t } = useLocalization();
  const [pendingRestoreVersion, setPendingRestoreVersion] = useState<
    PromptTemplateRevision['version'] | null
  >(null);
  const revisionHistory = [...template.revisions].sort(
    (left, right) => right.version - left.version,
  );

  return (
    <article className="detail-card detail-card--full">
      <div className="detail-card__header">
        <h2>{t('templates.revisions.title')}</h2>
        <span>
          {t('templates.revisions.count', { count: revisionHistory.length })}
        </span>
      </div>

      <div className="revision-list">
        {revisionHistory.map((revision) => {
          const isCurrent = revision.version === template.version;
          const isConfirmingRestore =
            revision.version === pendingRestoreVersion;
          const confirmationTitleId =
            `restore-revision-${revision.version}-title`;
          const confirmationDescriptionId =
            `restore-revision-${revision.version}-description`;

          return (
            <article className="revision-card" key={revision.version}>
              <div className="revision-card__header">
                <div>
                  <h3>
                    {t('templates.revisions.version', {
                      version: revision.version,
                    })}
                  </h3>
                  <p>{formatUpdatedAt(revision.updatedAt)}</p>
                </div>

                {isCurrent ? (
                  <span className="revision-badge">
                    {t('templates.revisions.current')}
                  </span>
                ) : (
                  <div className="detail-actions detail-actions--inline">
                    <button
                      aria-label={t('templates.revisions.compareLabel', {
                        version: revision.version,
                      })}
                      className="ghost-button"
                      type="button"
                      onClick={() => onCompareRevision(revision)}
                    >
                      {t('templates.revisions.compare')}
                    </button>
                    {!isConfirmingRestore ? (
                      <button
                        className="ghost-button"
                        type="button"
                        onClick={() =>
                          setPendingRestoreVersion(revision.version)
                        }
                      >
                        {t('templates.revisions.restore')}
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
                    {t('templates.revisions.confirmTitle', {
                      version: revision.version,
                    })}
                  </span>
                  <p
                    className="run-history-note"
                    id={confirmationDescriptionId}
                  >
                    {t('templates.revisions.confirmDescription', {
                      version: template.version + 1,
                    })}
                  </p>
                  <div className="status-banner__actions">
                    <button
                      autoFocus
                      className="secondary-button"
                      type="button"
                      onClick={() => setPendingRestoreVersion(null)}
                    >
                      {t('templates.revisions.cancel')}
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
                      {t('templates.revisions.confirm', {
                        version: revision.version,
                      })}
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
  );
}

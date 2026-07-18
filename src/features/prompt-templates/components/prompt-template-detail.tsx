import { useState } from 'react';

import { useLocalization } from '@/features/localization/localization-context';
import { PromptTemplateRevisionHistory } from '@/features/prompt-templates/components/prompt-template-revision-history';
import type {
  PromptTemplate,
  PromptTemplateRevision,
} from '@/types/prompt-template';
import type { PromptRunRecord } from '@/types/prompt-run';

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

function formatUpdatedAt(updatedAt: string, locale: string) {
  return new Intl.DateTimeFormat(locale, {
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
  const { language, t } = useLocalization();
  const [isConfirmingDelete, setIsConfirmingDelete] = useState(false);
  const locale = language === 'zh-CN' ? 'zh-CN' : 'en';
  const formatLocalizedDate = (date: string) => formatUpdatedAt(date, locale);

  return (
    <section className="panel">
      <div className="panel__header">
        <div>
          <p className="eyebrow">{t('templates.detail.eyebrow')}</p>
          <h1>{template.name}</h1>
          <p className="panel__summary">{template.description}</p>
        </div>

        <div className="detail-actions">
          <button className="ghost-button" type="button" onClick={onBack}>
            {t('templates.detail.back')}
          </button>
          {!template.archivedAt ? (
            <button
              className="secondary-button"
              type="button"
              onClick={() => onOpenInPlayground(template.id)}
            >
              {t('templates.detail.playground')}
            </button>
          ) : null}
          <button
            className="secondary-button"
            type="button"
            onClick={() => onOpenRunHistory(template.id)}
          >
            {t('templates.detail.runs')}
          </button>
          <button
            className="secondary-button"
            type="button"
            onClick={() => onEdit(template.id)}
          >
            {t('templates.detail.edit')}
          </button>
          <button
            className="secondary-button"
            type="button"
            onClick={() => onDuplicate(template.id)}
          >
            {t('templates.detail.duplicate')}
          </button>
          {template.archivedAt ? (
            <button
              className="secondary-button"
              type="button"
              onClick={() => onRestoreArchive(template.id)}
            >
              {t('templates.detail.restore')}
            </button>
          ) : (
            <button
              className="secondary-button"
              type="button"
              onClick={() => onArchive(template.id)}
            >
              {t('templates.detail.archive')}
            </button>
          )}
          {isConfirmingDelete ? (
            <>
              <span className="run-history-note">
                {t('templates.detail.deleteWarning')}
              </span>
              <button
                className="danger-button"
                type="button"
                onClick={() => onDelete(template.id)}
              >
                {t('templates.detail.confirmDelete')}
              </button>
              <button
                autoFocus
                className="ghost-button"
                type="button"
                onClick={() => setIsConfirmingDelete(false)}
              >
                {t('templates.detail.cancel')}
              </button>
            </>
          ) : (
            <button
              className="danger-button"
              type="button"
              onClick={() => setIsConfirmingDelete(true)}
            >
              {t('templates.detail.delete')}
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
            <h2>{t('templates.detail.metadata')}</h2>
            <span>
              {t('templates.detail.updated', {
                date: formatLocalizedDate(template.updatedAt),
              })}
            </span>
          </div>

          <p className="detail-card__version">
            {t('templates.detail.currentVersion', {
              version: template.version,
            })}
          </p>
          {template.archivedAt ? (
            <p className="detail-card__version">
              {t('templates.detail.archived', {
                date: formatLocalizedDate(template.archivedAt),
              })}
            </p>
          ) : null}

          <div className="tag-list" aria-label={t('templates.card.tags')}>
            {template.tags.map((tag) => (
              <span className="tag" key={tag}>
                {tag}
              </span>
            ))}
          </div>
        </article>

        <article className="detail-card">
          <div className="detail-card__header">
            <h2>{t('templates.detail.system')}</h2>
          </div>
          <pre className="prompt-preview prompt-text-output">{template.systemPrompt}</pre>
        </article>

        <article className="detail-card detail-card--full">
          <div className="detail-card__header">
            <h2>{t('templates.detail.user')}</h2>
          </div>
          <pre className="prompt-preview prompt-text-output">{template.userPrompt}</pre>
        </article>

        <PromptTemplateRevisionHistory
          formatUpdatedAt={formatLocalizedDate}
          onCompareRevision={onCompareRevision}
          onRestoreRevision={onRestoreRevision}
          template={template}
        />

        <article className="detail-card detail-card--full">
          <div className="detail-card__header">
            <h2>{t('templates.detail.recentRuns')}</h2>
            <span>
              {t('templates.detail.recentRunCount', {
                count: recentRuns.length,
              })}
            </span>
          </div>

          {recentRuns.length > 0 ? (
            <div className="revision-list">
              {recentRuns.map((run) => (
                <article className="revision-card" key={run.id}>
                  <div className="revision-card__header">
                    <div>
                      <h3>
                        {t('templates.detail.runVersion', {
                          version: run.templateVersion,
                        })}
                      </h3>
                      <p>{formatLocalizedDate(run.createdAt)}</p>
                    </div>
                    <span className="revision-badge">
                      {t('templates.detail.snapshot')}
                    </span>
                  </div>

                  <p className="revision-card__description">
                    {t(
                      Object.keys(run.variables).length === 1
                        ? 'templates.detail.variables.one'
                        : 'templates.detail.variables.other',
                      { count: Object.keys(run.variables).length },
                    )}
                  </p>

                  <div className="detail-actions detail-actions--inline">
                    <button
                      className="ghost-button"
                      type="button"
                      onClick={() => onOpenRunDetail(run.id)}
                    >
                      {t('templates.detail.viewRun')}
                    </button>
                  </div>
                </article>
              ))}
            </div>
          ) : (
            <div className="empty-state empty-state--compact">
              <h2>{t('templates.detail.noRuns')}</h2>
              <p>{t('templates.detail.noRunsDescription')}</p>
            </div>
          )}
        </article>
      </div>
    </section>
  );
}

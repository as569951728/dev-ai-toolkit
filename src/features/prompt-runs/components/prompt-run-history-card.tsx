import { useState } from 'react';
import { Link } from 'react-router-dom';

import { useLocalization } from '@/features/localization/localization-context';
import {
  formatCapturedVariableCount,
  formatPromptRunCreatedAt,
  getCapturedVariablePreview,
} from '@/features/prompt-runs/lib/prompt-run-display';
import {
  buildPromptRunCodeViewerPath,
  buildPromptRunDetailPath,
  buildPromptRunPlaygroundPath,
  buildPromptRunSourceDiffUrl,
  createPromptRunDetailNavigationState,
} from '@/features/prompt-runs/lib/prompt-run-links';
import { buildPromptTemplateDetailPath } from '@/features/prompt-templates/lib/prompt-template-links';
import { writeClipboardText } from '@/lib/clipboard';
import { formatPromptSections } from '@/lib/prompt-sections';
import type { PromptRunRecord } from '@/types/prompt-run';
import type { PromptRunNote } from '@/types/prompt-run-note';
import type { PromptTemplate } from '@/types/prompt-template';

interface PromptRunHistoryCardProps {
  historyPath: string;
  note: PromptRunNote | null | undefined;
  run: PromptRunRecord;
  sourceTemplate: PromptTemplate | null;
}

export function PromptRunHistoryCard({
  historyPath,
  note,
  run,
  sourceTemplate,
}: PromptRunHistoryCardProps) {
  const { language, t } = useLocalization();
  const [copyFeedback, setCopyFeedback] = useState<{
    message: string;
    tone: 'success' | 'error';
  } | null>(null);
  const variableCount = Object.keys(run.variables).length;
  const variablePreview = getCapturedVariablePreview(run.variables);
  const promptDiffUrl = buildPromptRunSourceDiffUrl({
    run,
    sourceTemplate,
  });
  const handleCopyPrompt = async () => {
    try {
      await writeClipboardText(formatPromptSections(run));
      setCopyFeedback({
        message: t('runs.card.copySuccess'),
        tone: 'success',
      });
    } catch {
      setCopyFeedback({
        message: t('runs.card.copyError'),
        tone: 'error',
      });
    }
  };

  return (
    <article className="revision-card">
      <div className="revision-card__header">
        <div>
          <h3>{run.templateName}</h3>
          <p>{formatPromptRunCreatedAt(run.createdAt, language)}</p>
        </div>

        <span className="revision-badge">
          {t('runs.card.templateVersion', { version: run.templateVersion })}
        </span>
      </div>

      <p className="revision-card__description">
        {formatCapturedVariableCount(variableCount, language)}
      </p>

      {variablePreview.entries.length > 0 ? (
        <div
          aria-label={t('runs.card.variablesLabel')}
          className="run-history-filter-list"
        >
          {variablePreview.entries.map(([name, value]) => (
            <span className="run-history-filter-chip" key={name}>
              {name}: {value}
            </span>
          ))}
          {variablePreview.remainingCount > 0 ? (
            <span className="run-history-filter-chip">
              {t(
                variablePreview.remainingCount === 1
                  ? 'runs.card.more.one'
                  : 'runs.card.more.other',
                { count: variablePreview.remainingCount },
              )}
            </span>
          ) : null}
        </div>
      ) : null}

      {note ? (
        <div className="run-history-note-summary">
          <span className="run-history-filter-chip">
            {t('runs.card.noteAttached')}
          </span>
          <p>{note.body}</p>
        </div>
      ) : null}

      {copyFeedback ? (
        <p
          className={
            copyFeedback.tone === 'error'
              ? 'status-banner status-banner--error'
              : 'status-banner'
          }
          role={copyFeedback.tone === 'error' ? 'alert' : 'status'}
        >
          {copyFeedback.message}
        </p>
      ) : null}

      <div className="detail-actions detail-actions--inline">
        <button
          className="ghost-button"
          type="button"
          onClick={() => void handleCopyPrompt()}
        >
          {t('runs.card.copy')}
        </button>
        <Link
          className="ghost-button"
          state={createPromptRunDetailNavigationState(historyPath)}
          to={buildPromptRunDetailPath(run.id)}
        >
          {t('runs.card.details')}
        </Link>
        {sourceTemplate && !sourceTemplate.archivedAt ? (
          <Link
            className="ghost-button"
            to={buildPromptRunPlaygroundPath({
              runId: run.id,
              templateId: run.templateId,
            })}
          >
            {t('runs.card.reopen')}
          </Link>
        ) : null}
        {sourceTemplate ? (
          <Link
            className="ghost-button"
            to={buildPromptTemplateDetailPath(run.templateId)}
          >
            {t('runs.card.source')}
          </Link>
        ) : (
          <span className="run-history-note">
            {t('runs.card.sourceMissing')}
          </span>
        )}
        <Link
          className="ghost-button"
          state={createPromptRunDetailNavigationState(historyPath)}
          to={buildPromptRunCodeViewerPath(run.id)}
        >
          {t('runs.card.codeViewer')}
        </Link>
        {promptDiffUrl ? (
          <Link
            className="ghost-button"
            state={createPromptRunDetailNavigationState(historyPath)}
            to={promptDiffUrl}
          >
            {t('runs.card.compare')}
          </Link>
        ) : sourceTemplate ? (
          <span className="run-history-note">
            {t('runs.card.revisionMissing', { version: run.templateVersion })}
          </span>
        ) : null}
      </div>
    </article>
  );
}

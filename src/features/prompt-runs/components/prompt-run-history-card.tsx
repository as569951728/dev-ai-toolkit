import { useState } from 'react';
import { Link } from 'react-router-dom';

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
        message: 'Full prompt copied.',
        tone: 'success',
      });
    } catch {
      setCopyFeedback({
        message: 'Failed to copy full prompt.',
        tone: 'error',
      });
    }
  };

  return (
    <article className="revision-card">
      <div className="revision-card__header">
        <div>
          <h3>{run.templateName}</h3>
          <p>{formatPromptRunCreatedAt(run.createdAt)}</p>
        </div>

        <span className="revision-badge">Template v{run.templateVersion}</span>
      </div>

      <p className="revision-card__description">
        {formatCapturedVariableCount(variableCount)}
      </p>

      {variablePreview.entries.length > 0 ? (
        <div aria-label="Captured variables" className="run-history-filter-list">
          {variablePreview.entries.map(([name, value]) => (
            <span className="run-history-filter-chip" key={name}>
              {name}: {value}
            </span>
          ))}
          {variablePreview.remainingCount > 0 ? (
            <span className="run-history-filter-chip">
              +{variablePreview.remainingCount} more{' '}
              {variablePreview.remainingCount === 1 ? 'variable' : 'variables'}
            </span>
          ) : null}
        </div>
      ) : null}

      {note ? (
        <div className="run-history-note-summary">
          <span className="run-history-filter-chip">Note attached</span>
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
          Copy full prompt
        </button>
        <Link
          className="ghost-button"
          state={createPromptRunDetailNavigationState(historyPath)}
          to={buildPromptRunDetailPath(run.id)}
        >
          View details
        </Link>
        {sourceTemplate && !sourceTemplate.archivedAt ? (
          <Link
            className="ghost-button"
            to={buildPromptRunPlaygroundPath({
              runId: run.id,
              templateId: run.templateId,
            })}
          >
            Reopen in Playground
          </Link>
        ) : null}
        {sourceTemplate ? (
          <Link
            className="ghost-button"
            to={buildPromptTemplateDetailPath(run.templateId)}
          >
            View source template
          </Link>
        ) : (
          <span className="run-history-note">
            Source template is no longer available.
          </span>
        )}
        <Link
          className="ghost-button"
          state={createPromptRunDetailNavigationState(historyPath)}
          to={buildPromptRunCodeViewerPath(run.id)}
        >
          Open saved prompts in Code Viewer
        </Link>
        {promptDiffUrl ? (
          <Link
            className="ghost-button"
            state={createPromptRunDetailNavigationState(historyPath)}
            to={promptDiffUrl}
          >
            Compare with source
          </Link>
        ) : sourceTemplate ? (
          <span className="run-history-note">
            Template v{run.templateVersion} is no longer available for
            comparison.
          </span>
        ) : null}
      </div>
    </article>
  );
}

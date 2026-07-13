import { Link } from 'react-router-dom';

import { buildCodeViewerUrl } from '@/features/code-viewer/lib/code-viewer-utils';
import {
  formatCapturedVariableCount,
  getCapturedVariablePreview,
} from '@/features/prompt-runs/lib/prompt-run-display';
import {
  buildPromptRunDetailPath,
  buildPromptRunSourceDiffUrl,
} from '@/features/prompt-runs/lib/prompt-run-links';
import { buildPromptTemplateDetailPath } from '@/features/prompt-templates/lib/prompt-template-links';
import type { PromptRunRecord } from '@/types/prompt-run';
import type { PromptRunNote } from '@/types/prompt-run-note';
import type { PromptTemplate } from '@/types/prompt-template';

interface PromptRunHistoryCardProps {
  note: PromptRunNote | null | undefined;
  run: PromptRunRecord;
  sourceTemplate: PromptTemplate | null;
}

function formatCreatedAt(createdAt: string) {
  return new Intl.DateTimeFormat('en', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  }).format(new Date(createdAt));
}

export function PromptRunHistoryCard({
  note,
  run,
  sourceTemplate,
}: PromptRunHistoryCardProps) {
  const variableCount = Object.keys(run.variables).length;
  const variablePreview = getCapturedVariablePreview(run.variables);
  const promptDiffUrl = buildPromptRunSourceDiffUrl({
    run,
    sourceTemplate,
  });

  return (
    <article className="revision-card">
      <div className="revision-card__header">
        <div>
          <h3>{run.templateName}</h3>
          <p>{formatCreatedAt(run.createdAt)}</p>
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

      <div className="detail-actions detail-actions--inline">
        <Link className="ghost-button" to={buildPromptRunDetailPath(run.id)}>
          View details
        </Link>
        {sourceTemplate && !sourceTemplate.archivedAt ? (
          <Link
            className="ghost-button"
            to={`/playground?runId=${encodeURIComponent(run.id)}&templateId=${encodeURIComponent(run.templateId)}`}
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
          to={buildCodeViewerUrl({
            left: run.systemPrompt,
            right: run.userPrompt,
            mode: 'compare',
            language: 'markdown',
          })}
        >
          Open saved prompts in Code Viewer
        </Link>
        {promptDiffUrl ? (
          <Link className="ghost-button" to={promptDiffUrl}>
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

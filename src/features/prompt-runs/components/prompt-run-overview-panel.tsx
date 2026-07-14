import { Link } from 'react-router-dom';

import { formatPromptRunCreatedAt } from '@/features/prompt-runs/lib/prompt-run-display';
import {
  buildPromptRunCodeViewerPath,
  buildPromptRunPlaygroundPath,
  buildPromptRunSourceDiffUrl,
  createPromptRunDetailNavigationState,
} from '@/features/prompt-runs/lib/prompt-run-links';
import {
  buildPromptTemplateCreatePath,
  buildPromptTemplateDetailPath,
} from '@/features/prompt-templates/lib/prompt-template-links';
import type { PromptRunRecord } from '@/types/prompt-run';
import type { PromptTemplate } from '@/types/prompt-template';

interface PromptRunOverviewPanelProps {
  historyPath: string;
  run: PromptRunRecord;
  sourceTemplate: PromptTemplate | null | undefined;
}

export function PromptRunOverviewPanel({
  historyPath,
  run,
  sourceTemplate,
}: PromptRunOverviewPanelProps) {
  const promptDiffUrl = buildPromptRunSourceDiffUrl({ run, sourceTemplate });

  return (
    <div className="playground-hero panel">
      <p className="eyebrow">Saved prompt snapshot</p>
      <h1>{run.templateName}</h1>
      <p className="panel__summary">
        Saved {formatPromptRunCreatedAt(run.createdAt)} from template v
        {run.templateVersion}.
      </p>

      <div className="detail-actions detail-actions--inline">
        <Link className="ghost-button" to={historyPath}>
          Back to Run History
        </Link>
        {sourceTemplate && !sourceTemplate.archivedAt ? (
          <Link
            className="primary-button"
            to={buildPromptRunPlaygroundPath({
              runId: run.id,
              templateId: run.templateId,
            })}
          >
            Reopen in Playground
          </Link>
        ) : null}
        {promptDiffUrl ? (
          <Link
            className="secondary-button"
            state={createPromptRunDetailNavigationState(historyPath)}
            to={promptDiffUrl}
          >
            Compare with source
          </Link>
        ) : sourceTemplate ? (
          <span className="run-history-note">
            Template v{run.templateVersion} is no longer available in local
            revision history, so source comparison is unavailable.
          </span>
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
          to={buildPromptTemplateCreatePath(run.id)}
        >
          Create template from snapshot
        </Link>
        <Link
          className="ghost-button"
          state={createPromptRunDetailNavigationState(historyPath)}
          to={buildPromptRunCodeViewerPath(run.id)}
        >
          Open saved prompts in Code Viewer
        </Link>
      </div>
    </div>
  );
}

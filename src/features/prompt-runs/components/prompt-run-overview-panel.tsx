import { Link } from 'react-router-dom';

import { useLocalization } from '@/features/localization/localization-context';
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
  const { language, t } = useLocalization();
  const promptDiffUrl = buildPromptRunSourceDiffUrl({ run, sourceTemplate });

  return (
    <div className="playground-hero panel">
      <p className="eyebrow">{t('run.overview.eyebrow')}</p>
      <h1>{run.templateName}</h1>
      <p className="panel__summary">
        {t('run.overview.saved', {
          date: formatPromptRunCreatedAt(run.createdAt, language),
          version: run.templateVersion,
        })}
      </p>

      <div className="detail-actions detail-actions--inline">
        <Link className="ghost-button" to={historyPath}>
          {t('run.back')}
        </Link>
        {sourceTemplate && !sourceTemplate.archivedAt ? (
          <Link
            className="primary-button"
            to={buildPromptRunPlaygroundPath({
              runId: run.id,
              templateId: run.templateId,
            })}
          >
            {t('run.overview.reopen')}
          </Link>
        ) : null}
        {promptDiffUrl ? (
          <Link
            className="secondary-button"
            state={createPromptRunDetailNavigationState(historyPath)}
            to={promptDiffUrl}
          >
            {t('run.overview.compare')}
          </Link>
        ) : sourceTemplate ? (
          <span className="run-history-note">
            {t('run.overview.revisionMissing', {
              version: run.templateVersion,
            })}
          </span>
        ) : null}
        {sourceTemplate ? (
          <Link
            className="ghost-button"
            to={buildPromptTemplateDetailPath(run.templateId)}
          >
            {t('run.overview.source')}
          </Link>
        ) : (
          <span className="run-history-note">
            {t('run.overview.sourceMissing')}
          </span>
        )}
        <Link
          className="ghost-button"
          to={buildPromptTemplateCreatePath(run.id)}
        >
          {t('run.overview.createTemplate')}
        </Link>
        <Link
          className="ghost-button"
          state={createPromptRunDetailNavigationState(historyPath)}
          to={buildPromptRunCodeViewerPath(run.id)}
        >
          {t('run.overview.codeViewer')}
        </Link>
      </div>
    </div>
  );
}

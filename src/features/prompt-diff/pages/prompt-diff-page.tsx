import { useEffect, useState } from 'react';
import { Link, useLocation, useSearchParams } from 'react-router-dom';

import { useLocalization } from '@/features/localization/localization-context';
import { PromptDiffEditorPanel } from '@/features/prompt-diff/components/prompt-diff-editor-panel';
import { PromptDiffSummary } from '@/features/prompt-diff/components/prompt-diff-summary';
import { PromptDiffToolbar } from '@/features/prompt-diff/components/prompt-diff-toolbar';
import {
  createPromptDiffNavigationState,
  readPromptDiffNavigationState,
} from '@/features/prompt-diff/lib/prompt-diff-navigation';
import {
  promptDiffSampleLeft,
  promptDiffSampleRight,
} from '@/features/prompt-diff/lib/prompt-diff-utils';
import { usePromptRuns } from '@/features/prompt-runs/hooks/use-prompt-runs';
import {
  buildPromptRunDetailPath,
  createPromptRunDetailNavigationState,
  getPromptRunHistoryReturnPath,
  resolvePromptRunSourceDiff,
} from '@/features/prompt-runs/lib/prompt-run-links';
import { usePromptTemplates } from '@/features/prompt-templates/hooks/use-prompt-templates';
import { writeClipboardText } from '@/lib/clipboard';

type PromptDiffWorkspaceProps = {
  initialLeftValue: string;
  initialRightValue: string;
  historyPath: string;
  loadNotice: string | null;
  sourceRun: {
    id: string;
    templateName: string;
    templateVersion: number;
  } | null;
};

type CopyFeedback = {
  message: string;
  tone: 'success' | 'error';
};

function PromptDiffWorkspace({
  initialLeftValue,
  initialRightValue,
  historyPath,
  loadNotice,
  sourceRun,
}: PromptDiffWorkspaceProps) {
  const { language, t } = useLocalization();
  const [leftValue, setLeftValue] = useState(initialLeftValue);
  const [rightValue, setRightValue] = useState(initialRightValue);
  const [copyFeedback, setCopyFeedback] = useState<CopyFeedback | null>(null);
  const handleCopy = async (label: 'left' | 'right', value: string) => {
    try {
      await writeClipboardText(value);
      const promptLabel = t(
        label === 'left' ? 'diff.copy.left' : 'diff.copy.right',
      );
      setCopyFeedback({
        message: t('diff.copy.success', { label: promptLabel }),
        tone: 'success',
      });
    } catch {
      const promptLabel = t(
        label === 'left' ? 'diff.copy.left' : 'diff.copy.right',
      );
      setCopyFeedback({
        message: t('diff.copy.error', {
          label: language === 'en' ? promptLabel.toLowerCase() : promptLabel,
        }),
        tone: 'error',
      });
    }
  };

  return (
    <section className="prompt-diff-layout">
      <div className="playground-hero panel">
        <p className="eyebrow">{t('diff.hero.eyebrow')}</p>
        <h1>{t('diff.hero.title')}</h1>
        <p className="panel__summary">{t('diff.hero.summary')}</p>
      </div>

      {loadNotice ? (
        <p className="status-banner status-banner--error" role="alert">
          {loadNotice}
        </p>
      ) : null}

      {sourceRun ? (
        <p className="status-banner" role="status">
          {t('diff.source.loaded', {
            name: sourceRun.templateName,
            version: sourceRun.templateVersion,
          })}{' '}
          <Link
            state={createPromptRunDetailNavigationState(historyPath)}
            to={buildPromptRunDetailPath(sourceRun.id)}
          >
            {t('diff.source.back')}
          </Link>
        </p>
      ) : null}

      <section className="panel prompt-diff-shell">
        <div className="code-viewer-shell__header">
          <div>
            <p className="eyebrow">{t('diff.workflow.eyebrow')}</p>
            <h2>{t('diff.workflow.title')}</h2>
          </div>
        </div>

        <PromptDiffToolbar
          onSwap={() => {
            setLeftValue(rightValue);
            setRightValue(leftValue);
          }}
          onLoadSample={() => {
            setLeftValue(promptDiffSampleLeft);
            setRightValue(promptDiffSampleRight);
          }}
          onReset={() => {
            setLeftValue('');
            setRightValue('');
          }}
          onCopyLeft={() => {
            void handleCopy('left', leftValue);
          }}
          onCopyRight={() => {
            void handleCopy('right', rightValue);
          }}
        />

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

        <div className="prompt-diff-grid">
          <PromptDiffEditorPanel
            title={t('diff.editor.original')}
            description={t('diff.editor.originalDescription')}
            value={leftValue}
            onChange={setLeftValue}
          />
          <PromptDiffEditorPanel
            title={t('diff.editor.revised')}
            description={t('diff.editor.revisedDescription')}
            value={rightValue}
            onChange={setRightValue}
          />
        </div>

        <PromptDiffSummary leftValue={leftValue} rightValue={rightValue} />
      </section>
    </section>
  );
}

export function PromptDiffPage() {
  const { t } = useLocalization();
  const location = useLocation();
  const [searchParams, setSearchParams] = useSearchParams();
  const { getRunById } = usePromptRuns();
  const { getTemplateById } = usePromptTemplates();
  const requestedRunId = searchParams.get('runId');
  const requestedRun = requestedRunId ? getRunById(requestedRunId) : undefined;
  const sourceTemplate = requestedRun
    ? getTemplateById(requestedRun.templateId)
    : null;
  const savedComparison = requestedRun
    ? resolvePromptRunSourceDiff({ run: requestedRun, sourceTemplate })
    : null;
  const navigationComparison = requestedRunId
    ? null
    : readPromptDiffNavigationState(location.state);
  const hasNavigationComparison = navigationComparison !== null;
  const historyPath = getPromptRunHistoryReturnPath(location.state);

  useEffect(() => {
    if (
      requestedRunId ||
      hasNavigationComparison ||
      (!searchParams.has('left') && !searchParams.has('right'))
    ) {
      return;
    }

    const nextSearchParams = new URLSearchParams(searchParams);
    nextSearchParams.delete('left');
    nextSearchParams.delete('right');
    setSearchParams(nextSearchParams, {
      replace: true,
      state: createPromptDiffNavigationState({
        left: searchParams.get('left') ?? promptDiffSampleLeft,
        right: searchParams.get('right') ?? promptDiffSampleRight,
      }),
    });
  }, [
    hasNavigationComparison,
    requestedRunId,
    searchParams,
    setSearchParams,
  ]);

  const initialLeftValue = savedComparison
    ? savedComparison.left
    : requestedRunId
      ? promptDiffSampleLeft
      : navigationComparison?.left ??
        searchParams.get('left') ??
        promptDiffSampleLeft;
  const initialRightValue = savedComparison
    ? savedComparison.right
    : requestedRunId
      ? promptDiffSampleRight
      : navigationComparison?.right ??
        searchParams.get('right') ??
        promptDiffSampleRight;
  const workspaceKey = navigationComparison
    ? location.key
    : searchParams.toString() || 'default-prompt-diff';
  const sourceRun =
    savedComparison && requestedRun
      ? {
          id: requestedRun.id,
          templateName: requestedRun.templateName,
          templateVersion: requestedRun.templateVersion,
        }
      : null;
  let loadNotice: string | null = null;

  if (requestedRunId && !requestedRun) {
    loadNotice = t('diff.load.runMissing');
  } else if (requestedRun && !sourceTemplate) {
    loadNotice = t('diff.load.templateMissing');
  } else if (requestedRun && !savedComparison) {
    loadNotice = t('diff.load.revisionMissing');
  }

  return (
    <PromptDiffWorkspace
      key={workspaceKey}
      initialLeftValue={initialLeftValue}
      initialRightValue={initialRightValue}
      historyPath={historyPath}
      loadNotice={loadNotice}
      sourceRun={sourceRun}
    />
  );
}

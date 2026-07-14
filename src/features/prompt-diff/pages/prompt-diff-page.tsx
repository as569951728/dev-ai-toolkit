import { useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';

import { PromptDiffEditorPanel } from '@/features/prompt-diff/components/prompt-diff-editor-panel';
import { PromptDiffSummary } from '@/features/prompt-diff/components/prompt-diff-summary';
import { PromptDiffToolbar } from '@/features/prompt-diff/components/prompt-diff-toolbar';
import {
  promptDiffSampleLeft,
  promptDiffSampleRight,
} from '@/features/prompt-diff/lib/prompt-diff-utils';
import { usePromptRuns } from '@/features/prompt-runs/hooks/use-prompt-runs';
import {
  buildPromptRunDetailPath,
  resolvePromptRunSourceDiff,
} from '@/features/prompt-runs/lib/prompt-run-links';
import { usePromptTemplates } from '@/features/prompt-templates/hooks/use-prompt-templates';
import { writeClipboardText } from '@/lib/clipboard';

type PromptDiffWorkspaceProps = {
  initialLeftValue: string;
  initialRightValue: string;
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
  loadNotice,
  sourceRun,
}: PromptDiffWorkspaceProps) {
  const [leftValue, setLeftValue] = useState(initialLeftValue);
  const [rightValue, setRightValue] = useState(initialRightValue);
  const [copyFeedback, setCopyFeedback] = useState<CopyFeedback | null>(null);
  const handleCopy = async (label: 'left' | 'right', value: string) => {
    try {
      await writeClipboardText(value);
      setCopyFeedback({
        message: `${label === 'left' ? 'Left' : 'Right'} prompt copied.`,
        tone: 'success',
      });
    } catch {
      setCopyFeedback({
        message: `Failed to copy ${label} prompt.`,
        tone: 'error',
      });
    }
  };

  return (
    <section className="prompt-diff-layout">
      <div className="playground-hero panel">
        <p className="eyebrow">Prompt Diff</p>
        <h1>Compare prompt revisions before they turn into team habits.</h1>
        <p className="panel__summary">
          Review how structure, variables, and guidance changed between two
          versions so prompt edits stay deliberate instead of accidental.
        </p>
      </div>

      {loadNotice ? (
        <p className="status-banner status-banner--error" role="alert">
          {loadNotice}
        </p>
      ) : null}

      {sourceRun ? (
        <p className="status-banner" role="status">
          Loaded {sourceRun.templateName} v{sourceRun.templateVersion} from local
          Run History.{' '}
          <Link to={buildPromptRunDetailPath(sourceRun.id)}>Back to saved run</Link>
        </p>
      ) : null}

      <section className="panel prompt-diff-shell">
        <div className="code-viewer-shell__header">
          <div>
            <p className="eyebrow">Comparison Workflow</p>
            <h2>Inspect prompt changes with variable-aware summaries</h2>
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
            title="Original prompt"
            description="Use the left side as the baseline or previous template."
            value={leftValue}
            onChange={setLeftValue}
          />
          <PromptDiffEditorPanel
            title="Revised prompt"
            description="Use the right side for the updated prompt or proposed rewrite."
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
  const [searchParams] = useSearchParams();
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
  const initialLeftValue = savedComparison
    ? savedComparison.left
    : requestedRunId
      ? promptDiffSampleLeft
      : searchParams.get('left') ?? promptDiffSampleLeft;
  const initialRightValue = savedComparison
    ? savedComparison.right
    : requestedRunId
      ? promptDiffSampleRight
      : searchParams.get('right') ?? promptDiffSampleRight;
  const workspaceKey = searchParams.toString() || 'default-prompt-diff';
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
    loadNotice =
      'The requested saved run is no longer available. Loaded the sample comparison instead.';
  } else if (requestedRun && !sourceTemplate) {
    loadNotice =
      'The source template for this saved run is no longer available. Loaded the sample comparison instead.';
  } else if (requestedRun && !savedComparison) {
    loadNotice =
      'The saved source revision is no longer available. Loaded the sample comparison instead.';
  }

  return (
    <PromptDiffWorkspace
      key={workspaceKey}
      initialLeftValue={initialLeftValue}
      initialRightValue={initialRightValue}
      loadNotice={loadNotice}
      sourceRun={sourceRun}
    />
  );
}

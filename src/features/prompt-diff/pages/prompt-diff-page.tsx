import { useState } from 'react';
import { useSearchParams } from 'react-router-dom';

import { PromptDiffEditorPanel } from '@/features/prompt-diff/components/prompt-diff-editor-panel';
import { PromptDiffSummary } from '@/features/prompt-diff/components/prompt-diff-summary';
import { PromptDiffToolbar } from '@/features/prompt-diff/components/prompt-diff-toolbar';
import {
  promptDiffSampleLeft,
  promptDiffSampleRight,
} from '@/features/prompt-diff/lib/prompt-diff-utils';
import { writeClipboardText } from '@/lib/clipboard';

type PromptDiffWorkspaceProps = {
  initialLeftValue: string;
  initialRightValue: string;
};

type CopyFeedback = {
  message: string;
  tone: 'success' | 'error';
};

function PromptDiffWorkspace({
  initialLeftValue,
  initialRightValue,
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
  const initialLeftValue = searchParams.get('left') ?? promptDiffSampleLeft;
  const initialRightValue = searchParams.get('right') ?? promptDiffSampleRight;
  const workspaceKey = searchParams.toString() || 'default-prompt-diff';

  return (
    <PromptDiffWorkspace
      key={workspaceKey}
      initialLeftValue={initialLeftValue}
      initialRightValue={initialRightValue}
    />
  );
}

import { useState } from 'react';

import { PromptDiffEditorPanel } from '@/features/prompt-diff/components/prompt-diff-editor-panel';
import { PromptDiffSummary } from '@/features/prompt-diff/components/prompt-diff-summary';
import { PromptDiffToolbar } from '@/features/prompt-diff/components/prompt-diff-toolbar';
import {
  promptDiffSampleLeft,
  promptDiffSampleRight,
} from '@/features/prompt-diff/lib/prompt-diff-utils';

async function copyToClipboard(value: string) {
  if (!navigator.clipboard) {
    throw new Error('Clipboard API unavailable.');
  }

  await navigator.clipboard.writeText(value);
}

export function PromptDiffPage() {
  const [leftValue, setLeftValue] = useState(promptDiffSampleLeft);
  const [rightValue, setRightValue] = useState(promptDiffSampleRight);

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
            void copyToClipboard(leftValue);
          }}
          onCopyRight={() => {
            void copyToClipboard(rightValue);
          }}
        />

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

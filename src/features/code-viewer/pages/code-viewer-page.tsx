import { useState } from 'react';

import { CodeEditorPanel } from '@/features/code-viewer/components/code-editor-panel';
import { CodePreviewPanel } from '@/features/code-viewer/components/code-preview-panel';
import { CodeViewerToolbar } from '@/features/code-viewer/components/code-viewer-toolbar';
import {
  codeViewerSampleLeft,
  codeViewerSampleRight,
  type CodeViewerMode,
} from '@/features/code-viewer/lib/code-viewer-utils';

async function copyToClipboard(value: string) {
  if (!navigator.clipboard) {
    throw new Error('Clipboard API unavailable.');
  }

  await navigator.clipboard.writeText(value);
}

export function CodeViewerPage() {
  const [mode, setMode] = useState<CodeViewerMode>('compare');
  const [language, setLanguage] = useState('typescript');
  const [leftValue, setLeftValue] = useState(codeViewerSampleLeft);
  const [rightValue, setRightValue] = useState(codeViewerSampleRight);

  return (
    <section className="code-viewer-layout">
      <div className="playground-hero panel">
        <p className="eyebrow">Code Output Viewer</p>
        <h1>Read AI output, code snippets, and structured text more clearly.</h1>
        <p className="panel__summary">
          Switch between single and compare views to review generated code,
          response payloads, or rewritten text in a calmer, more inspectable
          layout.
        </p>
      </div>

      <section className="panel code-viewer-shell">
        <div className="code-viewer-shell__header">
          <div>
            <p className="eyebrow">Reading Workflow</p>
            <h2>Compare or inspect output without leaving the workspace</h2>
          </div>
        </div>

        <CodeViewerToolbar
          mode={mode}
          language={language}
          onModeChange={setMode}
          onLanguageChange={setLanguage}
          onCopyLeft={() => {
            void copyToClipboard(leftValue);
          }}
          onCopyRight={() => {
            void copyToClipboard(rightValue);
          }}
          onLoadSample={() => {
            setLanguage('typescript');
            setMode('compare');
            setLeftValue(codeViewerSampleLeft);
            setRightValue(codeViewerSampleRight);
          }}
          onReset={() => {
            setLeftValue('');
            setRightValue('');
          }}
        />

        <div className="code-viewer-grid">
          <CodeEditorPanel
            title="Left input"
            description="Use the left pane for the main output or original version."
            value={leftValue}
            onChange={setLeftValue}
          />
          <CodeEditorPanel
            title="Right input"
            description="Use the right pane for a revised version, AI output, or comparison target."
            value={rightValue}
            onChange={setRightValue}
          />
        </div>

        <CodePreviewPanel
          mode={mode}
          language={language}
          leftValue={leftValue}
          rightValue={rightValue}
        />
      </section>
    </section>
  );
}

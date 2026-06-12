import { useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';

import { CodeEditorPanel } from '@/features/code-viewer/components/code-editor-panel';
import { CodePreviewPanel } from '@/features/code-viewer/components/code-preview-panel';
import { CodeViewerToolbar } from '@/features/code-viewer/components/code-viewer-toolbar';
import {
  codeViewerSampleLeft,
  codeViewerSampleRight,
  normalizeCodeViewerLanguage,
  type CodeViewerLanguage,
  type CodeViewerMode,
} from '@/features/code-viewer/lib/code-viewer-utils';
import { writeClipboardText } from '@/lib/clipboard';

type CodeViewerWorkspaceProps = {
  initialMode: CodeViewerMode;
  initialLanguage: CodeViewerLanguage;
  initialLeftValue: string;
  initialRightValue: string;
};

type CopyFeedback = {
  message: string;
  tone: 'success' | 'error';
};

function CodeViewerWorkspace({
  initialMode,
  initialLanguage,
  initialLeftValue,
  initialRightValue,
}: CodeViewerWorkspaceProps) {
  const [mode, setMode] = useState<CodeViewerMode>(initialMode);
  const [language, setLanguage] = useState(initialLanguage);
  const [leftValue, setLeftValue] = useState(initialLeftValue);
  const [rightValue, setRightValue] = useState(initialRightValue);
  const [copyFeedback, setCopyFeedback] = useState<CopyFeedback | null>(null);
  const handleCopy = async (label: 'left' | 'right', value: string) => {
    try {
      await writeClipboardText(value);
      setCopyFeedback({
        message: `${label === 'left' ? 'Left' : 'Right'} input copied.`,
        tone: 'success',
      });
    } catch {
      setCopyFeedback({
        message: `Failed to copy ${label} input.`,
        tone: 'error',
      });
    }
  };

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
            void handleCopy('left', leftValue);
          }}
          onCopyRight={() => {
            void handleCopy('right', rightValue);
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

export function CodeViewerPage() {
  const [searchParams] = useSearchParams();
  const initialMode = useMemo<CodeViewerMode>(
    () => (searchParams.get('mode') === 'single' ? 'single' : 'compare'),
    [searchParams],
  );
  const initialLanguage = searchParams.has('language')
    ? normalizeCodeViewerLanguage(searchParams.get('language'))
    : 'typescript';
  const initialLeftValue = searchParams.get('left') ?? codeViewerSampleLeft;
  const initialRightValue = searchParams.get('right') ?? codeViewerSampleRight;
  const workspaceKey = searchParams.toString() || 'default-code-viewer';

  return (
    <CodeViewerWorkspace
      key={workspaceKey}
      initialMode={initialMode}
      initialLanguage={initialLanguage}
      initialLeftValue={initialLeftValue}
      initialRightValue={initialRightValue}
    />
  );
}

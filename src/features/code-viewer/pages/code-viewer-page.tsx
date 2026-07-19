import { useEffect, useState } from 'react';
import { Link, useLocation, useSearchParams } from 'react-router-dom';

import { useLocalization } from '@/features/localization/localization-context';
import { CodeEditorPanel } from '@/features/code-viewer/components/code-editor-panel';
import { CodePreviewPanel } from '@/features/code-viewer/components/code-preview-panel';
import { CodeViewerToolbar } from '@/features/code-viewer/components/code-viewer-toolbar';
import {
  createCodeViewerNavigationState,
  readCodeViewerNavigationState,
} from '@/features/code-viewer/lib/code-viewer-navigation';
import {
  codeViewerSampleLeft,
  codeViewerSampleRight,
  normalizeCodeViewerLanguage,
  type CodeViewerLanguage,
  type CodeViewerMode,
} from '@/features/code-viewer/lib/code-viewer-utils';
import { usePromptRuns } from '@/features/prompt-runs/hooks/use-prompt-runs';
import {
  buildPromptRunDetailPath,
  createPromptRunDetailNavigationState,
  getPromptRunHistoryReturnPath,
} from '@/features/prompt-runs/lib/prompt-run-links';
import { writeClipboardText } from '@/lib/clipboard';

type CodeViewerWorkspaceProps = {
  initialMode: CodeViewerMode;
  initialLanguage: CodeViewerLanguage;
  initialLeftValue: string;
  initialRightValue: string;
  historyPath: string;
  loadNotice: string | null;
  sourceRun: {
    id: string;
    templateName: string;
  } | null;
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
  historyPath,
  loadNotice,
  sourceRun,
}: CodeViewerWorkspaceProps) {
  const { language: appLanguage, t } = useLocalization();
  const [mode, setMode] = useState<CodeViewerMode>(initialMode);
  const [language, setLanguage] = useState(initialLanguage);
  const [leftValue, setLeftValue] = useState(initialLeftValue);
  const [rightValue, setRightValue] = useState(initialRightValue);
  const [copyFeedback, setCopyFeedback] = useState<CopyFeedback | null>(null);
  const handleCopy = async (label: 'left' | 'right', value: string) => {
    try {
      await writeClipboardText(value);
      const inputLabel = t(
        label === 'left' ? 'code.copy.left' : 'code.copy.right',
      );
      setCopyFeedback({
        message: t('code.copy.success', { label: inputLabel }),
        tone: 'success',
      });
    } catch {
      const inputLabel = t(
        label === 'left' ? 'code.copy.left' : 'code.copy.right',
      );
      setCopyFeedback({
        message: t('code.copy.error', {
          label: appLanguage === 'en' ? inputLabel.toLowerCase() : inputLabel,
        }),
        tone: 'error',
      });
    }
  };

  return (
    <section className="code-viewer-layout">
      <div className="playground-hero panel">
        <p className="eyebrow">{t('code.hero.eyebrow')}</p>
        <h1>{t('code.hero.title')}</h1>
        <p className="panel__summary">{t('code.hero.summary')}</p>
      </div>

      {sourceRun ? (
        <p className="status-banner" role="status">
          {t('code.source.loaded', { name: sourceRun.templateName })}{' '}
          <Link
            state={createPromptRunDetailNavigationState(historyPath)}
            to={buildPromptRunDetailPath(sourceRun.id)}
          >
            {t('code.source.back')}
          </Link>
        </p>
      ) : loadNotice ? (
        <p className="status-banner status-banner--error" role="alert">
          {loadNotice}
        </p>
      ) : null}

      <section className="panel code-viewer-shell">
        <div className="code-viewer-shell__header">
          <div>
            <p className="eyebrow">{t('code.workflow.eyebrow')}</p>
            <h2>{t('code.workflow.title')}</h2>
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
            title={t('code.editor.left')}
            description={t('code.editor.leftDescription')}
            value={leftValue}
            onChange={setLeftValue}
          />
          <CodeEditorPanel
            title={t('code.editor.right')}
            description={t('code.editor.rightDescription')}
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
  const { t } = useLocalization();
  const location = useLocation();
  const historyPath = getPromptRunHistoryReturnPath(location.state);
  const [searchParams, setSearchParams] = useSearchParams();
  const { getRunById } = usePromptRuns();
  const requestedRunId = searchParams.get('runId');
  const requestedRun = requestedRunId
    ? getRunById(requestedRunId)
    : undefined;
  const navigationWorkspace = requestedRunId
    ? null
    : readCodeViewerNavigationState(location.state);
  const hasNavigationWorkspace = navigationWorkspace !== null;
  useEffect(() => {
    if (
      requestedRunId ||
      hasNavigationWorkspace ||
      (!searchParams.has('left') && !searchParams.has('right'))
    ) {
      return;
    }

    const nextSearchParams = new URLSearchParams(searchParams);
    nextSearchParams.delete('left');
    nextSearchParams.delete('right');
    nextSearchParams.delete('mode');
    nextSearchParams.delete('language');
    setSearchParams(nextSearchParams, {
      replace: true,
      state: createCodeViewerNavigationState({
        left: searchParams.get('left') ?? codeViewerSampleLeft,
        right: searchParams.get('right') ?? codeViewerSampleRight,
        mode: searchParams.get('mode') === 'single' ? 'single' : 'compare',
        language: searchParams.has('language')
          ? normalizeCodeViewerLanguage(searchParams.get('language'))
          : 'typescript',
      }),
    });
  }, [hasNavigationWorkspace, requestedRunId, searchParams, setSearchParams]);

  const initialMode = requestedRun
    ? 'compare'
    : navigationWorkspace?.mode ??
      (searchParams.get('mode') === 'single' ? 'single' : 'compare');
  const initialLanguage = requestedRun
    ? 'markdown'
    : navigationWorkspace?.language ??
      (searchParams.has('language')
        ? normalizeCodeViewerLanguage(searchParams.get('language'))
        : 'typescript');
  const initialLeftValue =
    requestedRun?.systemPrompt ??
    (requestedRunId
      ? codeViewerSampleLeft
      : navigationWorkspace?.left ??
        searchParams.get('left') ??
        codeViewerSampleLeft);
  const initialRightValue =
    requestedRun?.userPrompt ??
    (requestedRunId
      ? codeViewerSampleRight
      : navigationWorkspace?.right ??
        searchParams.get('right') ??
        codeViewerSampleRight);
  const workspaceKey = requestedRunId
    ? `run:${requestedRunId}`
    : navigationWorkspace
      ? location.key
      : searchParams.toString() || 'default-code-viewer';
  const sourceRun = requestedRun
    ? {
        id: requestedRun.id,
        templateName: requestedRun.templateName,
      }
    : null;
  const loadNotice =
    requestedRunId && !requestedRun ? t('code.source.missing') : null;

  return (
    <CodeViewerWorkspace
      key={workspaceKey}
      initialMode={initialMode}
      initialLanguage={initialLanguage}
      initialLeftValue={initialLeftValue}
      initialRightValue={initialRightValue}
      historyPath={historyPath}
      loadNotice={loadNotice}
      sourceRun={sourceRun}
    />
  );
}

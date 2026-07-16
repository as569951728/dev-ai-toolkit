import { useState } from 'react';
import { Link } from 'react-router-dom';

import {
  buildCurlCommand,
  buildFetchSnippet,
  summarizeRequest,
  type ApiBuilderState,
} from '@/features/api-builder/lib/api-builder-utils';
import { createCodeViewerNavigationState } from '@/features/code-viewer/lib/code-viewer-navigation';
import { writeClipboardText } from '@/lib/clipboard';

interface ApiBuilderPreviewProps {
  state: ApiBuilderState;
}

interface CopyFeedback {
  message: string;
  tone: 'success' | 'error';
}

export function ApiBuilderPreview({ state }: ApiBuilderPreviewProps) {
  const [fetchCopyLabel, setFetchCopyLabel] = useState('Copy fetch code');
  const [curlCopyLabel, setCurlCopyLabel] = useState('Copy cURL command');
  const [copyFeedback, setCopyFeedback] = useState<CopyFeedback | null>(null);
  const { requestUrl, headerCount, hasBody, isBodyOmitted, isBodyInvalid } =
    summarizeRequest(state);
  const fetchSnippet = buildFetchSnippet(state);
  const curlCommand = buildCurlCommand(state);
  const fetchCodeViewerState = createCodeViewerNavigationState({
    left: fetchSnippet,
    right: '',
    mode: 'single',
    language: 'javascript',
  });
  const curlCodeViewerState = createCodeViewerNavigationState({
    left: curlCommand,
    right: '',
    mode: 'single',
    language: 'bash',
  });

  const handleCopy = async (
    value: string,
    setLabel: (label: string) => void,
    resetLabel: string,
    feedbackLabel: string,
  ) => {
    try {
      await writeClipboardText(value);
      setLabel('Copied');
      setCopyFeedback({
        message: `${feedbackLabel} copied.`,
        tone: 'success',
      });
      window.setTimeout(() => setLabel(resetLabel), 1600);
    } catch {
      setLabel('Copy failed');
      setCopyFeedback({
        message: `Failed to copy ${feedbackLabel}.`,
        tone: 'error',
      });
      window.setTimeout(() => setLabel(resetLabel), 1600);
    }
  };

  return (
    <section className="panel api-panel">
      <div className="api-panel__header">
        <div>
          <p className="eyebrow">Preview</p>
          <h2>Inspect the generated request</h2>
        </div>
        <button
          className="secondary-button"
          type="button"
          onClick={() =>
            handleCopy(
              fetchSnippet,
              setFetchCopyLabel,
              'Copy fetch code',
              'Fetch snippet',
            )
          }
        >
          {fetchCopyLabel}
        </button>
      </div>

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

      {isBodyOmitted ? (
        <p className="status-banner" role="status">
          {state.method.toUpperCase()} requests cannot include a body in browser
          fetch. The JSON draft is kept in the form but omitted from generated
          output.
        </p>
      ) : null}

      {isBodyInvalid ? (
        <p className="status-banner status-banner--error" role="alert">
          JSON body is not valid JSON. Generated requests will send the text
          exactly as entered.
        </p>
      ) : null}

      <div className="api-preview-grid">
        <div className="metric-card metric-card--compact">
          <span className="metric-card__label">Method</span>
          <strong>{state.method}</strong>
          <p>
            {isBodyOmitted
              ? 'Request body omitted'
              : hasBody
                ? 'Includes a request body'
                : 'No request body'}
          </p>
        </div>
        <div className="metric-card metric-card--compact">
          <span className="metric-card__label">Headers</span>
          <strong>{headerCount}</strong>
          <p>Configured header entries</p>
        </div>
      </div>

      <article className="detail-card">
        <div className="detail-card__header">
          <h3>Resolved URL</h3>
        </div>
        <pre
          aria-label="Resolved request URL"
          className="prompt-preview api-output"
          tabIndex={0}
        >
          {requestUrl || 'Add a base URL to preview the final request URL.'}
        </pre>
      </article>

      <article className="detail-card">
        <div className="detail-card__header">
          <h3>Fetch snippet</h3>
          <Link
            className="ghost-button"
            state={fetchCodeViewerState}
            to="/code-viewer"
          >
            Open fetch in Code Viewer
          </Link>
        </div>
        <pre
          aria-label="Generated fetch snippet"
          className="prompt-preview api-output"
          tabIndex={0}
        >
          {fetchSnippet}
        </pre>
      </article>

      <article className="detail-card">
        <div className="detail-card__header">
          <h3>cURL command</h3>
          <div className="detail-actions">
            <Link
              className="ghost-button"
              state={curlCodeViewerState}
              to="/code-viewer"
            >
              Open cURL in Code Viewer
            </Link>
            <button
              className="ghost-button"
              type="button"
              onClick={() =>
                handleCopy(
                  curlCommand,
                  setCurlCopyLabel,
                  'Copy cURL command',
                  'cURL command',
                )
              }
            >
              {curlCopyLabel}
            </button>
          </div>
        </div>
        <pre
          aria-label="Generated cURL command"
          className="prompt-preview api-output"
          tabIndex={0}
        >
          {curlCommand}
        </pre>
      </article>
    </section>
  );
}

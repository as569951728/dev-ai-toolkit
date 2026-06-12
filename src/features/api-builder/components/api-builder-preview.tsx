import { useState } from 'react';
import { Link } from 'react-router-dom';

import {
  buildCurlCommand,
  buildFetchSnippet,
  summarizeRequest,
  type ApiBuilderState,
} from '@/features/api-builder/lib/api-builder-utils';

interface ApiBuilderPreviewProps {
  state: ApiBuilderState;
}

interface CopyFeedback {
  message: string;
  tone: 'success' | 'error';
}

async function copyToClipboard(value: string) {
  if (!navigator.clipboard) {
    throw new Error('Clipboard API unavailable.');
  }

  await navigator.clipboard.writeText(value);
}

export function ApiBuilderPreview({ state }: ApiBuilderPreviewProps) {
  const [fetchCopyLabel, setFetchCopyLabel] = useState('Copy fetch code');
  const [curlCopyLabel, setCurlCopyLabel] = useState('Copy cURL command');
  const [copyFeedback, setCopyFeedback] = useState<CopyFeedback | null>(null);
  const { requestUrl, headers, hasBody } = summarizeRequest(state);
  const fetchSnippet = buildFetchSnippet(state);
  const curlCommand = buildCurlCommand(state);
  const fetchCodeViewerUrl = `/code-viewer?${new URLSearchParams({
    left: fetchSnippet,
    mode: 'single',
    language: 'javascript',
  }).toString()}`;
  const codeViewerUrl = `/code-viewer?${new URLSearchParams({
    left: curlCommand,
    mode: 'single',
    language: 'bash',
  }).toString()}`;

  const handleCopy = async (
    value: string,
    setLabel: (label: string) => void,
    resetLabel: string,
    feedbackLabel: string,
  ) => {
    try {
      await copyToClipboard(value);
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

      <div className="api-preview-grid">
        <div className="metric-card metric-card--compact">
          <span className="metric-card__label">Method</span>
          <strong>{state.method}</strong>
          <p>{hasBody ? 'Includes a request body' : 'No request body'}</p>
        </div>
        <div className="metric-card metric-card--compact">
          <span className="metric-card__label">Headers</span>
          <strong>{Object.keys(headers).length}</strong>
          <p>Configured header entries</p>
        </div>
      </div>

      <article className="detail-card">
        <div className="detail-card__header">
          <h3>Resolved URL</h3>
        </div>
        <pre className="prompt-preview api-output">
          {requestUrl || 'Add a base URL to preview the final request URL.'}
        </pre>
      </article>

      <article className="detail-card">
        <div className="detail-card__header">
          <h3>Fetch snippet</h3>
          <Link className="ghost-button" to={fetchCodeViewerUrl}>
            Open fetch in Code Viewer
          </Link>
        </div>
        <pre className="prompt-preview api-output">{fetchSnippet}</pre>
      </article>

      <article className="detail-card">
        <div className="detail-card__header">
          <h3>cURL command</h3>
          <div className="detail-actions">
            <Link className="ghost-button" to={codeViewerUrl}>
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
        <pre className="prompt-preview api-output">{curlCommand}</pre>
      </article>
    </section>
  );
}

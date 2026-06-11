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

async function copyToClipboard(value: string) {
  if (!navigator.clipboard) {
    throw new Error('Clipboard API unavailable.');
  }

  await navigator.clipboard.writeText(value);
}

export function ApiBuilderPreview({ state }: ApiBuilderPreviewProps) {
  const [fetchCopyLabel, setFetchCopyLabel] = useState('Copy fetch code');
  const [curlCopyLabel, setCurlCopyLabel] = useState('Copy cURL command');
  const { requestUrl, headers, hasBody } = summarizeRequest(state);
  const fetchSnippet = buildFetchSnippet(state);
  const curlCommand = buildCurlCommand(state);
  const codeViewerUrl = `/code-viewer?${new URLSearchParams({
    left: curlCommand,
    mode: 'single',
    language: 'bash',
  }).toString()}`;

  const handleCopy = async (
    value: string,
    setLabel: (label: string) => void,
    resetLabel: string,
  ) => {
    try {
      await copyToClipboard(value);
      setLabel('Copied');
      window.setTimeout(() => setLabel(resetLabel), 1600);
    } catch {
      setLabel('Copy failed');
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
            handleCopy(fetchSnippet, setFetchCopyLabel, 'Copy fetch code')
          }
        >
          {fetchCopyLabel}
        </button>
      </div>

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
                handleCopy(curlCommand, setCurlCopyLabel, 'Copy cURL command')
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

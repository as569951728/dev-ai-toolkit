import { useState } from 'react';

import {
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
  const [copyLabel, setCopyLabel] = useState('Copy fetch code');
  const { requestUrl, headers, hasBody } = summarizeRequest(state);
  const fetchSnippet = buildFetchSnippet(state);

  const handleCopy = async () => {
    try {
      await copyToClipboard(fetchSnippet);
      setCopyLabel('Copied');
      window.setTimeout(() => setCopyLabel('Copy fetch code'), 1600);
    } catch {
      setCopyLabel('Copy failed');
      window.setTimeout(() => setCopyLabel('Copy fetch code'), 1600);
    }
  };

  return (
    <section className="panel api-panel">
      <div className="api-panel__header">
        <div>
          <p className="eyebrow">Preview</p>
          <h2>Inspect the generated request</h2>
        </div>
        <button className="secondary-button" type="button" onClick={handleCopy}>
          {copyLabel}
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
    </section>
  );
}

import { useState } from 'react';
import { Link } from 'react-router-dom';

import {
  buildCurlCommand,
  buildFetchSnippet,
  summarizeRequest,
  type ApiBuilderState,
} from '@/features/api-builder/lib/api-builder-utils';
import { createCodeViewerNavigationState } from '@/features/code-viewer/lib/code-viewer-navigation';
import { useLocalization } from '@/features/localization/localization-context';
import { writeClipboardText } from '@/lib/clipboard';

interface ApiBuilderPreviewProps {
  state: ApiBuilderState;
}

interface CopyFeedback {
  message: string;
  tone: 'success' | 'error';
}

type CopyStatus = 'idle' | 'copied' | 'failed';

export function ApiBuilderPreview({ state }: ApiBuilderPreviewProps) {
  const { language, t } = useLocalization();
  const [fetchCopyStatus, setFetchCopyStatus] = useState<CopyStatus>('idle');
  const [curlCopyStatus, setCurlCopyStatus] = useState<CopyStatus>('idle');
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
    setStatus: (status: CopyStatus) => void,
    feedbackLabel: string,
  ) => {
    try {
      await writeClipboardText(value);
      setStatus('copied');
      setCopyFeedback({
        message: t('api.preview.copySuccess', { label: feedbackLabel }),
        tone: 'success',
      });
      window.setTimeout(() => setStatus('idle'), 1600);
    } catch {
      setStatus('failed');
      setCopyFeedback({
        message: t('api.preview.copyError', {
          label:
            language === 'en' && feedbackLabel !== t('api.preview.curlLabel')
              ? feedbackLabel.toLowerCase()
              : feedbackLabel,
        }),
        tone: 'error',
      });
      window.setTimeout(() => setStatus('idle'), 1600);
    }
  };

  return (
    <section className="panel api-panel">
      <div className="api-panel__header">
        <div>
          <p className="eyebrow">{t('api.preview.eyebrow')}</p>
          <h2>{t('api.preview.title')}</h2>
        </div>
        <button
          className="secondary-button"
          type="button"
          onClick={() =>
            handleCopy(
              fetchSnippet,
              setFetchCopyStatus,
              t('api.preview.fetchLabel'),
            )
          }
        >
          {fetchCopyStatus === 'copied'
            ? t('api.preview.copied')
            : fetchCopyStatus === 'failed'
              ? t('api.preview.copyFailed')
              : t('api.preview.copyFetch')}
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
          {t('api.preview.bodyOmitted', {
            method: state.method.toUpperCase(),
          })}
        </p>
      ) : null}

      {isBodyInvalid ? (
        <p className="status-banner status-banner--error" role="alert">
          {t('api.preview.bodyInvalid')}
        </p>
      ) : null}

      <div className="api-preview-grid">
        <div className="metric-card metric-card--compact">
          <span className="metric-card__label">{t('api.preview.method')}</span>
          <strong>{state.method}</strong>
          <p>
            {isBodyOmitted
              ? t('api.preview.bodyOmittedShort')
              : hasBody
                ? t('api.preview.hasBody')
                : t('api.preview.noBody')}
          </p>
        </div>
        <div className="metric-card metric-card--compact">
          <span className="metric-card__label">{t('api.preview.headers')}</span>
          <strong>{headerCount}</strong>
          <p>{t('api.preview.headersDescription')}</p>
        </div>
      </div>

      <article className="detail-card">
        <div className="detail-card__header">
          <h3>{t('api.preview.url')}</h3>
        </div>
        <pre
          aria-label={t('api.preview.urlLabel')}
          className="prompt-preview api-output"
          tabIndex={0}
        >
          {requestUrl || t('api.preview.urlEmpty')}
        </pre>
      </article>

      <article className="detail-card">
        <div className="detail-card__header">
          <h3>{t('api.preview.fetch')}</h3>
          <Link
            className="ghost-button"
            state={fetchCodeViewerState}
            to="/code-viewer"
          >
            {t('api.preview.fetchOpen')}
          </Link>
        </div>
        <pre
          aria-label={t('api.preview.fetchLabelA11y')}
          className="prompt-preview api-output"
          tabIndex={0}
        >
          {fetchSnippet}
        </pre>
      </article>

      <article className="detail-card">
        <div className="detail-card__header">
          <h3>{t('api.preview.curl')}</h3>
          <div className="detail-actions">
            <Link
              className="ghost-button"
              state={curlCodeViewerState}
              to="/code-viewer"
            >
              {t('api.preview.curlOpen')}
            </Link>
            <button
              className="ghost-button"
              type="button"
              onClick={() =>
                handleCopy(
                  curlCommand,
                  setCurlCopyStatus,
                  t('api.preview.curlLabel'),
                )
              }
            >
              {curlCopyStatus === 'copied'
                ? t('api.preview.copied')
                : curlCopyStatus === 'failed'
                  ? t('api.preview.copyFailed')
                  : t('api.preview.copyCurl')}
            </button>
          </div>
        </div>
        <pre
          aria-label={t('api.preview.curlLabelA11y')}
          className="prompt-preview api-output"
          tabIndex={0}
        >
          {curlCommand}
        </pre>
      </article>
    </section>
  );
}

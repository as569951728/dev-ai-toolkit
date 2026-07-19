export type JsonValidationState = 'idle' | 'valid' | 'invalid';
export type JsonMessageTone = 'status' | 'error';

interface JsonResultPanelProps {
  value: string;
  message: string;
  validationState: JsonValidationState;
  messageTone: JsonMessageTone;
  inputCharacters: number;
  inputLines: number;
  outputCharacters: number;
  outputLines: number;
}

export function JsonResultPanel({
  value,
  message,
  validationState,
  messageTone,
  inputCharacters,
  inputLines,
  outputCharacters,
  outputLines,
}: JsonResultPanelProps) {
  const { t } = useLocalization();
  const statusLabel =
    validationState === 'valid'
      ? t('json.output.valid')
      : validationState === 'invalid'
        ? t('json.output.invalid')
        : t('json.output.idle');
  const statusClassName =
    validationState === 'valid'
      ? 'json-status json-status--valid'
      : validationState === 'invalid'
        ? 'json-status json-status--invalid'
        : 'json-status json-status--idle';
  const resultMessage =
    validationState === 'invalid'
      ? t('json.message.invalid', { message })
      : message;

  return (
    <section className="panel json-panel">
      <div className="json-panel__header">
        <div>
          <p className="eyebrow">{t('json.output.eyebrow')}</p>
          <h2>{t('json.output.title')}</h2>
        </div>
        <span className={statusClassName}>{statusLabel}</span>
      </div>

      <p
        className={
          messageTone === 'error'
            ? 'status-banner status-banner--error'
            : 'status-banner'
        }
        role={messageTone === 'error' ? 'alert' : 'status'}
      >
        {resultMessage}
      </p>

      <div className="json-metrics" aria-label={t('json.output.metrics')}>
        <div className="metric-card metric-card--compact">
          <span className="metric-card__label">{t('json.output.input')}</span>
          <strong>{inputCharacters}</strong>
          <p>{t('json.output.lines', { count: inputLines })}</p>
        </div>
        <div className="metric-card metric-card--compact">
          <span className="metric-card__label">{t('json.output.output')}</span>
          <strong>{outputCharacters}</strong>
          <p>{t('json.output.lines', { count: outputLines })}</p>
        </div>
      </div>

      <pre
        aria-label={t('json.output.label')}
        className="prompt-preview json-output"
        tabIndex={0}
      >
        {value || t('json.output.empty')}
      </pre>
    </section>
  );
}
import { useLocalization } from '@/features/localization/localization-context';

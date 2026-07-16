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
  const statusLabel =
    validationState === 'valid'
      ? 'Valid JSON'
      : validationState === 'invalid'
        ? 'Invalid JSON'
        : 'Not validated';
  const statusClassName =
    validationState === 'valid'
      ? 'json-status json-status--valid'
      : validationState === 'invalid'
        ? 'json-status json-status--invalid'
        : 'json-status json-status--idle';
  const resultMessage =
    validationState === 'invalid' ? `Invalid JSON: ${message}` : message;

  return (
    <section className="panel json-panel">
      <div className="json-panel__header">
        <div>
          <p className="eyebrow">Output</p>
          <h2>Review the result</h2>
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

      <div className="json-metrics" aria-label="JSON metrics">
        <div className="metric-card metric-card--compact">
          <span className="metric-card__label">Input</span>
          <strong>{inputCharacters}</strong>
          <p>{inputLines} lines</p>
        </div>
        <div className="metric-card metric-card--compact">
          <span className="metric-card__label">Output</span>
          <strong>{outputCharacters}</strong>
          <p>{outputLines} lines</p>
        </div>
      </div>

      <pre className="prompt-preview json-output">{value || 'No output yet.'}</pre>
    </section>
  );
}

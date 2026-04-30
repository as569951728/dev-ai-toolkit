interface JsonResultPanelProps {
  value: string;
  message: string;
  isValid: boolean;
  inputCharacters: number;
  inputLines: number;
  outputCharacters: number;
  outputLines: number;
}

export function JsonResultPanel({
  value,
  message,
  isValid,
  inputCharacters,
  inputLines,
  outputCharacters,
  outputLines,
}: JsonResultPanelProps) {
  return (
    <section className="panel json-panel">
      <div className="json-panel__header">
        <div>
          <p className="eyebrow">Output</p>
          <h2>Review the result</h2>
        </div>
        <span
          className={isValid ? 'json-status json-status--valid' : 'json-status json-status--invalid'}
        >
          {isValid ? 'Valid JSON' : 'Invalid JSON'}
        </span>
      </div>

      <p className={isValid ? 'status-banner' : 'status-banner status-banner--error'}>
        {message}
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

import {
  countCharacters,
  countLines,
  type CodeViewerMode,
} from '@/features/code-viewer/lib/code-viewer-utils';

interface CodePreviewPanelProps {
  mode: CodeViewerMode;
  language: string;
  leftValue: string;
  rightValue: string;
}

function renderWithLineNumbers(value: string) {
  const lines = value.length === 0 ? [''] : value.split('\n');

  return (
    <div className="code-block">
      {lines.map((line, index) => (
        <div className="code-block__line" key={`${index}-${line}`}>
          <span className="code-block__line-number">{index + 1}</span>
          <span className="code-block__line-content">{line || ' '}</span>
        </div>
      ))}
    </div>
  );
}

export function CodePreviewPanel({
  mode,
  language,
  leftValue,
  rightValue,
}: CodePreviewPanelProps) {
  const shouldCompare = mode === 'compare';

  return (
    <section className="panel code-panel">
      <div className="code-panel__header">
        <div>
          <p className="eyebrow">Preview</p>
          <h2>Read the output with more structure</h2>
          <p className="panel__summary">
            Use <code>{language}</code> as the current content label and switch
            between single and compare views depending on the task.
          </p>
        </div>
      </div>

      <div className="code-metrics">
        <div className="metric-card metric-card--compact">
          <span className="metric-card__label">Left pane</span>
          <strong>{countCharacters(leftValue)}</strong>
          <p>{countLines(leftValue)} lines</p>
        </div>
        <div className="metric-card metric-card--compact">
          <span className="metric-card__label">Right pane</span>
          <strong>{countCharacters(rightValue)}</strong>
          <p>{countLines(rightValue)} lines</p>
        </div>
      </div>

      <div className={shouldCompare ? 'code-compare-grid' : 'code-single-grid'}>
        <article className="detail-card">
          <div className="detail-card__header">
            <h3>{shouldCompare ? 'Left output' : 'Output'}</h3>
          </div>
          {renderWithLineNumbers(leftValue)}
        </article>

        {shouldCompare ? (
          <article className="detail-card">
            <div className="detail-card__header">
              <h3>Right output</h3>
            </div>
            {renderWithLineNumbers(rightValue)}
          </article>
        ) : null}
      </div>
    </section>
  );
}

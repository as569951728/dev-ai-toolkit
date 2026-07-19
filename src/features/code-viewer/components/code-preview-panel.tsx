import {
  countCharacters,
  countLines,
  type CodeViewerLanguage,
  type CodeViewerMode,
} from '@/features/code-viewer/lib/code-viewer-utils';
import { useLocalization } from '@/features/localization/localization-context';

interface CodePreviewPanelProps {
  mode: CodeViewerMode;
  language: CodeViewerLanguage;
  leftValue: string;
  rightValue: string;
}

function renderWithLineNumbers(value: string, emptyLabel: string) {
  if (value.length === 0) {
    return (
      <div className="code-block code-block--empty">
        <p>{emptyLabel}</p>
      </div>
    );
  }

  const lines = value.split('\n');

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
  const { t } = useLocalization();
  const shouldCompare = mode === 'compare';

  return (
    <section className="panel code-panel">
      <div className="code-panel__header">
        <div>
          <p className="eyebrow">{t('code.preview.eyebrow')}</p>
          <h2>{t('code.preview.title')}</h2>
          <p className="panel__summary">
            {t('code.preview.summary', { language })}
          </p>
        </div>
      </div>

      <div className="code-metrics">
        <div className="metric-card metric-card--compact">
          <span className="metric-card__label">{t('code.preview.leftPane')}</span>
          <strong>{countCharacters(leftValue)}</strong>
          <p>{t('code.preview.lines', { count: countLines(leftValue) })}</p>
        </div>
        <div className="metric-card metric-card--compact">
          <span className="metric-card__label">{t('code.preview.rightPane')}</span>
          <strong>{countCharacters(rightValue)}</strong>
          <p>{t('code.preview.lines', { count: countLines(rightValue) })}</p>
        </div>
      </div>

      <div className={shouldCompare ? 'code-compare-grid' : 'code-single-grid'}>
        <article className="detail-card">
          <div className="detail-card__header">
            <h3>
              {t(
                shouldCompare
                  ? 'code.preview.leftOutput'
                  : 'code.preview.output',
              )}
            </h3>
          </div>
          {renderWithLineNumbers(leftValue, t('code.preview.empty'))}
        </article>

        {shouldCompare ? (
          <article className="detail-card">
            <div className="detail-card__header">
              <h3>{t('code.preview.rightOutput')}</h3>
            </div>
            {renderWithLineNumbers(rightValue, t('code.preview.empty'))}
          </article>
        ) : null}
      </div>
    </section>
  );
}

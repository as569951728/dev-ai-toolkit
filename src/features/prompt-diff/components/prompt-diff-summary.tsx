import {
  countPromptCharacters,
  countPromptLines,
  extractPromptVariables,
  getAddedValues,
  getLineChanges,
  getRemovedValues,
  splitPromptLines,
} from '@/features/prompt-diff/lib/prompt-diff-utils';
import { useLocalization } from '@/features/localization/localization-context';

type PromptDiffSummaryProps = {
  leftValue: string;
  rightValue: string;
};

function VariableList({
  title,
  values,
  tone,
  emptyValueLabel,
  noChangesLabel,
}: {
  title: string;
  values: string[];
  tone?: 'added' | 'removed';
  emptyValueLabel?: string;
  noChangesLabel: string;
}) {
  if (values.length === 0) {
    return (
      <article className="prompt-diff-card">
        <h3>{title}</h3>
        <p>{noChangesLabel}</p>
      </article>
    );
  }

  return (
    <article className="prompt-diff-card">
      <h3>{title}</h3>
      <div className="prompt-diff-chip-list">
        {values.map((value, index) => (
          <span
            className={
              tone === 'added'
                ? 'prompt-diff-chip prompt-diff-chip--added'
                : tone === 'removed'
                  ? 'prompt-diff-chip prompt-diff-chip--removed'
                  : 'prompt-diff-chip'
            }
            key={`${index}-${value}`}
          >
            {value.trim().length === 0 ? emptyValueLabel : value}
          </span>
        ))}
      </div>
    </article>
  );
}

export function PromptDiffSummary({
  leftValue,
  rightValue,
}: PromptDiffSummaryProps) {
  const { t } = useLocalization();
  const leftVariables = extractPromptVariables(leftValue);
  const rightVariables = extractPromptVariables(rightValue);
  const addedVariables = getAddedValues(leftVariables, rightVariables);
  const removedVariables = getRemovedValues(leftVariables, rightVariables);
  const leftLines = splitPromptLines(leftValue);
  const rightLines = splitPromptLines(rightValue);
  const lineChanges = getLineChanges(leftLines, rightLines);

  return (
    <section className="prompt-diff-summary">
      <div className="code-metrics">
        <article className="metric-card">
          <span className="metric-card__label">{t('diff.metric.left')}</span>
          <strong>
            {t('diff.metric.characters', {
              count: countPromptCharacters(leftValue),
            })}
          </strong>
          <p>{t('diff.metric.lines', { count: countPromptLines(leftValue) })}</p>
        </article>
        <article className="metric-card">
          <span className="metric-card__label">{t('diff.metric.right')}</span>
          <strong>
            {t('diff.metric.characters', {
              count: countPromptCharacters(rightValue),
            })}
          </strong>
          <p>{t('diff.metric.lines', { count: countPromptLines(rightValue) })}</p>
        </article>
        <article className="metric-card">
          <span className="metric-card__label">{t('diff.metric.drift')}</span>
          <strong>
            +{addedVariables.length} / -{removedVariables.length}
          </strong>
          <p>{t('diff.metric.driftDescription')}</p>
        </article>
      </div>

      <div className="prompt-diff-summary__grid">
        <VariableList
          title={t('diff.summary.addedVariables')}
          values={addedVariables}
          tone="added"
          noChangesLabel={t('diff.summary.noChanges')}
        />
        <VariableList
          title={t('diff.summary.removedVariables')}
          values={removedVariables}
          tone="removed"
          noChangesLabel={t('diff.summary.noChanges')}
        />
        <VariableList
          title={t('diff.summary.addedLines')}
          values={lineChanges.added}
          tone="added"
          emptyValueLabel={t('diff.summary.blankLine')}
          noChangesLabel={t('diff.summary.noChanges')}
        />
        <VariableList
          title={t('diff.summary.removedLines')}
          values={lineChanges.removed}
          tone="removed"
          emptyValueLabel={t('diff.summary.blankLine')}
          noChangesLabel={t('diff.summary.noChanges')}
        />
      </div>
    </section>
  );
}

import {
  countPromptCharacters,
  countPromptLines,
  extractPromptVariables,
  getAddedValues,
  getLineChanges,
  getRemovedValues,
  splitPromptLines,
} from '@/features/prompt-diff/lib/prompt-diff-utils';

type PromptDiffSummaryProps = {
  leftValue: string;
  rightValue: string;
};

function VariableList({
  title,
  values,
  tone,
  emptyValueLabel,
}: {
  title: string;
  values: string[];
  tone?: 'added' | 'removed';
  emptyValueLabel?: string;
}) {
  if (values.length === 0) {
    return (
      <article className="prompt-diff-card">
        <h3>{title}</h3>
        <p>No changes detected.</p>
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
            {value.length === 0 ? emptyValueLabel : value}
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
          <span className="metric-card__label">Left prompt</span>
          <strong>{countPromptCharacters(leftValue)} chars</strong>
          <p>{countPromptLines(leftValue)} lines</p>
        </article>
        <article className="metric-card">
          <span className="metric-card__label">Right prompt</span>
          <strong>{countPromptCharacters(rightValue)} chars</strong>
          <p>{countPromptLines(rightValue)} lines</p>
        </article>
        <article className="metric-card">
          <span className="metric-card__label">Variable drift</span>
          <strong>
            +{addedVariables.length} / -{removedVariables.length}
          </strong>
          <p>Track placeholders before you reuse or share a prompt.</p>
        </article>
      </div>

      <div className="prompt-diff-summary__grid">
        <VariableList
          title="Added variables"
          values={addedVariables}
          tone="added"
        />
        <VariableList
          title="Removed variables"
          values={removedVariables}
          tone="removed"
        />
        <VariableList
          title="Added lines"
          values={lineChanges.added}
          tone="added"
          emptyValueLabel="(blank line)"
        />
        <VariableList
          title="Removed lines"
          values={lineChanges.removed}
          tone="removed"
          emptyValueLabel="(blank line)"
        />
      </div>
    </section>
  );
}

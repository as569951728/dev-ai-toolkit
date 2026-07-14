import { Link } from 'react-router-dom';

import {
  buildPromptRunJsonToolsPath,
  createPromptRunDetailNavigationState,
} from '@/features/prompt-runs/lib/prompt-run-links';
import type { PromptRunRecord } from '@/types/prompt-run';

interface PromptRunInputsPanelProps {
  historyPath: string;
  run: PromptRunRecord;
}

export function PromptRunInputsPanel({
  historyPath,
  run,
}: PromptRunInputsPanelProps) {
  const variableEntries = Object.entries(run.variables);

  return (
    <section className="panel">
      <div className="panel__header">
        <div>
          <p className="eyebrow">Captured variables</p>
          <h2>Run inputs</h2>
        </div>
        {variableEntries.length > 0 ? (
          <div className="panel__actions">
            <Link
              className="secondary-button"
              state={createPromptRunDetailNavigationState(historyPath)}
              to={buildPromptRunJsonToolsPath(run.id)}
            >
              Open variables in JSON Tools
            </Link>
          </div>
        ) : null}
      </div>

      {variableEntries.length > 0 ? (
        <div className="revision-list">
          {variableEntries.map(([name, value]) => (
            <article className="revision-card" key={name}>
              <div className="revision-card__header">
                <h3>{name}</h3>
              </div>
              <p className="revision-card__description">{value}</p>
            </article>
          ))}
        </div>
      ) : (
        <p className="panel__summary">
          This run did not capture any template variables.
        </p>
      )}
    </section>
  );
}

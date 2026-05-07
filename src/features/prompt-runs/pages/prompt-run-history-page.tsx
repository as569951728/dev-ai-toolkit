import { Link } from 'react-router-dom';

import { usePromptRuns } from '@/features/prompt-runs/hooks/use-prompt-runs';
import { usePromptTemplates } from '@/features/prompt-templates/hooks/use-prompt-templates';

function formatCreatedAt(createdAt: string) {
  return new Intl.DateTimeFormat('en', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  }).format(new Date(createdAt));
}

export function PromptRunHistoryPage() {
  const { runs } = usePromptRuns();
  const { getTemplateById } = usePromptTemplates();

  return (
    <section className="playground-layout">
      <div className="playground-hero panel">
        <p className="eyebrow">Prompt Run History</p>
        <h1>Review saved prompt output as reusable local activity history.</h1>
        <p className="panel__summary">
          Browse saved runs, inspect which template version produced them, and
          jump back to the source template when you want to refine the workflow.
        </p>
      </div>

      <section className="panel">
        <div className="panel__header">
          <div>
            <p className="eyebrow">Saved runs</p>
            <h2>Recent prompt runs</h2>
            <p className="panel__summary">
              Runs are stored locally and listed with their source template and
              captured variables.
            </p>
          </div>
        </div>

        {runs.length > 0 ? (
          <div className="revision-list">
            {runs.map((run) => {
              const sourceTemplate = getTemplateById(run.templateId);
              const variableCount = Object.keys(run.variables).length;

              return (
                <article className="revision-card" key={run.id}>
                  <div className="revision-card__header">
                    <div>
                      <h3>{run.templateName}</h3>
                      <p>{formatCreatedAt(run.createdAt)}</p>
                    </div>

                    <span className="revision-badge">
                      Template v{run.templateVersion}
                    </span>
                  </div>

                  <p className="revision-card__description">
                    {variableCount > 0
                      ? `${variableCount} template variables were captured in this run.`
                      : 'No template variables were captured in this run.'}
                  </p>

                  <div className="detail-actions detail-actions--inline">
                    {sourceTemplate ? (
                      <Link
                        className="ghost-button"
                        to={`/prompts/${run.templateId}`}
                      >
                        View source template
                      </Link>
                    ) : (
                      <span className="run-history-note">
                        Source template is no longer available.
                      </span>
                    )}
                    <Link
                      className="ghost-button"
                      to={`/code-viewer?left=${encodeURIComponent(run.systemPrompt)}&right=${encodeURIComponent(run.userPrompt)}&mode=compare&language=markdown`}
                    >
                      Open output in Code Viewer
                    </Link>
                  </div>
                </article>
              );
            })}
          </div>
        ) : (
          <div className="empty-state">
            <h2>No saved runs yet</h2>
            <p>
              Save a prompt run from the playground to build a reusable local
              activity trail.
            </p>
            <Link className="primary-button" to="/playground">
              Open Prompt Playground
            </Link>
          </div>
        )}
      </section>
    </section>
  );
}

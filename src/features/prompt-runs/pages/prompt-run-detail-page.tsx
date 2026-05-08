import { Link, useParams } from 'react-router-dom';

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

export function PromptRunDetailPage() {
  const { runId } = useParams();
  const { getRunById } = usePromptRuns();
  const { getTemplateById } = usePromptTemplates();

  const run = runId ? getRunById(runId) : undefined;

  if (!run) {
    return (
      <section className="panel empty-state">
        <h1>Run not found</h1>
        <p>The saved prompt run may have been removed from local storage.</p>
        <Link className="primary-button" to="/runs">
          Back to Run History
        </Link>
      </section>
    );
  }

  const sourceTemplate = getTemplateById(run.templateId);
  const variableEntries = Object.entries(run.variables);
  const codeViewerUrl =
    `/code-viewer?left=${encodeURIComponent(run.systemPrompt)}` +
    `&right=${encodeURIComponent(run.userPrompt)}` +
    '&mode=compare&language=markdown';
  const promptDiffUrl = sourceTemplate
    ? `/prompt-diff?left=${encodeURIComponent(
        `${sourceTemplate.systemPrompt}\n\n${sourceTemplate.userPrompt}`,
      )}&right=${encodeURIComponent(`${run.systemPrompt}\n\n${run.userPrompt}`)}`
    : null;

  return (
    <section className="playground-layout">
      <div className="playground-hero panel">
        <p className="eyebrow">Prompt Run Detail</p>
        <h1>{run.templateName}</h1>
        <p className="panel__summary">
          Saved {formatCreatedAt(run.createdAt)} from template v
          {run.templateVersion}.
        </p>

        <div className="detail-actions detail-actions--inline">
          <Link className="ghost-button" to="/runs">
            Back to Run History
          </Link>
          {sourceTemplate ? (
            <Link className="ghost-button" to={`/prompts/${run.templateId}`}>
              View source template
            </Link>
          ) : (
            <span className="run-history-note">
              Source template is no longer available.
            </span>
          )}
          <Link className="ghost-button" to={codeViewerUrl}>
            Open output in Code Viewer
          </Link>
          {promptDiffUrl ? (
            <Link className="ghost-button" to={promptDiffUrl}>
              Compare with source
            </Link>
          ) : null}
        </div>
      </div>

      <section className="panel">
        <div className="panel__header">
          <div>
            <p className="eyebrow">Captured variables</p>
            <h2>Run inputs</h2>
          </div>
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

      <section className="panel">
        <div className="panel__header">
          <div>
            <p className="eyebrow">Prompt output</p>
            <h2>Saved prompts</h2>
          </div>
        </div>

        <div className="code-compare-grid">
          <article>
            <h3>System prompt</h3>
            <pre className="code-block">{run.systemPrompt}</pre>
          </article>
          <article>
            <h3>User prompt</h3>
            <pre className="code-block">{run.userPrompt}</pre>
          </article>
        </div>
      </section>
    </section>
  );
}

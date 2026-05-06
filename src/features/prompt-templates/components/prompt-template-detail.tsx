import type {
  PromptTemplate,
  PromptTemplateRevision,
} from '@/types/prompt-template';
import type { PromptRunRecord } from '@/types/prompt-run';

interface PromptTemplateDetailProps {
  template: PromptTemplate;
  onBack: () => void;
  onEdit: (id: string) => void;
  onDuplicate: (id: string) => void;
  onDelete: (id: string) => void;
  onOpenInPlayground: (id: string) => void;
  onRestoreRevision: (
    templateId: string,
    revisionVersion: PromptTemplateRevision['version'],
  ) => void;
  recentRuns: PromptRunRecord[];
}

function formatUpdatedAt(updatedAt: string) {
  return new Intl.DateTimeFormat('en', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  }).format(new Date(updatedAt));
}

export function PromptTemplateDetail({
  template,
  onBack,
  onEdit,
  onDuplicate,
  onDelete,
  onOpenInPlayground,
  onRestoreRevision,
  recentRuns,
}: PromptTemplateDetailProps) {
  const revisionHistory = [...template.revisions].sort(
    (left, right) => right.version - left.version,
  );

  return (
    <section className="panel">
      <div className="panel__header">
        <div>
          <p className="eyebrow">Prompt Template</p>
          <h1>{template.name}</h1>
          <p className="panel__summary">{template.description}</p>
        </div>

        <div className="detail-actions">
          <button className="ghost-button" type="button" onClick={onBack}>
            Back to list
          </button>
          <button
            className="secondary-button"
            type="button"
            onClick={() => onOpenInPlayground(template.id)}
          >
            Open in Playground
          </button>
          <button
            className="secondary-button"
            type="button"
            onClick={() => onEdit(template.id)}
          >
            Edit
          </button>
          <button
            className="secondary-button"
            type="button"
            onClick={() => onDuplicate(template.id)}
          >
            Duplicate
          </button>
          <button
            className="danger-button"
            type="button"
            onClick={() => onDelete(template.id)}
          >
            Delete
          </button>
        </div>
      </div>

      <div className="detail-grid">
        <article className="detail-card">
          <div className="detail-card__header">
            <h2>Template metadata</h2>
            <span>Updated {formatUpdatedAt(template.updatedAt)}</span>
          </div>

          <p className="detail-card__version">Current version v{template.version}</p>

          <div className="tag-list" aria-label="Prompt tags">
            {template.tags.map((tag) => (
              <span className="tag" key={tag}>
                {tag}
              </span>
            ))}
          </div>
        </article>

        <article className="detail-card">
          <div className="detail-card__header">
            <h2>System prompt</h2>
          </div>
          <pre className="prompt-preview">{template.systemPrompt}</pre>
        </article>

        <article className="detail-card detail-card--full">
          <div className="detail-card__header">
            <h2>User prompt</h2>
          </div>
          <pre className="prompt-preview">{template.userPrompt}</pre>
        </article>

        <article className="detail-card detail-card--full">
          <div className="detail-card__header">
            <h2>Version history</h2>
            <span>{revisionHistory.length} stored revisions</span>
          </div>

          <div className="revision-list">
            {revisionHistory.map((revision) => {
              const isCurrent = revision.version === template.version;

              return (
                <article className="revision-card" key={revision.version}>
                  <div className="revision-card__header">
                    <div>
                      <h3>Version v{revision.version}</h3>
                      <p>{formatUpdatedAt(revision.updatedAt)}</p>
                    </div>

                    {isCurrent ? (
                      <span className="revision-badge">Current</span>
                    ) : (
                      <button
                        className="ghost-button"
                        type="button"
                        onClick={() => onRestoreRevision(template.id, revision.version)}
                      >
                        Restore as current
                      </button>
                    )}
                  </div>

                  <p className="revision-card__description">
                    {revision.description}
                  </p>
                </article>
              );
            })}
          </div>
        </article>

        <article className="detail-card detail-card--full">
          <div className="detail-card__header">
            <h2>Recent run history</h2>
            <span>{recentRuns.length} recent runs</span>
          </div>

          {recentRuns.length > 0 ? (
            <div className="revision-list">
              {recentRuns.map((run) => (
                <article className="revision-card" key={run.id}>
                  <div className="revision-card__header">
                    <div>
                      <h3>Run from v{run.templateVersion}</h3>
                      <p>{formatUpdatedAt(run.createdAt)}</p>
                    </div>
                    <span className="revision-badge">Saved output</span>
                  </div>

                  <p className="revision-card__description">
                    {Object.keys(run.variables).length > 0
                      ? `${Object.keys(run.variables).length} variables captured for this run.`
                      : 'No template variables were filled for this run.'}
                  </p>
                </article>
              ))}
            </div>
          ) : (
            <div className="empty-state empty-state--compact">
              <h2>No saved runs yet</h2>
              <p>Save a prompt run from the playground to build a reusable activity trail.</p>
            </div>
          )}
        </article>
      </div>
    </section>
  );
}

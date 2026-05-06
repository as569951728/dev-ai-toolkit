import type { PromptTemplate } from '@/types/prompt-template';

interface PromptTemplateDetailProps {
  template: PromptTemplate;
  onBack: () => void;
  onEdit: (id: string) => void;
  onDuplicate: (id: string) => void;
  onDelete: (id: string) => void;
  onOpenInPlayground: (id: string) => void;
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
}: PromptTemplateDetailProps) {
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
      </div>
    </section>
  );
}

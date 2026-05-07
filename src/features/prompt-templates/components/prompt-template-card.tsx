import type { PromptTemplate } from '@/types/prompt-template';

interface PromptTemplateCardProps {
  template: PromptTemplate;
  onView: (id: string) => void;
  onEdit: (id: string) => void;
  onOpenInPlayground: (id: string) => void;
  onOpenRunHistory: (id: string) => void;
}

function formatUpdatedAt(updatedAt: string) {
  return new Intl.DateTimeFormat('en', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  }).format(new Date(updatedAt));
}

function formatArchivedAt(archivedAt: string) {
  return new Intl.DateTimeFormat('en', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  }).format(new Date(archivedAt));
}

export function PromptTemplateCard({
  template,
  onView,
  onEdit,
  onOpenInPlayground,
  onOpenRunHistory,
}: PromptTemplateCardProps) {
  return (
    <article className="prompt-card">
      <div className="prompt-card__header">
        <div>
          <h3>{template.name}</h3>
          <p>{template.description}</p>
        </div>
        <div className="prompt-card__actions">
          <button
            className="ghost-button"
            type="button"
            onClick={() => onView(template.id)}
          >
            Preview
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
            onClick={() => onOpenRunHistory(template.id)}
          >
            View run history
          </button>
          <button
            className="secondary-button"
            type="button"
            onClick={() => onEdit(template.id)}
          >
            Edit
          </button>
        </div>
      </div>

      <div className="prompt-card__meta">
        <div className="prompt-card__status">
          <span>Updated {formatUpdatedAt(template.updatedAt)}</span>
          {template.archivedAt ? (
            <span className="tag tag--muted">
              Archived {formatArchivedAt(template.archivedAt)}
            </span>
          ) : null}
        </div>
        <div className="tag-list" aria-label="Prompt tags">
          {template.tags.map((tag) => (
            <span className="tag" key={tag}>
              {tag}
            </span>
          ))}
        </div>
      </div>
    </article>
  );
}

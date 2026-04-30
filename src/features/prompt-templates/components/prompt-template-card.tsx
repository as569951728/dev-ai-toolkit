import type { PromptTemplate } from '@/types/prompt-template';

interface PromptTemplateCardProps {
  template: PromptTemplate;
  onEdit: (id: string) => void;
}

function formatUpdatedAt(updatedAt: string) {
  return new Intl.DateTimeFormat('en', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  }).format(new Date(updatedAt));
}

export function PromptTemplateCard({
  template,
  onEdit,
}: PromptTemplateCardProps) {
  return (
    <article className="prompt-card">
      <div className="prompt-card__header">
        <div>
          <h3>{template.name}</h3>
          <p>{template.description}</p>
        </div>
        <button
          className="secondary-button"
          type="button"
          onClick={() => onEdit(template.id)}
        >
          Edit
        </button>
      </div>

      <div className="prompt-card__meta">
        <span>Updated {formatUpdatedAt(template.updatedAt)}</span>
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

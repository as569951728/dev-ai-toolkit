import { useLocalization } from '@/features/localization/localization-context';
import type { PromptTemplate } from '@/types/prompt-template';

interface PromptTemplateCardProps {
  template: PromptTemplate;
  onView: (id: string) => void;
  onEdit: (id: string) => void;
  onOpenInPlayground: (id: string) => void;
  onOpenRunHistory: (id: string) => void;
}

function formatDate(updatedAt: string, locale: string) {
  return new Intl.DateTimeFormat(locale, {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  }).format(new Date(updatedAt));
}

export function PromptTemplateCard({
  template,
  onView,
  onEdit,
  onOpenInPlayground,
  onOpenRunHistory,
}: PromptTemplateCardProps) {
  const { language, t } = useLocalization();
  const locale = language === 'zh-CN' ? 'zh-CN' : 'en';

  return (
    <article className="prompt-card">
      <div className="prompt-card__header">
        <div>
          <h2>{template.name}</h2>
          <p>{template.description}</p>
        </div>
        <div className="prompt-card__actions">
          <button
            className="ghost-button"
            type="button"
            onClick={() => onView(template.id)}
          >
            {t('templates.card.preview')}
          </button>
          {!template.archivedAt ? (
            <button
              className="secondary-button"
              type="button"
              onClick={() => onOpenInPlayground(template.id)}
            >
              {t('templates.card.playground')}
            </button>
          ) : null}
          <button
            className="secondary-button"
            type="button"
            onClick={() => onOpenRunHistory(template.id)}
          >
            {t('templates.card.runs')}
          </button>
          <button
            className="secondary-button"
            type="button"
            onClick={() => onEdit(template.id)}
          >
            {t('templates.card.edit')}
          </button>
        </div>
      </div>

      <div className="prompt-card__meta">
        <div className="prompt-card__status">
          <span>
            {t('templates.card.updated', {
              date: formatDate(template.updatedAt, locale),
            })}
          </span>
          {template.archivedAt ? (
            <span className="tag tag--muted">
              {t('templates.card.archived', {
                date: formatDate(template.archivedAt, locale),
              })}
            </span>
          ) : null}
        </div>
        <div className="tag-list" aria-label={t('templates.card.tags')}>
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

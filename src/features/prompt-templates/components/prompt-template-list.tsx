import { PromptTemplateEmptyState } from '@/features/prompt-templates/components/prompt-template-empty-state';
import { PromptTemplateFilters } from '@/features/prompt-templates/components/prompt-template-filters';
import type { PromptTemplate } from '@/types/prompt-template';
import type { PromptTemplateFilters as PromptTemplateFiltersValue } from '@/types/prompt-template';

import { PromptTemplateCard } from './prompt-template-card';

interface PromptTemplateListProps {
  templates: PromptTemplate[];
  tags: string[];
  filters: PromptTemplateFiltersValue;
  onCreate: () => void;
  onView: (id: string) => void;
  onEdit: (id: string) => void;
  onFiltersChange: (nextFilters: PromptTemplateFiltersValue) => void;
}

export function PromptTemplateList({
  templates,
  tags,
  filters,
  onCreate,
  onView,
  onEdit,
  onFiltersChange,
}: PromptTemplateListProps) {
  return (
    <section className="panel">
      <div className="panel__header">
        <div>
          <p className="eyebrow">Prompt Templates</p>
          <h1>Manage reusable AI prompts</h1>
          <p className="panel__summary">
            Start with local mock data today, then swap the hook to a real API
            later without changing the page structure.
          </p>
        </div>

        <button className="primary-button" type="button" onClick={onCreate}>
          New template
        </button>
      </div>

      <PromptTemplateFilters
        filters={filters}
        tags={tags}
        onFiltersChange={onFiltersChange}
      />

      {templates.length > 0 ? (
        <div className="prompt-list">
          {templates.map((template) => (
            <PromptTemplateCard
              key={template.id}
              template={template}
              onView={onView}
              onEdit={onEdit}
            />
          ))}
        </div>
      ) : (
        <PromptTemplateEmptyState onCreate={onCreate} />
      )}
    </section>
  );
}

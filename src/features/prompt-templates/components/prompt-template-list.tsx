import type { PromptTemplate } from '@/types/prompt-template';

import { PromptTemplateCard } from './prompt-template-card';

interface PromptTemplateListProps {
  templates: PromptTemplate[];
  onCreate: () => void;
  onEdit: (id: string) => void;
}

export function PromptTemplateList({
  templates,
  onCreate,
  onEdit,
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

      <div className="prompt-list">
        {templates.map((template) => (
          <PromptTemplateCard
            key={template.id}
            template={template}
            onEdit={onEdit}
          />
        ))}
      </div>
    </section>
  );
}

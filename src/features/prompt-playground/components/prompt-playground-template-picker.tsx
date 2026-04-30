import type { PromptTemplate } from '@/types/prompt-template';

interface PromptPlaygroundTemplatePickerProps {
  selectedTemplateId: string;
  templates: PromptTemplate[];
  recentTemplates: PromptTemplate[];
  onTemplateChange: (templateId: string) => void;
}

export function PromptPlaygroundTemplatePicker({
  selectedTemplateId,
  templates,
  recentTemplates,
  onTemplateChange,
}: PromptPlaygroundTemplatePickerProps) {
  return (
    <section className="panel playground-panel">
      <div className="playground-panel__header">
        <div>
          <p className="eyebrow">Template Selection</p>
          <h2>Choose a prompt template</h2>
        </div>
      </div>

      <label className="field">
        <span>Active template</span>
        <select
          value={selectedTemplateId}
          onChange={(event) => onTemplateChange(event.target.value)}
        >
          {templates.map((template) => (
            <option key={template.id} value={template.id}>
              {template.name}
            </option>
          ))}
        </select>
      </label>

      {recentTemplates.length > 0 ? (
        <div className="recent-list">
          <h3>Recently used</h3>
          <div className="recent-list__items">
            {recentTemplates.map((template) => (
              <button
                key={template.id}
                className="recent-list__item"
                type="button"
                onClick={() => onTemplateChange(template.id)}
              >
                <strong>{template.name}</strong>
                <span>{template.description}</span>
              </button>
            ))}
          </div>
        </div>
      ) : null}
    </section>
  );
}

import type { PromptTemplate } from '@/types/prompt-template';

import type { PromptPlaygroundVariable } from '@/features/prompt-playground/lib/prompt-playground-utils';

interface PromptPlaygroundVariableFormProps {
  selectedTemplate: PromptTemplate | null;
  variables: PromptPlaygroundVariable[];
  values: Record<string, string>;
  onValueChange: (key: string, value: string) => void;
}

export function PromptPlaygroundVariableForm({
  selectedTemplate,
  variables,
  values,
  onValueChange,
}: PromptPlaygroundVariableFormProps) {
  return (
    <section className="panel playground-panel">
      <div className="playground-panel__header">
        <div>
          <p className="eyebrow">Variables</p>
          <h2>Fill prompt inputs</h2>
          <p className="panel__summary">
            Variables are detected from <code>{'{{placeholder}}'}</code> tokens
            inside the selected template.
          </p>
        </div>
      </div>

      {selectedTemplate ? (
        variables.length > 0 ? (
          <form className="playground-form">
            {variables.map((variable) => (
              <label className="field" key={variable.key}>
                <span>{variable.label}</span>
                <textarea
                  rows={4}
                  value={values[variable.key] ?? ''}
                  onChange={(event) =>
                    onValueChange(variable.key, event.target.value)
                  }
                  placeholder={`Enter ${variable.label.toLowerCase()}`}
                />
              </label>
            ))}
          </form>
        ) : (
          <div className="empty-state">
            <h2>No template variables found</h2>
            <p>
              This template can still be used, but it does not contain any
              <code>{' {{variable}} '}</code> placeholders yet.
            </p>
          </div>
        )
      ) : (
        <div className="empty-state">
          <h2>No template selected</h2>
          <p>Choose a prompt template to start filling variables.</p>
        </div>
      )}
    </section>
  );
}
